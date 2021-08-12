import MakePassword from "../domain/Password/MakePassword";
import User from "../domain/User";

export default interface Dependencies {
  saveUser: (user: User) => Promise<void>;
  getUserByEmail: (email: string) => Promise<User | null>;
  notifyUser: (user: User) => Promise<void>;
  makePassword: MakePassword;
}
