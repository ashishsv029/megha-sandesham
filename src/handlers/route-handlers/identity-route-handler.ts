import { Request, Response } from 'express';
import IdentityManager from '../../managers/identity-manager';
import {Inject} from "typescript-ioc"

class IdentityRouteHandler {
    [key:string]:{}
    
    @Inject
    private identityManager!:IdentityManager

    constructor(dependencies:any, config:any) {}

    async getUser(req: Request, res: Response) {
        try {
            const payload = {
                email: req.query.email,
                name: req.query.name
            }
            console.log(payload)
            const fetchedUser = await this.identityManager.fetchUserByEmailIdAndName(payload);
            res.status(200).json(fetchedUser)
        } catch(err) {
            console.log("err--", err)
            res.status(400).send('Invalid Request - ' + JSON.stringify(err))
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