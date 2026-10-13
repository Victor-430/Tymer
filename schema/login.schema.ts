import type { InferType } from "yup";
import { authSchema } from "./auth.schema";

export const loginSchema = authSchema.pick(["email", "password"]);
export type LoginValues = InferType<typeof loginSchema>;
