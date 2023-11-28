Present Features
  1. users need to register (backend yet to develop)
  2. Can see other registered users (yet to develop)
  3. Create a room and can do private chat (developed)
  4. Create a group with multiple people and can chat in group (reconnections need to handle)
        As a ff, we need to have a junction table between users and messages for read receipts - deliveryTable
           (for group messages, message acknowledgement event should not directly update is_delivered in the messages table, rather it should add an entry in this junction table. Also, while fetching undelivered messages, we should fetch is_delivered:false&(no entry in junction table should be there for (userId:MessageId combo)), then the callback should add this entry )

Data Modelling Guide:- 

1. Identify Entities
2. Identify relationships between entities (use ER daigrams)
3. Identify relevant attributes for the Entities
4. Normalize the data (bring it atleast to 3NF)
5. Choose primary keys
6. Use foriegn keys to establish relationships between entities
7. Identify queriable fields to define indexes
8. Add other relevant data integrity constraints (ex:- unique constraint, default constraint, check constraint)

1. Entities
    3 data models 

    1. user model
    2. room model
    3. message model

2. Relationships between entities

    Relationships:- 
        user joins room
        user sends message (sendTo)
        message gets delivered to user  (receivedFrom)
        room has message
        room has a admin (user) //atleast for now we assume a room can have only one admin

    1. user - room (many to many bcs a user can be in any no of rooms and a room can have n number of users)
    2. user - message (one to many bcs a user can send multiple messages) 
    3. user - message (many to many bcs a message can be delivered to multiple users and a user can have many messages getting delivered  )
    4. room - message (one to many bcs a room can have multiple messages )
    5. message - room (many to one bcs many messages are part of a single room)
    6. user admins room (one to many bcs a user can be as an admin to many rooms)


3. Attributes for the entities

    User:- 
       id, name, associated_rooms (array), created_at, modified_at 
    Room:-
       id, name, associated_users (array), type (enum: group/DM), max_participants (default 2 for DM and 256 for group), is_private (bool, dms are true by default and groups can be either public or private), admins(array), created_at, modified_at
    Message:-
       id, content, from, to, room_id, is_sent (single tick), is_delivered (double ticks), is_seen (blue ticks), sent_at

4. Create Tables
   1. Users:- id(pkey), name, created_at, modified_at
   2. Rooms:- id(pkey), name, type, max_participants, is_private, created_at, modified_at
   3. Messages:- id(pkey), content, from (fkey ref users(id)), to (fkey ref users(id)), room_id (fkey ref room(id)), is_sent, is_delivered, is_seen
   4. UserRooms:- (bcs of many to many relationship, its better to store the values in this table)
                user_id(fkey refs user(id)), room_id(fkey refs room(id)), is_user_room_admin (bool)
                pkey(user_id, room_id) i.e a composite key


Database, user and password creation and seeding
    1. psql --u postgres
    2. create database chatapp;
    3. create user chatadmin with password 'chatpassword';
    4. GRANT ALL PRIVILEGES ON DATABASE chatapp to chatadmin;


CREATE TABLE users(
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    created_at timestamp  with time zone DEFAULT now(),
    modified_at timestamp with time zone DEFAULT now()
)

CREATE TYPE RoomType AS ENUM ('group', 'dm');
CREATE TABLE rooms(
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    room_type RoomType,
    max_participants INT,
    is_private BOOL,
    created_at timestamp  with time zone DEFAULT now(),
    modified_at timestamp with time zone DEFAULT now()
)

CREATE TABLE messages(
    id UUID PRIMARY KEY,
    content VARCHAR(256),
    from_user UUID REFERENCES users(id) ON DELETE CASCADE,
    to_user UUID REFERENCES users(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) on DELETE CASCADE,
    is_sent BOOL DEFAULT false,
    is_delivered BOOL DEFAULT false,
    is_seen BOOL DEFAULT false,
    created_at timestamp  with time zone DEFAULT now()
)

CREATE TABLE UserRooms(
    user_id UUID REFERENCES users(id),
    room_id UUID REFERENCED rooms(id),
    is_user_room_admin BOOL,
    PRIMARY KEY(user_id, room_id)
)
// this model should be automatically created by prisma as it detects many to many relationship
model UserRooms {
  user_id String
  room_id String
  is_user_room_admin Boolean
  user User @relation("UserInRoom", fields: [user_id], references: [id])
  room Room @relation("RoomUser", fields: [room_id], references: [id])
  created_at DateTime @default(now())
  @@id([user_id, room_id])

}



Handling Disconnections 
   to ensure client message sent to server --> acknowledgements from server
   to ensure server message sent to client --> (i.e client state synchronization with server's state)
                ---> whenever the client reconnects, the entire server's state should be sent to client (fetch all chat messages of that room)
                ---> the client sends an offsetid (i.e nothing but last delived message id), then the server should send all the sent and undelivered messages after that offset



User Actions
1. initiate a new conversation 
        (1
        -1 room)
            1. The sender should create a group (type dm)
            2. The sender should send the message also
            3. The server should join both the sender & receiver (& update junction table)
            4. The server should broadcast emit the message in the room (stores the message and acknowledgement info)
2. continue on an existing conversation (1-1)
        (1-1 room)
            1. The client connects to the server
            2. Pull the latest delivered messages to the client (the client shares the last offset (message timestamp) for every room and gets undelivered messages per room after the timestamp )
            3. use fetch messages per room API to retrieve all the messages (ideally fired when the user clicks on any room to see messages)
            4?. handle html scroll appropriately (should be set to the last offset, on scroll bottom )