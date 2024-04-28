import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { CustomSocket } from '../typings/socket-types';
import { PrismaClient } from '@prisma/client'
import RegisterEvents from './events/register-events';
import RegisterRoutes from './routes/register-routes';
import { createAdapter } from "@socket.io/redis-streams-adapter"; // unlike redis-adapter which use pub sub, it uses redis streams to coordinate between multiple servers for propagating events // see keys * and MONITOR for seeing activity
import { createClient } from "redis";
import { Container, Scope } from 'typescript-ioc';
import * as yaml from "js-yaml";
import path from 'node:path';
import fs from 'node:fs'
import IdentityRouteHandler from './handlers/route-handlers/identity-route-handler';
import RoomRouteHandler from './handlers/route-handlers/room-route-handler';
import IdentityManager from './managers/identity-manager';
import UserDbAccessor from './data-accessors/user-db-accessor';
import MessageDbAccessor from './data-accessors/message-db-accessor';
import RoomDbAccessor from './data-accessors/room-db-accessor';
import MessageManager from './managers/message-manager';
import RoomManager from './managers/room-manager';
import WebSocketManager from './managers/web-socket-manager';
import EventHandler from './handlers/event-handler';

class AppLoader {
    
    [key: string]: {}; // index signature for the current class which says the class which is nothing but an object should have any keys but values as objects
    dependencies:Dependencies
    config:Config


    constructor() {
        this.config = this.generateConfig();
        this.dependencies = {};
    }

    generateConfig():Config {
        //ToDo:- Add overrides for test and dev environments
        let yamlConfig = fs.readFileSync(path.resolve(__dirname, '../configs/config.yml'), 'utf8')
        return yaml.load(yamlConfig) as Config;
    }

    async bootUpApp() {
        
        this.initializeHTTPServer();
        this.registerMiddlewares(); 
        await this.mountWebSocketServer();
        this.registerWSMiddlewares();
        this.bindDependenciesToIOCContainer();
        this.registerWSEvents();
        this.registerRoutes();

    }

    initializeHTTPServer() {
        const app = express();
        const server = createServer(app);
        server.listen(this.config.appServerPort, () => {
            console.log(`server running at http://localhost:${this.config.appServerPort}`);
        });
        this.dependencies.app = app;
        this.dependencies.httpAppServer = server;
    }

    async mountWebSocketServer() {
        //while starting in local directly ensure replace 172.17.0.2 with localhost
        // ideally this is not a good way to hard code redis ip as the containers ips are dynamic..
        // so using custom netwrok is a good scalable solution
        let redisClient = await createClient({ 
            url: this.config.redis.connectionString 
        }).on('error', err => console.log('Redis Client Error', err)).connect();
        this.dependencies.webSocketIOServer = new Server(this.dependencies.httpAppServer, {
            cors: {
                origin: "http://localhost:3000" // allow requests from react app - only while local testing
            },
            adapter: createAdapter(redisClient) // for facilitating communication bw clients connected to multiple ws servers
            // Read this:- https://socket.io/docs/v4/redis-streams-adapter/ 
        });

    }

    registerMiddlewares() {
        const app = this.dependencies.app;
        //app.use(express.static(new URL('../public', import.meta.url).pathname)); //middleware
        app.use(express.static(path.join(__dirname, 'public'))); //middleware
        app.use(express.json()) // body parser middleware
        app.use(cors())
        this.dependencies.prisma = new PrismaClient();
    }

    registerWSMiddlewares() {
        const io = this.dependencies.webSocketIOServer;
        io.use((socket:CustomSocket, next:any):void=>{
            console.log('middleware');
            return next();
        }); //move to a seperate file
    }

    bindDependenciesToIOCContainer() {
        // It follows this way :- Container.bind(BaseHandler).to(ConcreteImplementation) and to is optional when we just use direct BaseHandler itself
        // so wherever abstractType is injected the instance of concreteImplementation is returned
        // The .factory method in the context of IoC containers is used to define a custom factory function that specifies how instances of a particular type should be created. It allows you to have more control over the instantiation process by providing a custom function that produces instances of the bound type.
        // In Request Scope, a new instance is created for each request or operation. whereas, In a Singelton scope, , only one instance of the type is created and reused throughout the lifetime of the container whenever requested
        Container.bind(IdentityRouteHandler).to(IdentityRouteHandler)
        .factory(() => new IdentityRouteHandler(this.dependencies, this.config))
        //.scope(Scope.Request); // in samsung we use ClassInstance caching at request level
        // using this we have clear control on dependencies
        Container.bind(RoomRouteHandler).to(RoomRouteHandler).factory(()=> new RoomRouteHandler(this.dependencies, this.config))//.scope(Scope.Request);
        Container.bind(IdentityManager).to(IdentityManager).factory(() => new IdentityManager(this.dependencies, this.config))//.scope(Scope.Request);
        Container.bind(EventHandler).factory(() => new EventHandler(this.dependencies, this.config));
        Container.bind(MessageManager).factory(() => new MessageManager(this.dependencies, this.config))//.scope(Scope.Request);
        Container.bind(RoomManager).factory(() => new RoomManager(this.dependencies, this.config))//.scope(Scope.Request);
        Container.bind(WebSocketManager).factory(() => new WebSocketManager(this.dependencies, this.config))//.scope(Scope.Request);
        Container.bind(UserDbAccessor).factory(() => new UserDbAccessor(this.dependencies, this.config))//.scope(Scope.Request);
        Container.bind(MessageDbAccessor).factory(() => new MessageDbAccessor(this.dependencies, this.config))//.scope(Scope.Request); 
        Container.bind(RoomDbAccessor).factory(() => new RoomDbAccessor(this.dependencies, this.config))//.scope(Scope.Request); 


    
    }

    registerWSEvents() {
        (new RegisterEvents(this.dependencies, this.config)).register();
    }

    registerRoutes() {
        (new RegisterRoutes(this.dependencies, this.config)).register();
    }
}

export default AppLoader;