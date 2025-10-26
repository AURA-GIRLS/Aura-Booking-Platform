import { User } from "@models/users.models";

export class UserService{
     async getUserById(userId:string){
        const user = await User.findById(userId);
        return user;
     }
}
export const userService = new UserService();