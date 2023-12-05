import RoomDbAccessor from "../data-accessors/room-db-accessor";
import {uniqueNamesGenerator, adjectives, colors, animals} from 'unique-names-generator'
class RoomManager {

    [key:string]:{}
    roomDBAccessor: RoomDbAccessor
    constructor(dependencies:any, config:any) {
        this.roomDBAccessor = new RoomDbAccessor(dependencies, config)
    }

    generateRoomPayload(inputPayload:any) {
        const roomPayload:any = {
            name: inputPayload.name || uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] }),
            type: inputPayload.type,
            min_participants: 1,
            max_participants: inputPayload.type == 'group' ? 256 : 2,
            is_private: true || inputPayload.is_private,
            roomAdmin: {
                connect: { id: inputPayload.caller_socket_user_info.id }, // Connect the roomAdmin relationship
            } //we need to store user id as an admin, as this has one - many relationship it stores the id value in admin field (which is being referred by the relation)
        }
        if(inputPayload.initial_room_members) {
            //connect the room with these group members
            roomPayload['associatedUsers'] = {
                connect: inputPayload.initial_room_members
            }//so it automatically populates the junction table (As it is having many to many relationship with users)
        }
        return roomPayload;
    }

    async createRoom(inputPayload:any) {
        //enrich the payload before calling the prisma client
        try {
            const roomPayload = this.generateRoomPayload(inputPayload);
            return await this.roomDBAccessor.insertRoom(roomPayload);
        } catch (error) {
            throw error;
        }
    }
}


export default RoomManager
