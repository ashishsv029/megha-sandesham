import { Request, Response } from 'express';
import IdentityManager from '../../managers/identity-manager';

class IdentityRouteHandler {
    [key:string]:{}
    identityManager:IdentityManager
    constructor(dependencies:any, config:any) {
        this.identityManager = new IdentityManager(dependencies, config)
    }

    getUser(req: Request, res: Response) {
        try {

        } catch(err) {

        }
    }

    async createUser(req: Request, res: Response) {
        
        try {
            const payload = req.body
            console.log(payload)

            const createdUser = await this.identityManager.createUser(payload);
            res.status(201).json(createdUser)
        } catch (err) {
            //create a errorManager or errorHandler to handle and parse all errors
            console.log("err--", err)
            res.status(400).send('Invalid Request - ' + JSON.stringify(err))
            
        }

    }

}

export default IdentityRouteHandler;