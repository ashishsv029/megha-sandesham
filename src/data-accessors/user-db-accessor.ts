// we can tweak the internal connection pool maintained by prisma from schema.prisma

class UserDbAccessor {

    [key:string]:{}
    prisma:any
    constructor(dependencies:any, config:any) {
        this.prisma = dependencies.prisma
    }

    async insertUser(payload:any) {
        try {
            const newUser = await this.prisma.user.create({
                data: payload
              });
            return newUser;
        } catch (err) {
            console.log(err);
            throw err;
        } finally {
            await this.prisma.$disconnect();
        }
    }

    async fetchRoomsByUserId(userId:string) {
        try {
            return await this.prisma.user.findUnique({
                where: {
                    id: userId
                },
                include: {
                    associatedRooms: true
                }
            })
        } catch (err) {
            console.log(err);
            throw err;
        } finally {
            await this.prisma.$disconnect
        }
    }


}

export default UserDbAccessor;

/**
 * Some info about connection pooling and its parameters
 * Params:---
 *  max: Maximum number of connections in the pool.
    min: Minimum number of connections in the pool. Connections are not closed below this threshold.
    idleTimeoutMillis: How long a connection can be idle (not used) before being released.
    acquireTimeoutMillis: How long to wait when acquiring a new connection before timing out.

   Flow:-- 
   
   When your application starts, the pool initializes with the minimum number of connections specified by min.

    As your application processes requests and needs more connections, the pool can dynamically create new connections up to the maximum specified by max.

    If the number of active connections is above min, but below max, connections are reused and kept in the pool when released.

    If the number of active connections reaches max, new requests for connections will be queued until a connection becomes available.

    Connections that remain idle (not in use) for a period of time specified by idleTimeoutMillis may be closed, but the pool always maintains at least min connections.

    Adjusting min and max allows you to control the size of the connection pool based on your application's requirements and the capacity of your database server. It's a balance between having enough connections for concurrent requests and avoiding resource overuse.
 */