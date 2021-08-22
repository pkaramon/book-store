import MakePassword from "../../domain/Password/MakePassword";
import SchemaValidator from "../../domain/SchemaValidator";
import User from "../../domain/User";
import UserNotifier from "../../UserNotifier";
import { AdminData } from "../interface";

export default interface Dependecies {
  verifySuperAdminToken: (token: string) => boolean | Promise<boolean>;
  makePassword: MakePassword;
  userDb: UserDb;
  userNotifier: UserNotifier;
  adminDataValidator: SchemaValidator<AdminData>;
}

export interface UserDb {
  save(u: User): Promise<void>;
  getByEmail(email: string): Promise<User | null>;
  generateId(): Promise<string> | string;
}
