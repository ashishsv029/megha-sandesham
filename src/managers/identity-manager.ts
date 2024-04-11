import { Inject } from "typescript-ioc";
import UserDbAccessor from "../data-accessors/user-db-accessor"
//import {Config} from '../../typings/app-loader-types'


class IdentityManager {

    [key:string]:{}
    
    @Inject
    private userDBAccessor: UserDbAccessor
    
    constructor(dependencies:any, config:Config) {}

    async createUser(payload:any) {
        try {
            
            return await this.userDBAccessor.insertUser(payload);
        } catch (error) {
            throw error;
        }
    }

    async fetchUserByEmailIdAndName(payload:any) {
        try {

            return await this.userDBAccessor.getUser(payload);

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
