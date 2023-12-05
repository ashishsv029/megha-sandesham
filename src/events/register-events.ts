// import io and add/register io specific events
// these events should use the eventHandlers defined in the other folder

import EventHandler from '../handlers/event-handler'
import { CustomSocket } from '../../typings/socket-types';

class RegisterEvents {

    [key: string]: {}
    eventHandler: EventHandler;
    io: any //TODO:- check types lib of io and copy the type declaration of io and paste here instead of any
    
    
    constructor(dependencies:any, config:any) {
        this.eventHandler = new EventHandler(dependencies, config);
        this.io = dependencies.webSocketIOServer;
    }


    register() {
        this.io.on('connection', (socket:CustomSocket):void => {
            //validate whether the connection is authenticated or not
            console.log(socket.handshake.headers)
            this.registerSocketEvents(socket)
            this.eventHandler.connectionHandler(socket)
        });
    }

    registerSocketEvents(socket:CustomSocket):void {
        socket.on('disconnect', this.eventHandler.disConnectionHandler.bind(this.eventHandler, socket)) // bind is used as we are just assigning the function defination (which will not give the associated context i.e lexical scope.. so accessing any properties defined in constructor errors.. so manuall attaching the context using bind)
        socket.on('chat-message', this.eventHandler.chatMessageHandler.bind(this.eventHandler, socket))
        socket.onAny(this.eventHandler.onAnyEventHandler.bind(this.eventHandler)) //socket.on
        socket.onAnyOutgoing(this.eventHandler.onAnyOutGoingEventHandler.bind(this.eventHandler)) //io.emit
        socket.on('create-group', this.eventHandler.createGroupHandler.bind(this.eventHandler, socket))
        socket.on('message-acks', this.eventHandler.onMessageAcknowledgements.bind(this.eventHandler, socket))
    }



}

export default RegisterEvents;


