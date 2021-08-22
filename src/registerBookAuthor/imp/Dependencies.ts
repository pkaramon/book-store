import MakePassword from "../../domain/Password/MakePassword";
import SchemaValidator from "../../domain/SchemaValidator";
import User from "../../domain/User";
import UserNotifier from "../../UserNotifier";
import { InputData } from "../interface";

export default interface Dependencies {
  userNotifier: UserNotifier;
  makePassword: MakePassword;
  userDataValidator: SchemaValidator<InputData>;
  userDb: UserDb;
}

export interface UserDb {
  save(u: User): Promise<void>;
  getByEmail(email: string): Promise<User | null>;
  generateId(): string | Promise<string>;
}
