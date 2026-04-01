import { FriendsController } from "../controller/friends.controller.js";
import { numberValidator } from "../core/validators/number.validator.js";
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

const addFriend = async () => {
  const name = await ask("Enter freind name:", {
    defaultAnswer: `Default-${Date.now()}`,
  });
  const email = await ask("Enter friend email");
  const phone = await ask("Enter friend phone number");
  const openingBalance = await ask(
    "Enter opening balance (positive mean they owe you,negative means you owe them)",
    { validator: numberValidator },
  );

  const friend = {
    id: Date.now().toString(),
    name: name!,
    email,
    phone,
    balance: Number(openingBalance),
  };
  const response = friendsController.addFriend(friend);
  if (!response) {
    console.log("Failed to add the user");
    return;
  }
  console.log(`${friend.name} has been successfully added.`);
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
      console.log("Failed to search User");
      return;
    }
    if (response.data.result.length === 0 && currentPage == 0) {
      console.log("No user Exist");
      return;
    }
    totalPage = Math.ceil(response.data.matched / limit) - 1;
    console.table(response.data.result);
    console.log(`Matched: ${response.data.matched}/${response.data.total} \t\t\t\t\t\t Page: ${currentPage+1}/${totalPage+1}`);

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
        offset-=5;
        currentPage--;
        break;
      case "N":
        offset+=5;
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
  if (!friend.success) {
    console.log("Operation failed");
    return;
  }
  if (friend.data === undefined) {
    console.log("No such User Exists");
    return;
  }
  console.log("Press Enter if you do not want to update the field");
  const name = await ask("Enter freind name:", {
    defaultAnswer: friend.data.name,
  });
  const email = await ask("Enter friend email",{defaultAnswer:friend.data.email?? 'N/A'});
  const phone = await ask("Enter friend phone number",{defaultAnswer:friend.data.phone ?? 'N/A'});
  friend.data = {...friend.data,name:name!,email:email==='N/A'?undefined:email,phone:phone==='N/A'?undefined:phone}
  const response = friendsController.updateFriend(friend.data);
  if(!response.success){
    console.log('Failed to update user');
  }
  console.log('updated UserInfo');
  console.table(friend.data)
  
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
        await updateFriends()
        break;
      case "5":
        console.log("Exiting...");
        close();
        return;
    }
  }
};
