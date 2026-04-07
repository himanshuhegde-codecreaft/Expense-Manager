import type { ValidatorFn } from "./validator.type.js";

export const  phoneNoValidator: ValidatorFn = (phoneNo) => {
  if(phoneNo === "") return true
  const phoneNoRegex = /^$|^\d{10}$/;
  return phoneNoRegex.test(phoneNo);
}