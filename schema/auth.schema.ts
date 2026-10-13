import { object } from "yup";
import { emailValidation, passwordValidation} from "./fields";

export const authSchema = object({ email: emailValidation, password: passwordValidation });
