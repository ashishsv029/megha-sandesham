import MessageDbAccessor from "../data-accessors/message-db-accessor";


class MessageManager {
    [key:string]: any
    private messageDbAccessor: MessageDbAccessor
    constructor(dependencies:any, config:any) {
        this.messageDbAccessor = new MessageDbAccessor(dependencies, config);
    }

    generateMessagePayload(payload:any) {
        let messagePayload:any = {
            text: payload.message,
            created_at: payload.time, //sent time stamp should be the message created time stamp
            fromUser: {
                connect: {id: payload.caller_socket_user_info.id}
            },
            roomMessages: {
                connect: {id: payload.room_id}
            }
        }
        // automatically prisma connects relation for room_id and from_user and populates fields from_user and room ids

        return messagePayload;
    }

    /**
     * is_sent: true, as soon as the message received to server (i.e in the handler of socket.on('chat-message'))
     * is_delivered & is_seen both are based on acknowledgements from the receiver clients (sockets) client socket.on('chat-message', handler) should send the acks 
     * @param payload 
     * @returns 
     */
    async storeMessage(payload:any) {
        //store the message in db, all fields we will have except the read receipt informatoin
        // while storing the message, set is_sent as true
        // on emitting the message, if we get ack means, set is_delivered as true, else false
        // for now by default keep is_seen as false
        const messagePayload = this.generateMessagePayload(payload);
        console.log(messagePayload)
        return await this.messageDbAccessor.insertMessage(messagePayload);
    }

    async updateMessageAcknowledgements(statusPayload:any, id:string) {
        const updatedFields:any = {
            is_delivered : statusPayload.isDelivered,
            delivered_at : statusPayload.deliveredAt
        }
        if(statusPayload.is_seen) {
            updatedFields.is_seen =  statusPayload.is_seen,
            updatedFields.seen_at = statusPayload.seenAt
        }
        return await this.messageDbAccessor.updateMessage(updatedFields, id)
    }


    async fetchUndeliveredMessagesOfUser(roomIds:string[]) {
        return await this.messageDbAccessor.getUnDeliveredMessagesBasedOnRoomIds(roomIds);
    }

    async getMessagesOfRoom(roomId:string) {
        try {
            return await this.messageDbAccessor.getMessagesOfRoom(roomId);
        } catch (error) {
            throw error;
        }
    }

}

export default MessageManager;