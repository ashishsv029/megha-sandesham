import UserDbAccessor from "../data-accessors/user-db-accessor.ts"
class IdentityManager {

    [key:string]:{}
    userDBAccessor: UserDbAccessor
    constructor(dependencies:any, config:any) {
        this.userDBAccessor = new UserDbAccessor(dependencies, config)
    }

    async createUser(payload:any) {
        try {
            
            return await this.userDBAccessor.insertUser(payload);
        } catch (error) {
            throw error;
        }
    }

    async fetchRoomsByUserId(userId:string) {
        try {
            return await this.userDBAccessor.fetchRoomsByUserId(userId);
        } catch (error) {
            throw error;
        }
    }

}


export default IdentityManager
