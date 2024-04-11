import {expect} from 'chai';
import Sinon, { SinonSandbox, SinonSpy, SinonStub } from 'sinon';
import { Socket } from 'socket.io';
import WebSocketManager from '../../src/managers/web-socket-manager';
import MessageManager from '../../src/managers/message-manager';

describe('Web Socket Manager Test suite', () => {
    let socket:any;
    let webSocketManagerMock:WebSocketManager;
    beforeEach(() => {
        socket = {
            join: Sinon.stub(),
            emit: Sinon.stub(),
            disconnect: Sinon.stub(),
            broadcast: {
                to: Sinon.stub().returnsThis(), //as it return socket instance
                emit: Sinon.stub()
            }

        };
        webSocketManagerMock = new WebSocketManager({}, { //replace with a test config
            appServerPort: 3100,
            redis: {
                connectionString: 'redis://localhost:6379'
            }

        });

    })
    it('verify send message that emits chat-message event - positive flow', async () => {
        // identify individual functionalities and stub accordingly.. mainly for socket object
        // generating fake date..
        let inputdata:any = {
            room_id: 'randomroomid',
            caller_socket_user_info : {
                name: 'Ashish'
            },
            message: 'unit testing...',
            time: new Date().toISOString()
        };

        let formattedMessage = {
            from: inputdata.caller_socket_user_info.name,
            message: inputdata.message,
            time: inputdata.time,
            id: 'randomId'
        }

        let ackSpy:SinonSpy = Sinon.spy(); //just to check whether it has been called or not...
        let messageManagerStub:SinonStub = Sinon.stub(webSocketManagerMock.messageManager, 'storeMessage').resolves(formattedMessage);
        await webSocketManagerMock.sendMessage(socket, inputdata, ackSpy);
        //assert on result (unavailable here) / stubs / spys
        Sinon.assert.calledOnce(messageManagerStub)
        expect(ackSpy.calledOnceWith({'is_sent': true})).to.be.true;
        expect(socket.broadcast.to.calledOnceWith(inputdata.room_id)).to.be.true;
        expect(socket.broadcast.emit.calledOnceWith('chat-message', true, formattedMessage)).to.be.true;
    })

    it('verify send message that emits error when no room id is provided - negative flow', () => {
        let inputData:any = {
            caller_socket_user_info : {
                name: 'Ashish'
            },
            message: 'unit testing...',
            time: new Date().toISOString()
        };
        webSocketManagerMock.sendMessage(socket, inputData, Sinon.spy());
        expect(socket.emit.calledOnceWith('error', 'Room id not available...')).to.be.true;
        expect(socket.disconnect.calledOnce).to.be.true;
    })

    it('Join users into respective rooms on connection', async () => {
        let userInfo:any = {
            id: "b10bcdc6-a5ef-4eb0-944f-5e1dbdeed03e",
            name: "Aswad"
        }
        let roomsOfUser = {
            id: "b10bcdc6-a5ef-4eb0-944f-5e1dbdeed03e",
            name: "Aswad",
            email: "aswad@gmail.com",
            created_at: "2023-11-24T05:23:05.454Z",
            modified_at: "2023-11-24T05:23:05.454Z",
            associatedRooms: [
                {
                    id: "63a85136-fdc1-4bf5-9d4e-3ae9e3d81509",
                    name: "RoomMates",
                    type: "group",
                    admin: "d3819c3e-4b48-48f5-a54d-4079b2ac6703",
                    min_participants: 1,
                    max_participants: 256,
                    is_private: true,
                    created_at: "2023-11-25T11:16:03.031Z",
                    modified_at: "2023-11-25T11:16:03.031Z"
                },
                {
                    id: "64a85136-fdc1-4bf5-9d4e-3ae9e3d81509",
                    name: "dm-Rt78vu1",
                    type: "dm",
                    min_participants: 2,
                    max_participants: 2,
                    is_private: true,
                    created_at: "2023-11-25T11:16:03.031Z",
                    modified_at: "2023-11-25T11:16:03.031Z"
                }
            ]
        }
        const fetchRoomsByUserIdStub:SinonStub = Sinon.stub(webSocketManagerMock.identityManager, 'fetchRoomsByUserId').resolves(roomsOfUser);
        let associatedRoomsOfUser = await webSocketManagerMock.addUserIntoRooms(socket, userInfo);
        let roomsCount = associatedRoomsOfUser.associatedRooms.length;
        expect(socket.join.callCount).equal(roomsCount);
        expect(socket.emit.callCount).equal(roomsCount+1); // for response event
        expect(associatedRoomsOfUser).equals(roomsOfUser);
        expect(fetchRoomsByUserIdStub.calledOnceWith(userInfo.id)).to.be.true;
    })

    afterEach(() => {
        Sinon.restore();
    })
})