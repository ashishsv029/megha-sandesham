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
                // Todo while proxying from reverse proxy, the custom authorization header is being dropped off by the proxy server (TODO:- Investigate and Fix).. So getting the JWT value from cookie for now
                let jwt:string = socket.handshake.headers['authorization'] || socket.handshake.headers['cookie']?.split('; ')[1].split('=')[1] ||'';
                //console.log("headers = ", socket.headers);
                if( jwt == '' ){
                    console.log('jwt is empty.. so throwing..', socket.handshake.headers);

                    throw 'Invalid JWT';
                }
                const response = await fetch('http://authentication-service:3200/user/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                       jwt: jwt
                    })
                });
                if (!response.ok) {
                    console.log('response not okay.. so throwing..');
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const claimsData = await response.json();
                socket.handshake.headers['x-ms-user-info'] = JSON.stringify({
                    id: claimsData.user_id,
                    name: claimsData.user_name
                });
                console.log("claimsData - ", claimsData);
            } catch (err) {
                console.log('"Err==', err);

                socket.emit('response', {message: 'Issue while connecting'})
                return;
                //throw 'Invalid JWT'; - This makes the server crash and restart again by compose commands and the browser keeps retrying, making this to go into a infinte loop
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


