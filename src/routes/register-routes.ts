//import server object and register routes
// call the route handlers specified in the other folder
import IdentityRouteHandler from '../handlers/route-handlers/identity-route-handler'
import RoomRouteHandler from '../handlers/route-handlers/room-route-handler'
import { Express } from 'express'
import { Inject, Container } from 'typescript-ioc'
/// <reference path="../../typings/global-types.d.ts" />
class RegisterRoutes {
    
    [key:string]:{}
    private app: Express //TOdo:- assign the correct type defination for app
    
    @Inject
    private identityRouteHandler!:IdentityRouteHandler
    
    @Inject
    private roomRouteHandler!:RoomRouteHandler
    
    constructor(dependencies:any, config:Config) {
        this.app = dependencies.app
    }

    register() {
        this.app.post('/user', this.identityRouteHandler.createUser.bind(this.identityRouteHandler)); //Not used by UI -> Authentication Service APIs are called for register
        this.app.get('/user', this.identityRouteHandler.getUser.bind(this.identityRouteHandler)); //Not used by UI -> Authentication Service APIs are called for login
        this.app.post('/room', this.roomRouteHandler.createRoom.bind(this.roomRouteHandler)); // Introduce a middleware (gateway) before the route handler is called -> the gateway middleware validates the JWT and sets header
        this.app.get('/room/:roomId/messages', this.roomRouteHandler.getMessagesOfRoom.bind(this.roomRouteHandler)) // Introduce a middleware (gateway) before the route handler is called -> the gateway middleware validates the JWT and sets header
        this.app.get('/user/:name', this.identityRouteHandler.getUserByName.bind(this.identityRouteHandler)); // Introduce a middleware (gateway) before the route handler is called -> the gateway middleware validates the JWT and sets header
    }


}

export default RegisterRoutes