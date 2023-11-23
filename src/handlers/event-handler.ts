import { CustomSocket } from '../../typings/socket-types.ts';


class EventHandler {

    [key:string]: any
    io:any
    connectedSockets:Set<string>

    constructor(dependencies:any, config:any) {
        this.io = dependencies.webSocketIOServer
        this.connectedSockets = new Set<string>();

    }

    chatMessageHandler(socket: CustomSocket, data: string):void {
        socket.broadcast.emit('chat-message', true, data); // emits to all sockets except the socket which fired the event
    }

    connectionHandler(socket: CustomSocket):void {
        
        console.log("client connected...", socket.id)
        this.connectedSockets.add(socket.id);
        this.io.emit('socket-pool-size-changed', this.connectedSockets.size) //handler should be in client code
        //assume sso gave u the details of the connected socket (like name, userid) in header
        let userInfoHeader = socket.handshake.headers['x-ms-user-info']
        //call websocketmanager to handle the rest of on socket connection processing i.e mainly joining

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







}
export default EventHandler;