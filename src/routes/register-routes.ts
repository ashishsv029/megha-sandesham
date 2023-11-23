//import server object and register routes
// call the route handlers specified in the other folder
import IdentityRouteHandler from '../handlers/route-handlers/identity-route-handler.ts'

class RegisterRoutes {
    
    [key:string]:{}
    app: any //TOdo:- assign the correct type defination for app
    identityRouteHandler:IdentityRouteHandler
    constructor(dependencies:any, config:any) {
        this.app = dependencies.app
        this.identityRouteHandler = new IdentityRouteHandler(dependencies, config);
    }

    register() {
        this.app.post('/user', this.identityRouteHandler.createUser.bind(this.identityRouteHandler));
        this.app.get('/user/:userId', this.identityRouteHandler.getUser.bind(this.identityRouteHandler));
    }


}

export default RegisterRoutes