import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { CustomSocket } from '../typings/socket-types';
import { PrismaClient } from '@prisma/client'
import RegisterEvents from './events/register-events';
import RegisterRoutes from './routes/register-routes';
import { createAdapter } from "@socket.io/redis-streams-adapter"; // unlike redis-adapter which use pub sub, it uses redis streams to coordinate between multiple servers for propagating events // see keys * and MONITOR for seeing activity
import { createClient } from "redis";
import path from 'node:path';

class AppLoader {
    
    [key: string]: {}; // index signature for the current class which says the class which is nothing but an object should have any keys but values as objects
    dependencies:Dependencies
    config:Config


    constructor() {
        this.config = {
            appServerPort: 3000,
            redis: {
                connectionString: 'redis://redis:6379'//'redis://172.17.0.2:6379' //replace with localhost when starting locally
            }

        };
        this.dependencies = {};
    }

    async bootUpApp() {
        
        this.initializeHTTPServer();
        this.registerMiddlewares(); 
        await this.mountWebSocketServer();
        this.registerWSMiddlewares();
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
        let redisClient = await createClient({ url: this.config.redis.connectionString }).on('error', err => console.log('Redis Client Error', err)).connect();
        this.dependencies.webSocketIOServer = new Server(this.dependencies.httpAppServer, {
            adapter: createAdapter(redisClient) // for facilitating communication bw clients connected to multiple ws servers
          });

    }

    registerMiddlewares() {
        const app = this.dependencies.app;
        //app.use(express.static(new URL('../public', import.meta.url).pathname)); //middleware
        app.use(express.static(path.join(__dirname, 'public'))); //middleware
        app.use(express.json()) // body parser middleware
        this.dependencies.prisma = new PrismaClient();
    }

    registerWSMiddlewares() {
        const io = this.dependencies.webSocketIOServer;
        io.use((socket:CustomSocket, next:any):void=>{
            console.log('middleware');
            return next();
        }); //move to a seperate file
    }

    registerWSEvents() {
        (new RegisterEvents(this.dependencies, this.config)).register();
    }

    registerRoutes() {
        (new RegisterRoutes(this.dependencies, this.config)).register();
    }
}

export default AppLoader;