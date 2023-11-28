import { io } from "socket.io-client";

const socket = io('http://localhost:3000',{
    transports: ['websocket'],
    extraHeaders: {
        "x-ms-user-info": JSON.stringify({
            id: "b10bcdc6-a5ef-4eb0-944f-5e1dbdeed03e",
            name: "Aswad"
        }) 
    }
});

socket.on('chat-message', (isReceivedMessage, data, callback)=>{
    
    console.log(data)
    //update chatting container
   callback();
})