import { string } from "yup";

export const emailValidation = string()
  .trim()
  .email("Enter a valid email address.")
  .required("Email is required.");

// Login must accept existing passwords without changing them or imposing signup rules.
export const passwordValidation = string().required("Password is required.");
