import type { PageOptions } from "../core/page-option.js";
import type { ReturnModel } from "../core/return-type.js";
import type { iFriend } from "../models/friend.model.js";
import type { searchFriendReturnType } from "./firends-repository-type.js";

export class FriendRepository {
  private static instance: FriendRepository;
  private friends: iFriend[] = [];
  static getInstance() {
    if (!FriendRepository.instance) {
      FriendRepository.instance = new FriendRepository();
    }
    return FriendRepository.instance;
  }

  private constructor() {}
  addFriend(friend: iFriend): ReturnModel {
    this.friends.push(friend);
    return { success: true };
  }

  findFriendByEmail(email: string) {
    const result = this.friends.find((friend) => friend.email === email);
    if (result === undefined) {
      return { success: false };
    }
    return { success: true, data: result };
  }

  findFriendByPhone(phone: string) {
    const result = this.friends.find((friend) => friend.phone === phone);
    if (result === undefined) {
      return { success: false };
    }
    return { success: true, data: result };
  }

  findFriendByName(name: string): ReturnModel<iFriend | undefined> {
    const result = this.friends.find((friend) => friend.name === name);
    return { success: true, data: result };
  }

  updateFriend(data: iFriend): ReturnModel {
    this.friends = this.friends.map((friend) => {
      if (data.id === friend.id) return data;
      return friend;
    });
    return { success: true };
  }

   deleteFriend(name:string):ReturnModel{
    this.friends = this.friends.filter(friend=>friend.name!==name)
    return {success:true}
  }

  searchFriends(
    query: string,
    pageOption?: PageOptions,
  ): ReturnModel<searchFriendReturnType> {
    if (pageOption === undefined) {
      pageOption = {
        offset: 0,
        limit: 5,
      };
    }
    if (query === "") {
      return {
        success: true,
        data: {
          result: [...this.friends].slice(
            pageOption?.offset || 0,
            (pageOption?.offset || 0) + (pageOption?.limit || 5),
          ),
          matched: this.friends.length,
          total: this.friends.length,
        },
      };
    }
    const lowerQuery = query.toLowerCase();
    const filtered = this.friends.filter(
      (friend) =>
        friend.name.toLowerCase().includes(lowerQuery) ||
        friend.email?.toLowerCase().includes(lowerQuery) ||
        friend.phone?.toLowerCase().includes(lowerQuery),
    );
    return {
      success: true,
      data: {
        result: filtered.slice(
          pageOption?.offset || 0,
          (pageOption?.offset || 0) + (pageOption?.limit || 5),
        ),
        matched: filtered.length,
        total: this.friends.length,
      },
    };
  }
 
}
