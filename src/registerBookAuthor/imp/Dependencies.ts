import MakeBookAuthor from "../../domain/BookAuthor/MakeBookAuthor";
import MakePassword from "../../domain/Password/MakePassword";
import SchemaValidator from "../../domain/SchemaValidator";
import User from "../../domain/User";
import {InputData} from "../interface";

export default interface Dependencies {
  saveUser: (u: User) => Promise<void>;
  getUserByEmail: (email: string) => Promise<User | null>;
  notifyUser: (u: User) => Promise<void>;
  makePassword: MakePassword;
  userDataValidator: SchemaValidator<InputData>;
  makeBookAuthor: MakeBookAuthor;
}

