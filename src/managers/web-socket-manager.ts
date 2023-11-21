import { Server } from 'socket.io';

export default (server:any) => {
    return new Server(server);
}