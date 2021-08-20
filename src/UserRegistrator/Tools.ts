import MakePassword from "../domain/Password/MakePassword";
import User from "../domain/User";

export default interface Dependencies {
  userDb: UserDb;
  notifyUser: (user: User) => Promise<void>;
  makePassword: MakePassword;
}

export interface UserDb {
  save(user: User): Promise<void>;
  getByEmail(email: string): Promise<User | null>;
  generateId(): string | Promise<string>;
}
