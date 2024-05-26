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
            let payload = {
                email: req.query?.email,
                name: req.query?.name
            }
            if(!payload.name || !payload.email) {
                throw new Error("Invalid Query Params");

            }
            console.log(payload)
            const fetchedUser = await this.identityManager.fetchUserByEmailIdAndName(payload);
            res.status(200).json(fetchedUser)
        } catch(err) {
            console.log("err--", err)
            res.status(400).send('Invalid Request - ' + JSON.stringify(err))
        }
    }

    async getUserByName(req: Request, res: Response) {
        if(!req.params?.name) {
            throw new Error("Invalid Path Params");
        }
        let payload = {
            name: req.params?.name
        };
        try {
            const fetchedUser = await this.identityManager.getUserByName(payload);
            res.status(200).json(fetchedUser)
        } catch (err) {
            console.log("err--", err)
            res.status(400).send('Invalid Request - ' + JSON.stringify(err))
        }

    }

    // Moving this to Spring Boot project
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