import MakePassword from "../domain/Password/MakePassword";
import User from "../domain/User";
import UserNotifier from "../UserNotifier";

export default interface Dependencies {
  userDb: UserDb;
  userNotifier: UserNotifier;
  makePassword: MakePassword;
}

export interface UserDb {
  save(user: User): Promise<void>;
  getByEmail(email: string): Promise<User | null>;
  generateId(): string | Promise<string>;
}
