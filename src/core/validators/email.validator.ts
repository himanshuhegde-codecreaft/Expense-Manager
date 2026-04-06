import type { ValidatorFn } from "./validator.type.js";

export const  emailValidator:ValidatorFn = (email) => {
  const emailRegex = /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$ /;
  return emailRegex.test(email);
}