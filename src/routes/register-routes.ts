//import server object and register routes
// call the route handlers specified in the other folder
import IdentityRouteHandler from '../handlers/route-handlers/identity-route-handler.ts'
import RoomRouteHandler from '../handlers/route-handlers/room-route-handler.ts'

class RegisterRoutes {
    
    [key:string]:{}
    app: any //TOdo:- assign the correct type defination for app
    identityRouteHandler:IdentityRouteHandler
    roomRouteHandler:RoomRouteHandler
    
    constructor(dependencies:any, config:any) {
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