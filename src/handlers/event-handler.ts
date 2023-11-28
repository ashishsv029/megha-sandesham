import { CustomSocket } from '../../typings/socket-types.ts';
import WebSocketManager from '../managers/web-socket-manager.ts';

class EventHandler {

    [key:string]: any
    io:any
    connectedSockets:Set<string>
    webSocketManager:WebSocketManager
    constructor(dependencies:any, config:any) {
        this.io = dependencies.webSocketIOServer
        this.connectedSockets = new Set<string>();
        this.webSocketManager = new WebSocketManager(dependencies, config)

    }

    chatMessageHandler(socket: CustomSocket, data: any, ack:any):void {
        data = this.enrichPayloadWithHeaderInfo(socket, data);
        this.webSocketManager.sendMessage(socket, data, ack);
    }

    enrichPayloadWithHeaderInfo(socket:CustomSocket, payload:any = {}) {
        let userInfo:any = socket.handshake.headers['x-ms-user-info'];
        if(!userInfo) {
            throw 'Auth Header Missing...'
        }
        userInfo = JSON.parse(userInfo);
        payload.caller_socket_user_info = userInfo;
        return payload
    }

    async connectionHandler(socket: CustomSocket) {
        try {
            this.connectedSockets.add(socket.id);
            this.io.emit('socket-pool-size-changed', this.connectedSockets.size) //handler should be in client code
            //assume sso gave u the details of the connected socket (like name, userid) in header
            //ideally the below block is not correct bcs this is a handler after connection is established, ideally if no header is there connection itself should not be validated
            let userInfo = this.enrichPayloadWithHeaderInfo(socket);
            const associatedRoomsOfUser = await this.webSocketManager.addUserIntoRooms(socket, userInfo.caller_socket_user_info);
            // fetch and emit(self) all the message sent to this socket by various other sockets (in different rooms), when this socket is not connected
            await this.webSocketManager.fetchUndeliveredMessages(socket, associatedRoomsOfUser);
            //call websocketmanager to handle the rest of on socket connection processing i.e mainly joining
        } catch (error) {
            socket.emit('error', error)
            socket.disconnect();
            
        }
        

    }
    

    disConnectionHandler(socket: CustomSocket):void {
        this.connectedSockets.delete(socket.id)
        this.io.emit('socket-pool-size-changed', this.connectedSockets.size) // emit to all active sockets
        console.log("client disconnected...", socket.id)
    }

    onAnyEventHandler(eventName: string, eventValues: Object) {
        console.log(`Received Event ${eventName} with values:- ${JSON.stringify(eventValues)}`) // for socket.on() i.e for events emitted by socket
    }

    onAnyOutGoingEventHandler(eventName: string, eventValues: Object) {
        console.log(`Fired Event ${eventName} with values:- ${JSON.stringify(eventValues)}`) // for io emits from server
    }
    onMessageAcknowledgements(socket:CustomSocket, ackInfo:any) {
        this.webSocketManager.updateMessageAcknowledgements(ackInfo.message_id, ackInfo.payload)
    }

    /**
     * 
     * @param socket 
     * @param payload 
     * in payload we have group information and also initial group members list
     * store group details along with associated users in db
     * join all the users along with callerUser into the room
     * for self socket send 'you created this group' message i.e socket.emit('chat-message', '')
     * broadcast 'you are added to the group by ${caller user name}' message to all room members except self
     * socket.broadcast.to('some room').emit('chat-message', '');
     */

    async createGroupHandler(socket:CustomSocket, payload:any) {
        payload = this.enrichPayloadWithHeaderInfo(socket, payload);
        payload.initial_room_members.push({id: payload.caller_socket_user_info.id}) //add the calling user also in associated members
        const group = await this.webSocketManager.createGroup(payload);
        socket.join(group.id); // the caller is joining the room
        socket.emit('chat-message', `you created this group ${group.name}`) //self emit
        socket.emit('chat-message', `you are the admin`) //self emit
        socket.broadcast.to(group.id).emit('chat-message', `you are added to the group by ${group.roomAdmin.name}`) //emit to all other memebers who joined the group
        socket.emit('response', group) //optional
        

    }







}
export default EventHandler;