import MakePassword from "../../domain/Password/MakePassword";
import SchemaValidator from "../../domain/SchemaValidator";
import User from "../../domain/User";
import UserNotifier from "../../UserNotifier";
import { InputData } from "../interface";

export default interface Dependencies {
  userDb: UserDb;
  userNotifier: UserNotifier;
  userDataValidator: SchemaValidator<InputData>;
  makePassword: MakePassword;
}

export interface UserDb {
  getByEmail(email: string): Promise<User | null>;
  save(u: User): Promise<void>;
  generateId(): string | Promise<string>;
}
