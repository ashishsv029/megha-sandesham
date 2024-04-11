import { Socket } from "socket.io";
import RoomManager from "./room-manager"
import IdentityManager from "./identity-manager";
import MessageManager from "./message-manager";
import {UserInfo, CallerSocketUserInfo, AssociatedRoomsOfUser} from "../../typings/handlers/event-handler-types"
import { Inject } from "typescript-ioc";
/// <reference path="../../global-types.d.ts" />
interface Room {
    [key:string]: any;
}
class WebSocketManager {

    [key:string]:{}
    private io: any
    @Inject
    private roomManager:RoomManager

    @Inject
    private _identityManager: IdentityManager

    @Inject
    public messageManager: MessageManager

    constructor(dependencies:Dependencies, config:Config) {
        this.io = dependencies.webSocketIOServer
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

    async addUserIntoRooms(socket:Socket, userInfo:CallerSocketUserInfo) {
        const associatedRoomsOfUser = await this.fetchRoomsAssociatedToUser(userInfo);
        const associatedRoomIds:string[] = associatedRoomsOfUser.associatedRooms.map((room:Room) => room.id);
        associatedRoomIds.forEach((roomId:string) => {
            socket.join(roomId);
            //socket.emit('room-joined', roomId);
        })
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

    private enrichMessage(storedMessage:any, data:any) {
        console.log('storedMessage->', storedMessage);
        let messagePayload = {
            fromUser: {
                id: storedMessage.fromUser.id,
                name: storedMessage.fromUser.name
            },
            created_at: storedMessage.created_at,
            text: storedMessage.text,
            id: storedMessage.id,
            delivered_at: storedMessage.delivered_at,
            seen_at: storedMessage.seen_at,
            isUserMessage: data.caller_socket_user_info.id == storedMessage.fromUser.id ? true : false
        };
        
        return messagePayload;
    }

    async sendMessage(socket:Socket, data:any, ack:any) {
        if(!data.room_id) {
            socket.emit('error', 'Room id not available...');
            socket.disconnect();
            return;
        }
        let message:any = await this.messageManager.storeMessage(data); //message gets created in db
        //ack({is_sent: true}); //emits same event back i.e socket.emit('chat-message', <list of sent arguments>)
        // there is no support of callbacks while emitting to rooms.. 
        // ideally the callbacks are only useful when the server want to talk back to same socket who fired that event.. in this case it is not possible for room
        // socket.broadcast.to(data.room_id).emit('chat-message', true, messagePayload, () => this.updateMessageAcknowledgements(message.id));
        let messagePayload = this.enrichMessage(message, data);
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