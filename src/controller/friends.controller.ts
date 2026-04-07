import { ConflictError } from "../core/Error/conflict-error.js";
import type { PageOptions } from "../core/page-option.js";
import type { ReturnModel } from "../core/return-type.js";
import type { Friend } from "../models/friend.model.js";
import type { searchFriendReturnType } from "../repositories/firends-repository-type.js";
import { FriendRepository } from "../repositories/friends.repository.js";

export class FriendsController {
  async addFriend(friend: Friend): Promise<ReturnModel> {
    const conflictUserAttributes: string[] = [];
  
      if(friend.email === "") friend.email = null;
      if(friend.phone === "") friend.phone = null
    
    if (!FriendRepository.getInstance()) {
      console.error("Failed to get the instance of FriendRepository");
      return { success: false, message: "Server Error" };
    }
    const friendInstance = FriendRepository.getInstance();

    if (
      friend.email !== undefined &&
      friendInstance.checkEmailExists(friend.email).data
    ) {
      conflictUserAttributes.push("email");
    }
    if (
      friend.phone !== undefined &&
      friendInstance.checkPhoneNumberExists(friend.phone).data
    ) {
      conflictUserAttributes.push("phone");
    }
    if (conflictUserAttributes.length !== 0) {
      throw new ConflictError(conflictUserAttributes);
    }
    const response = await friendInstance.addFriend(friend);
    if (response.success) return { success: true };
    console.error("Error: adding friend to DB failed");
    return { success: false, message: "Failed to add the user" };
  }
  searchFriend(
    query: string,
    pageOption?: PageOptions,
  ): ReturnModel<searchFriendReturnType> {
    if (!FriendRepository.getInstance()) {
      console.error("Failed to get the instance of FriendRepository");
      return { success: false, message: "Server Error" };
    }
    const response = FriendRepository.getInstance().searchFriends(
      query,
      pageOption,
    );
    if (!response.success) {
      console.error("Error: searching friend from DB failed");
      return { success: false, message: "Failed to search users" };
    }
    if (!response.success || response.data === undefined) {
      return { success: false, message: "Failed to Search User" };
    }
    if (response.data.result.length === 0) {
      return { success: false, message: "No user Exist" };
    }
    return response;
  }

  findFriendByName(name: string): ReturnModel<Friend> {
    if (!FriendRepository.getInstance()) {
      console.error("Failed to get the instance of FriendRepository");
      return { success: false, message: "Server Error" };
    }
    if (name === "") {
      return { success: false };
    }
    const response = FriendRepository.getInstance().findFriendByName(name);
    if (!response.success) {
      console.error("Failed to find friend the data from the DB");
    }

    if (!response.success) {
      console.log("Operation failed");
      return { success: false, message: "Failed to find friend" };
    }
    if (response.data === undefined) {
      return { success: false, message: "No such user Exists" };
    }
    return { success: true, data: response.data };
  }

  async updateFriend(data: Friend, existingData: Friend): Promise<ReturnModel> {
    if (!FriendRepository.getInstance()) {
      console.error("Failed to get the instance of FriendRepository");
      return { success: false, message: "Server Error" };
    }
    if(data.email) data.email = null;
    if(data.phone) data.phone = null;

    const conflictUserAttributes: string[] = [];
    const friendInstance = FriendRepository.getInstance();
    if (
      existingData.email !== data.email &&
      !data.email &&
      friendInstance.checkEmailExists(data.email).data
    ) {
      conflictUserAttributes.push("email");
    }
    if (
      existingData.phone !== data.phone &&
      !data.phone &&
      friendInstance.checkPhoneNumberExists(data.phone).data
    ) {
      conflictUserAttributes.push("phone");
    }
    if (conflictUserAttributes.length !== 0) {
      throw new ConflictError(conflictUserAttributes);
    }
    const reponse = await friendInstance.updateFriend(data);
    if (!reponse.success) {
      console.error("Failed to update data in the DB");
      return { success: false, message: "Failed to update the user" };
    }
    return { success: true };
  }

  async deleteFriend(id: string): Promise<ReturnModel> {
    if (!FriendRepository.getInstance()) {
      console.error("Failed to get the instance of FriendRepository");
      return { success: false, message: "server Error" };
    }
    const friend = this.findFriendById(id);
    if (!friend.success) {
      console.error("Failed to find friend from the DB");
      return { success: false, message: "Server Error" };
    }
    if (friend.data === undefined) {
      return { success: false, message: "User doesnot Exisit" };
    }
    if (Number(friend.data.balance) !== 0) {
      return {
        success: false,
        message: "User cannot be deleted. The User still has balance",
      };
    }

    const response = await FriendRepository.getInstance().deleteFriendById(id);
    if (!response.success) {
      return { success: false, message: "Server Error" };
    }
    return { success: true };
  }

  findConflictByName(name: string) {
    return this.searchFriend(name);
  }

  findFriendById(id: string):ReturnModel<Friend> {
    if (!FriendRepository.getInstance()) {
      console.error("Failed to get the instance of FriendRepository");
      return { success: false, message: "Server Error" };
    }
    if (id === "") {
      return { success: false };
    }
    const response = FriendRepository.getInstance().findFriendById(id);
    if(response.data===undefined){
      return {success: false,message:"no user exist with the id"}
    }
    if (!response.success) {
      return { success: false, message: "Failed to find friend" };
    }
    if (response.data === undefined) {
      return { success: false, message: "No such user Exists" };
    }
    return { success: true, data: response.data };
  }
}
