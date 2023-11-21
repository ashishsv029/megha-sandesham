// import io and add/register io specific events
// these events should use the eventHandlers defined in the other folder

import EventHandler from '../handlers/event-handler.ts'
import { CustomSocket } from '../../typings/socket-types.ts';

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
            this.registerSocketEvents(socket)
            this.eventHandler.connectionHandler(socket)
        });
    }

    registerSocketEvents(socket:CustomSocket):void {
        socket.on('disconnect', this.eventHandler.disConnectionHandler.bind(this.eventHandler, socket))
        socket.on('chat-message', this.eventHandler.chatMessageHandler.bind(this.eventHandler, socket))
    }



}

export default RegisterEvents;


