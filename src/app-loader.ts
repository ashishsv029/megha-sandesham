import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { Dependencies } from '../typings/app-loader-types.ts';
import RegisterEvents from './events/register-events.ts';
import RegisterRoutes from './routes/register-routes.ts';

class AppLoader {
    
    [key: string]: {}; // index signature for the current class which says the class which is nothing but an object should have any keys but values as objects
    dependencies:Dependencies
    config:any


    constructor() {
        this.config = {
            appServerPort: 3000

        };
        this.dependencies = {};
    }

    bootUpApp() {
        
        this.initializeHTTPServer();
        this.registerMiddlewares(); 
        this.mountWebSocketServer();
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

    mountWebSocketServer() {
        this.dependencies.webSocketIOServer = new Server(this.dependencies.httpAppServer);

    }

    registerMiddlewares() {
        const app = this.dependencies.app;
        app.use(express.static(new URL('../public', import.meta.url).pathname)); //middleware
        app.use(express.json()) // body parser middleware
    }

    registerWSMiddlewares() {
        const io = this.dependencies.webSocketIOServer;
        io.use((socket:any, next:any)=>{
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