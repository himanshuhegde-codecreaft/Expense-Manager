import type { Friend } from "../models/friend.model.js";

export interface searchFriendReturnType {
  result: Friend[];
  matched: number;
  total: number;
}
