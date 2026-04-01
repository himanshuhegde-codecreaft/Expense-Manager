import type { ReturnModel } from "../core/return-type.js";
import type { iFriend } from "../models/friend.model.js";
import { FriendRepository } from "../repositories/friends.repository.js";

export class FriendsController{
    checkEmailExists(email:string){
        return false;
    }
    checkPhoneExists(phone:string){
        return false;
    }
    addFriend(friend:iFriend):ReturnModel<iFriend>{
        if(!FriendRepository.getInstance()){
            console.error('Failed to get the instance of FriendRepository')
            return {success:false}
        }
        const response = FriendRepository.getInstance().addFriend(friend);
        if(response.success)
            return {success:true}
        console.error('Error: adding friend to DB failed')
        return {success:false}

    }
}