// import io and add/register io specific events
// these events should use the eventHandlers defined in the other folder

import EventHandler from '../handlers/event-handler'
import { CustomSocket } from '../../typings/socket-types';
import { Inject } from 'typescript-ioc';

class RegisterEvents {

    [key: string]: {}
    
    private io: any //TODO:- check types lib of io and copy the type declaration of io and paste here instead of any

    @Inject
    private eventHandler: EventHandler;
    
    
    constructor(dependencies:Dependencies, config:Config) {
        this.io = dependencies.webSocketIOServer;
    }


    register() {
        this.io.on('connection', async (socket:CustomSocket):Promise<void> => {
            //validate whether the connection is authenticated or not
            // Validate the jwt using the authentication service client
            // On successful validation, remove the authorization header and attach x-ms-user-info header in socket.handshake.headers 
            try {
                let jwt:string = socket.handshake.headers['authorization'] || '';
                if( jwt == '' ){
                    throw 'Invalid JWT';
                }
                const response = await fetch('http://localhost:3200/user/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                       jwt: jwt
                    })
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const claimsData = await response.json();
                socket.handshake.headers['x-ms-user-info'] = JSON.stringify({
                    id: claimsData.user_id,
                    name: claimsData.user_name
                });
                console.log(claimsData);
            } catch (err) {
                throw 'Invalid JWT';
            }
            console.log("Connection Established...", );
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


