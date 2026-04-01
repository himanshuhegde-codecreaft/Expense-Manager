import type { PageOptions } from "../core/page-option.js";
import type { ReturnModel } from "../core/return-type.js";
import type { iFriend } from "../models/friend.model.js";
import type { searchFriendReturnType } from "../repositories/firends-repository-type.js";
import { FriendRepository } from "../repositories/friends.repository.js";

export class FriendsController {
  addFriend(friend: iFriend): ReturnModel {
    const response = FriendRepository.getInstance().addFriend(friend);
    if (response.success) return { success: true };
    console.error("Error: adding friend to DB failed");
    return { success: false };
  }

  searchFriend(
    query: string,
    pageOption?: PageOptions,
  ): ReturnModel<searchFriendReturnType> {
    if (!FriendRepository.getInstance()) {
      console.error("Failed to get the instance of FriendRepository");
      return { success: false };
    }
    const response = FriendRepository.getInstance().searchFriends(
      query,
      pageOption,
    );
    if (!response.success) {
      console.error("Error: searchin friend from DB failed");
      return { success: false };
    }
    return response;
  }

  findFriendByName(name: string): ReturnModel<iFriend | undefined> {
    if (!FriendRepository.getInstance()) {
      console.error("Failed to get the instance of FriendRepository");
      return { success: false };
    }
    if (name === "") {
      return { success: false };
    }
    const response = FriendRepository.getInstance().findFriendByName(name);
    if (!response.success) {
      console.error("Failed to find friend the data from the DB");
    }
    return response;
  }

  updateFriend(data: iFriend): ReturnModel {
    if (!FriendRepository.getInstance()) {
      console.error("Failed to get the instance of FriendRepository");
      return { success: false };
    }
    const reponse = FriendRepository.getInstance().updateFriend(data);
    if(!reponse.success){
        console.error('Failed to update data in the DB');
    }
    return {success:true};
  }
}
