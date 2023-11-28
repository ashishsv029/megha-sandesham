const socket = io({
    transports: ['websocket'],
    extraHeaders: {
        "x-ms-user-info": JSON.stringify({
            id: "b10bcdc6-a5ef-4eb0-944f-5e1dbdeed03e",
            name: "Aswad"
        }) 
    }
});//see here as it is a client, then we always use socket as object and not io
//socket.handshake.headers = {"id":"b10bcdc6-a5ef-4eb0-944f-5e1dbdeed03e","name":"Aswad"}
//socket.connect()
const clientTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
socket.on('socket-pool-size-changed', (data)=>{
    clientTotal.innerText = `Total Online Roomies = ${data}`
})

const insertMessageInChatContainer = (isReceivedMessage, data) => {
    const messageElement = `
    <li class= ${isReceivedMessage ? "message-left" : "message-right"}>
        <p class="message">
            ${data.message}
        <span> ${data.from} ● ${moment(data.time).format('lll')}</span>
        </p>
    </li>`
    messageContainer.innerHTML = messageContainer.innerHTML + messageElement;
    scrollToBottom();
}

socket.on('chat-message', (isReceivedMessage, data, callback)=>{
    console.log(data)
    //update chatting container
    insertMessageInChatContainer(isReceivedMessage, data);
    scrollToBottom();
    console.log(callback)
    
})

socket.on('error', (data)=>{
    alert('error - '+ data)
})

const messageForm = document.getElementById('message-form');
const input = document.getElementById('message-input');
const user = document.getElementById("name-input");
messageForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    let typedMessage = input.value;
    if(typedMessage) {
        let messagePayload = {
            from: user.value, //fetch username from anywhere
            message: typedMessage,
            time: new Date().toISOString()
        }
        socket.emit('chat-message', messagePayload);
        messagePayload.from = 'You'
        insertMessageInChatContainer(false, messagePayload);
        input.value = ''
    }
})

function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight)
}

