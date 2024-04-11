import { CustomSocket } from '../../typings/socket-types';
import WebSocketManager from '../managers/web-socket-manager';
import {UserInfo, AssociatedRoomsOfUser, MessagePayload} from '../../typings/handlers/event-handler-types';
import { Inject } from 'typescript-ioc';
class EventHandler {

    [key:string]: any
    io:any
    connectedSockets:Map<string, string>

    @Inject
    webSocketManager:WebSocketManager
    constructor(dependencies:any, config:any) {
        this.io = dependencies.webSocketIOServer
        this.connectedSockets = new Map<string, string>();
    }



    async chatMessageHandler(socket: CustomSocket, data: MessagePayload, ack:any):Promise<void> {
        data = this.enrichPayloadWithHeaderInfo(socket, data);
        if(data.is_new_dm) {
            let receiverId:string = data.room_id;
            //create a new room and add current user and receiver user whose id is being sent in room_id field
            let roomPayload:any =  {
                type: 'dm',
                initial_room_members: [
                    {"id": receiverId}
                ]
            }
            if(data.caller_socket_user_info?.name && data.receiver_name) {
                roomPayload.name = `${data.caller_socket_user_info?.name}:${data.receiver_name}` //User not allowed to update his name anymore once created
            } else {
                socket.emit('error', 'Missing sender name / receiver name');
                return;
                //throw new Error('Missing sender name / receiver name'); - crashing server and restarts
            }
            let room = await this.createGroupHandler(socket,roomPayload);
            //replace receiver id in room id field with the newly created room_id
            data.room_id = room.id;
        }
        await this.webSocketManager.sendMessage(socket, data, ack);
        // if its a dm and the receiver socket is connected to the web server, the recievr socket fires a message-acks event with message id for all the fired chat-message events from sender sockets
        // so the message delivery status is controlled by client firing message-acks event
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
            //assume sso gave u the details of the connected socket (like name, userid) in header
            //ideally the below block is not correct bcs this is a handler after connection is established, ideally if no header is there connection itself should not be validated
            let userInfo:UserInfo = this.enrichPayloadWithHeaderInfo(socket);
            this.connectedSockets.set(userInfo.caller_socket_user_info.id, socket.id); 
            //console.log("CONNECTED CLIENTS = ", this.connectedSockets);
            //TODO 1:- ideally this key value pair be stored in REDIS, as stroing in memory like this breaks while scaling up the webserver pods, so we need to use a centralized storage like redis to store this info
            //TODO 2 (optional):- Ensure if there is an active socket with same user connected to server already, disconnect this new connection
            this.io.emit('socket-pool-size-changed', this.connectedSockets.size) //handler should be in client code
            const associatedRoomsOfUser:AssociatedRoomsOfUser = await this.webSocketManager.addUserIntoRooms(socket, userInfo.caller_socket_user_info);
            // fetch and emit(self) all the message sent to this socket by various other sockets (in different rooms), when this socket is not connected
            await this.webSocketManager.fetchUndeliveredMessages(socket, associatedRoomsOfUser);
            //call websocketmanager to handle the rest of on socket connection processing i.e mainly joining
        } catch (error) {
            socket.emit('error', error)
            socket.disconnect();
            
        }
        

    }
    

    disConnectionHandler(socket: CustomSocket):void {
        let userInfo:any = socket.handshake.headers['x-ms-user-info'];
        this.connectedSockets.delete(JSON.parse(userInfo).id)
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
        let roomMembersExceptAdmin = payload.initial_room_members.map((user:any) => user.id);
        payload.initial_room_members.push({id: payload.caller_socket_user_info.id}) //add the calling user also in associated members
        const group = await this.webSocketManager.createGroup(payload);
        socket.join(group.id); // the caller is joining the room
        //TODO add the group members who are connected to ws server in real time
        for(let i = 0; i<roomMembersExceptAdmin.length; i++) {
            let receiverId = roomMembersExceptAdmin[i];
            let receiverSocketId = this.connectedSockets.get(receiverId);
            let receiverSocket:CustomSocket;
            // if the reciever is  live i.e connected to websocket server
            //join the receievrSocket into the room in realtime
            // let socketsOnIo = await this.io.fetchSockets();
            // console.log("fetching required recievr socket instance" , socketsOnIo.filter((sock:any) => sock.id == receiverSocketId));
            if(receiverSocketId) {
                receiverSocket = this.io.sockets.sockets.get(receiverSocketId); //TODO:- change it to using await fetchSockets() as it works with multiple Socket.IO servers, hence the await operator.
                receiverSocket.join(group.id);
                console.log("emitting room joined event to receiver socket")
                receiverSocket.emit('room-joined', group)
            }
        }
        if(group.type == 'group') {
            socket.emit('chat-message', `you created this group ${group.name}`) // self emit
            socket.emit('chat-message', `you are the admin`) //self emit
            socket.broadcast.to(group.id).emit('chat-message', `you are added to the group by ${group.roomAdmin.name}`) //emit to all other memebers who joined the group
        }
        //socket.emit('response', group) //optional
        return group;

    }







}
export default EventHandler;