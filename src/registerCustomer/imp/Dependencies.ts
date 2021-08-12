import MakeCustomer from "../../domain/Customer/MakeCustomer";
import MakePassword from "../../domain/Password/MakePassword";
import SchemaValidator from "../../domain/SchemaValidator";
import User from "../../domain/User";
import { InputData } from "../interface";

export default interface Dependencies {
  saveUser: (u: User) => Promise<void>;
  getUserByEmail: (email: string) => Promise<User | null>;
  notifyUser: (user: User) => Promise<void>;
  userDataValidator: SchemaValidator<InputData>;
  makeCustomer: MakeCustomer;
  makePassword: MakePassword;
}
