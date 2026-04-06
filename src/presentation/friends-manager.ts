import { FriendsController } from "../controller/friends.controller.js";
import { ConflictError } from "../core/Error/conflict-error.js";
import type { ReturnModel } from "../core/return-type.js";
import { emailValidator } from "../core/validators/email.validator.js";
import { numberValidator } from "../core/validators/number.validator.js";
import { phoneNoValidator } from "../core/validators/phoneNo.validator.js";
import type { Friend } from "../models/friend.model.js";
import { openInteractionManager, type Choice } from "./interaction-manager.js";



const options: Choice[] = [
  { label: "Add Friend", value: "1" },
  { label: "Search Friend", value: "2" },
  { label: "Update Friend", value: "3" },
  { label: "Remove Friend", value: "4" },
  { label: "Exit", value: "5" },
];

const { ask, choose, close } = openInteractionManager();
const friendsController = new FriendsController();

 const collectFriendDetails = async (friendFormDetails:Friend,action: "addFriend" | "updateFriend",options?:{
    defaultValue?: Friend
  }
  ) => {
    try {
      if (friendFormDetails.name === "")
        friendFormDetails.name =
          (await ask("Enter freind name:", {
            defaultAnswer: options?.defaultValue?.name ?? `Default-${Date.now()}`,
          })) || "";

      if (friendFormDetails.email === "")
        friendFormDetails.email =
          (await ask("Enter friend email", {
            defaultAnswer: options?.defaultValue?.email,
            validator: emailValidator,
          })) || "";

      if (friendFormDetails.phone === "")
        friendFormDetails.phone =
          (await ask("Enter friend phone number", {
            defaultAnswer: options?.defaultValue?.phone ?? "",
            validator: phoneNoValidator,
          })) || "";

      if (action!=='updateFriend' && friendFormDetails.balance === "")
        friendFormDetails.balance =
          (await ask(
            "Enter opening balance (positive mean they owe you,negative means you owe them)",
            {
              validator: numberValidator,
              defaultAnswer: options?.defaultValue?.balance ?? "0",
            },
          )) || "";

      let response: ReturnModel;
      if (action === "addFriend") {
        response = await friendsController.addFriend(friendFormDetails);
      }else{
        response = await friendsController.updateFriend(friendFormDetails)
      }
      if (!response.success) {
        console.log(response.message);
        return;
      }
      console.log(`${friendFormDetails.name} has been successfully added.`);
    } catch (error) {
      if (error instanceof ConflictError) {
        const conflictAttribute = error.conflictAttributes as (
          | "email"
          | "phone"
        )[];
        console.log(error.message);
        conflictAttribute.forEach((attribute) => {
          friendFormDetails[attribute] = "";
        });
        await collectFriendDetails(friendFormDetails,action);
      }
    }
  };

const addFriend = async () => {
  const friendFormDetails = {
    id: Date.now().toString(),
    name: "",
    email: "",
    phone: "",
    balance: "",
  };
  await collectFriendDetails(friendFormDetails,"addFriend");
};

const deleteFriend = async () => {
  const answer = await ask("Enter the name of the friend you want to Delete", {
    defaultAnswer: "Exit",
  });
  if (answer === "Exit" || answer === undefined) {
    return;
  }
  const response = await friendsController.deleteFriend(answer);
  if (!response.success) {
    console.log(response.message);
    return;
  }
  console.log(`User ${answer} has been delete successfully!`);
};

const searchFriends = async () => {
  let offset = 0;
  let totalPage = 0;
  let currentPage = 0;
  const limit = 5;
  let isPrevDisabled = true;
  let isNextDisabled = false;
  let isExit = false;

  const info = await ask(
    "Enter the Name,PhoneNumber or Email to search the User",
    { defaultAnswer: "" },
  );

  do {
    const response = friendsController.searchFriend(info!, { offset, limit });
    if (!response.success || response.data === undefined) {
      console.log(response.message);
      return;
    }
    totalPage = Math.ceil(response.data.matched / limit) - 1;
    console.table(response.data.result);
    console.log(
      `Matched: ${response.data.matched}/${response.data.total} \t\t\t\t\t\t Page: ${currentPage + 1}/${totalPage + 1}`,
    );

    if (currentPage < totalPage && currentPage > 0) {
      isPrevDisabled = false;
      isNextDisabled = false;
    } else if (currentPage === totalPage) {
      isNextDisabled = true;
    } else if (currentPage === 0) {
      isPrevDisabled = true;
    }

    console.log(
      `\n\n${isPrevDisabled ? "" : "P: PREV"}\t\t\t\tE: EXit\t\t\t\t${isNextDisabled ? "" : "N: NEXT"}`,
    );
    const action = await ask("", {
      validator: (input) => {
        switch (input) {
          case "P":
            if (isPrevDisabled) {
              return false;
            }
            return true;
          case "N":
            if (isNextDisabled) {
              return false;
            }
            return true;
          case "E":
            return true;
          default:
            return false;
        }
      },
    });

    switch (action?.toUpperCase()) {
      case "P":
        offset -= 5;
        currentPage--;
        break;
      case "N":
        offset += 5;
        currentPage++;
        break;
      case "E":
        isExit = true;
        break;
    }
  } while (!isExit);
};

const updateFriends = async () => {
  const answer = await ask("Enter the name of the person you want to update", {
    defaultAnswer: "Exit",
  });
  if (answer === "Exit" || answer === undefined) {
    return;
  }
  let friend = friendsController.findFriendByName(answer);
  if (!friend.success || friend.data === undefined) {
    console.log(friend.message);
    return;
  }
  console.log("Press Enter if you do not want to update the field");
  let friendUpdateDetails:Friend = {
    name:"",
    email:"",
    phone:"",
    balance:""
  }
  await collectFriendDetails(friendUpdateDetails,'updateFriend',{
    defaultValue:friend.data
  })
  const response = await friendsController.updateFriend(friendUpdateDetails);
  if (!response.success) {
    console.log(response.message);
  }
  console.log("updated UserInfo");
  console.table(friendUpdateDetails);
};

export const manageFriends = async () => {
  while (true) {
    const choice = await choose("What do you want to do?", options, false);

    switch (choice!.value) {
      case "1":
        await addFriend();
        break;
      case "2":
        await searchFriends();
        break;
      case "3":
        await updateFriends();
        break;
      case "4":
        await deleteFriend();
        break;
      case "5":
        console.log("Exiting...");
        close();
        return;
    }
  }
};
