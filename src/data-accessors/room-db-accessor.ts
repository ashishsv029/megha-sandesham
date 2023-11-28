class RoomDbAccessor {
    [key:string]:{}
    prisma:any
    constructor(dependencies:any, config:any) {
        this.prisma = dependencies.prisma
    }

    async insertRoom(payload:any) {
        try {
            const newRoom = await this.prisma.room.create({
                data: payload,
                include: {
                    roomAdmin: true //gives the room admin details also
                }
              });
            return newRoom;
        } catch (err) {
            console.log(err);
            throw err;
        } finally {
            await this.prisma.$disconnect();
        }
    }
}

export default RoomDbAccessor;