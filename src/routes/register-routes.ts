//import server object and register routes
// call the route handlers specified in the other folder
import IdentityRouteHandler from '../handlers/route-handlers/identity-route-handler'
import RoomRouteHandler from '../handlers/route-handlers/room-route-handler'
import { Express } from 'express'
/// <reference path="../../typings/global-types.d.ts" />
class RegisterRoutes {
    
    [key:string]:{}
    private app: Express //TOdo:- assign the correct type defination for app
    private identityRouteHandler:IdentityRouteHandler
    private roomRouteHandler:RoomRouteHandler
    
    constructor(dependencies:any, config:Config) {
        this.app = dependencies.app
        this.identityRouteHandler = new IdentityRouteHandler(dependencies, config);
        this.roomRouteHandler = new RoomRouteHandler(dependencies, config);
    }

    register() {
        this.app.post('/user', this.identityRouteHandler.createUser.bind(this.identityRouteHandler));
        this.app.get('/user/:userId', this.identityRouteHandler.getUser.bind(this.identityRouteHandler));
        this.app.post('/room', this.roomRouteHandler.createRoom.bind(this.roomRouteHandler));
        this.app.get('/room/:roomId/messages', this.roomRouteHandler.getMessagesOfRoom.bind(this.roomRouteHandler))
    }


}

export default RegisterRoutes