import Customer from "../domain/Customer";
import MakeCustomer from "../domain/Customer/MakeCustomer";
import User from "../domain/User";
import UserDataValidator from "../domain/User/UserDataValidator";

export default interface RegisterCustomer {
  (data: InputData): Promise<{ userId: string }>;
}

export interface InputData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: Date;
}

export class InvalidCustomerRegisterData extends Error {
  constructor(
    public errorMessages: Partial<Record<keyof InputData, string[]>>
  ) {
    super();
  }
  get invalidProperties() {
    return Reflect.ownKeys(this.errorMessages);
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(reason: string, public originalError: any) {
    super(reason);
  }
}

export interface Dependencies {
  saveCustomer: (cus: Customer) => Promise<void>;
  getUserByEmail: (email: string) => Promise<User | null>;
  hashPassword: (pass: string) => Promise<string>;
  notifyUser: (user: User) => Promise<void>;
  userDataValidator: UserDataValidator;
  makeCustomer: MakeCustomer
}
