import { Socket } from "socket.io";
import RoomManager from "./room-manager"
import IdentityManager from "./identity-manager";
import MessageManager from "./message-manager";
import {UserInfo, CallerSocketUserInfo, AssociatedRoomsOfUser} from "../../typings/handlers/event-handler-types"
import { Inject } from "typescript-ioc";
import 'dotenv/config'; //This ensures that the environment variables from the .env file are loaded into process.env
import AWS from 'aws-sdk';
import { User } from "aws-sdk/clients/budgets";

/// <reference path="../../global-types.d.ts" />
interface Room {
    [key:string]: any;
}
class WebSocketManager {

    [key:string]:{}
    private io: any
    private s3: any
    @Inject
    private roomManager:RoomManager

    @Inject
    private _identityManager: IdentityManager

    @Inject
    public messageManager: MessageManager

    constructor(dependencies:Dependencies, config:Config) {
        this.io = dependencies.webSocketIOServer
        this.s3 = new AWS.S3({
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_KEY,
            region: process.env.S3_REGION
        });
    }

    //for unit testing purpose
    get identityManager():IdentityManager {
        return this._identityManager;
    }

    async createGroup(payload:any) {
        return await this.roomManager.createRoom(payload)
    }

    updateMessageAcknowledgements(messageId:string, ackInfo?:any) {
        console.log("acked..")
        // we can also fetch status details from client, update the message's is delivered and is seen status
        // asyncly it can be executed
        // uncomment when done from a valid client and not from postmann
        this.messageManager.updateMessageAcknowledgements({
            isDelivered:true,
            deliveredAt:new Date().toISOString()
        }, messageId);
    }


    async fetchRoomsAssociatedToUser(userInfo:CallerSocketUserInfo) {
        return await this._identityManager.fetchRoomsByUserId(userInfo.id);   
    }

    // TODO :- Move to Utils class
    async fetchSignedURLOfImageFromS3(url:string):Promise<string> {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: url,
            Expires: 60 // URL expiration time in seconds
        };

        return new Promise((resolve, reject) => {
            this.s3.getSignedUrl('getObject', params, (err:any, signedUrl:string) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(signedUrl);
                }
            });
        });
        
    }

    async addUserIntoRooms(socket:Socket, userInfo:CallerSocketUserInfo) {
        const associatedRoomsOfUser = await this.fetchRoomsAssociatedToUser(userInfo);
        delete associatedRoomsOfUser.password;
        let associatedRoomIds:string[] = [];
        for(const room of associatedRoomsOfUser.associatedRooms) {
            for(const roomUser of room.associatedUsers) {

                let preSignedURL:string = ""; //any default user pic from local storage
                try {
                    preSignedURL = await this.fetchSignedURLOfImageFromS3(roomUser.profile_pic);
                } catch (err) {
                    console.log("error while fetching signed url of the room profile pic");
                }
                roomUser.profile_pic = preSignedURL
            }
            associatedRoomIds.push(room.id);
        }
        associatedRoomIds.forEach((roomId:string) => {
            socket.join(roomId);
        })
        try {
            associatedRoomsOfUser.profile_pic = await this.fetchSignedURLOfImageFromS3(associatedRoomsOfUser.profile_pic);
        } catch (err) {
            console.log("error while fetching signed url of the user profile pic");
        }
        socket.emit('response', {...associatedRoomsOfUser, response_type:'associatedRoomsOfUserInfo'})
        return associatedRoomsOfUser;
    }

    async fetchUndeliveredMessages(socket:Socket, userWithRoomsInfo:AssociatedRoomsOfUser) {
        const associatedRoomIds:string[] = userWithRoomsInfo.associatedRooms.map((room:Room) => room.id);
        const unDeliveredMessagesForUserPerRoom:any = await this.messageManager.fetchUndeliveredMessagesOfUser(associatedRoomIds)
        for(let i = 0; i < unDeliveredMessagesForUserPerRoom.length; i++) {
            let message = unDeliveredMessagesForUserPerRoom[i]
            socket.emit('undelivered-message', message, () => this.updateMessageAcknowledgements(message.id))
            //change the event value to undelivered-message and in client catch it and update count of these meesages on from user id
            // in the event handler in client, also fire a event called message-acks, just like chat-message handler
        }
    }

    enrichMessage(storedMessage:any, data:any) {
        console.log('storedMessage->', storedMessage);
        let messagePayload:any = {
            fromUser: {
                id: storedMessage.fromUser?.id || data.caller_socket_user_info?.id,
                name: storedMessage.fromUser?.name || data.caller_socket_user_info?.name
            },
            created_at: storedMessage.created_at || new Date().toISOString(),
            text: storedMessage.text || data.message,
            id: storedMessage.id,
            delivered_at: storedMessage.delivered_at || new Date().toISOString(),
            seen_at: storedMessage.seen_at,
            isUserMessage: true,
            deliverable_room_id: data.room_id,
        };
        if(data.temp_room_id) {
            messagePayload.temp_room_id = data.temp_room_id;
        }
        if(data.scheduled_time) {
            messagePayload.text = messagePayload.text + '\n' + 'will be delivered on ' + data.scheduled_time
        }
        return messagePayload;
    }

    async sendMessage(socket:Socket, data:any, ack:any) {
        if(!data.room_id) {
            socket.emit('error', 'Room id not available...');
            socket.disconnect();
            return;
        }
        let message:any =  await this.messageManager.storeMessage(data); //message gets created in db
        //ack({is_sent: true}); //emits same event back i.e socket.emit('chat-message', <list of sent arguments>)
        // there is no support of callbacks while emitting to rooms.. 
        // ideally the callbacks are only useful when the server want to talk back to same socket who fired that event.. in this case it is not possible for room
        // socket.broadcast.to(data.room_id).emit('chat-message', true, messagePayload, () => this.updateMessageAcknowledgements(message.id));
        let messagePayload:any = this.enrichMessage(message, data);
        messagePayload.deliverable_room_id = data.room_id;
        this.io.to(data.room_id).emit('chat-message', messagePayload);
    }



    /**
     * talk to identity manager and get all groups and chats associated to the userId
     * join the current socket to all the rooms
     * all message related handling
     *  persist messages along with details like message, ?roomId (can be a group or room), acknowledgement statuses 
     */
}

export default WebSocketManager