import type { ValidatorFn } from "./validator.type.js";

export const  emailValidator:ValidatorFn = (email) => {
  if(email === "") return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}