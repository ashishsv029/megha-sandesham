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
        socket.broadcast.emit('chat-message', true, data);
    }

    connectionHandler(socket: CustomSocket):void {
        console.log("client connected...", socket.id)
        this.connectedSockets.add(socket.id);
        this.io.emit('socket-pool-size-changed', this.connectedSockets.size) //handler should be in client code
    }
    

    disConnectionHandler(socket: CustomSocket):void {
        this.connectedSockets.delete(socket.id)
        this.io.emit('socket-pool-size-changed', this.connectedSockets.size)
        console.log("client disconnected...", socket.id)
    }





}
export default EventHandler;