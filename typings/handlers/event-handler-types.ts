export interface UserInfo {
    caller_socket_user_info: CallerSocketUserInfo
}

export type CallerSocketUserInfo = {
    id: string,
    name: string
}

export interface AssociatedRoomsOfUser {
    associatedRooms: Room[],
    email: string,
    id: string,
    name: string,
    created_at: Date,
    modified_at: Date
}

export type MessagePayload = {
    message: string,
    room_id: string,
    temp_room_id?: string
    scheduled_time?:string
    time: Date,
    receiver_name?: string,
    is_new_dm?: boolean,
    caller_socket_user_info?: CallerSocketUserInfo
}

type Room = {
    id: string,
    name: string,
    type: string,
    admin: string,
    created_at: Date,
    modified_at: Date,
    max_participants: number,
    is_private: boolean


}