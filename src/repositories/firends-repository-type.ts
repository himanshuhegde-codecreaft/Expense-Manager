import type { iFriend } from "../models/friend.model.js";

export interface searchFriendReturnType {
  result: iFriend[];
  matched: number;
  total: number;
}
