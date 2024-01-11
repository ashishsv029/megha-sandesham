import { Request, Response } from 'express';
import RoomManager from '../../managers/room-manager';
import MessageManager from '../../managers/message-manager';
import { Inject } from 'typescript-ioc';
class RoomRouteHandler {
    
    [key:string]:{}
    @Inject
    private roomManager:RoomManager

    @Inject
    private messageManager:MessageManager
    
    constructor(dependencies:any, config:any) {}

    getRoom(req: Request, res: Response) {
        try {

        } catch(err) {

        }
    }

    async createRoom(req: Request, res: Response) {
        
        try {
            const payload = req.body
            console.log(payload)
            const createdRoom = await this.roomManager.createRoom(payload);
            res.status(201).json(createdRoom)
        } catch (err) {
            //create a errorManager or errorHandler to handle and parse all errors
            console.log("err--", err)
            res.status(400).send('Invalid Request - ' + JSON.stringify(err))
            
        }

    }

    async getMessagesOfRoom(req: Request, res: Response) {
        try {
            const roomId = req.params.roomId;
            const roomMessages = await this.messageManager.getMessagesOfRoom(roomId);
            res.status(200).json(roomMessages)
        } catch (err) {
            console.log(err);
            res.status(400).send('Invalid Request - ' + JSON.stringify(err))

        }
    }

}

export default RoomRouteHandler;