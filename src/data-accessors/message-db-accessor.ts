class MessageDbAccessor {
    [key:string]:{}
    prisma:any
    constructor(dependencies:any, config:any) {
        this.prisma = dependencies.prisma
    }

    async insertMessage(payload:any) {
        try {
            const newMessage = await this.prisma.message.create({
                data: payload,
                include: {
                    fromUser: true //gives the room admin details also
                }
              });
            return newMessage;
        } catch (err) {
            console.log(err);
            throw err;
        } finally {
            await this.prisma.$disconnect();
        }
    }

    async updateMessage(updateFields:any, messageId:string) {
        try {
            const updatedRecord = await this.prisma.message.update({
                where: { id: messageId },
                data: updateFields
            });
            return updatedRecord;

        } catch (err) {
            console.log(err);
            throw err;
        } finally {
            await this.prisma.$disconnect();
        }
        
    }

    async getUnDeliveredMessagesBasedOnRoomIds(roomIds:string[]) {
        try {
            return await this.prisma.message.findMany({
                where: {
                    room_id: {
                        in: roomIds
                    },
                    is_delivered: false
                },
                select: {
                    id: true,
                    text: true,
                    created_at: true,
                    fromUser: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            })
        } catch (err) {
            console.log(err);
            throw err;
        } finally {
            await this.prisma.$disconnect();
        }
    }

    async getMessagesOfRoom(roomId:string) {
        try {
            return await this.prisma.message.findMany({
                where: {
                    room_id: roomId
                },
                select: {
                    id: true,
                    text: true,
                    created_at: true,
                    delivered_at: true,
                    seen_at: true,
                    fromUser: {
                        select: {
                            name: true
                        }
                    }
                }
            })
        } catch (err) {
            console.log(err);
            throw err;            
        } finally {
            await this.prisma.$disconnect();
        }
    }
}

export default MessageDbAccessor;