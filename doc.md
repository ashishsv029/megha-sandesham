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
        user sends message
        room has message

    1. user - room (many to many bcs a user can be in any no of rooms and a room can have n number of users)
    2. user - message (one to many bcs a user can send multiple messages)
    3. room - message (one to many bcs a room can have multiple messages )
    4. message - room (many to one bcs many messages are part of a single room)


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