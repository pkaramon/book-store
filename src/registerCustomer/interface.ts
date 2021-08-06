import MakeCustomer from "../domain/Customer/MakeCustomer";
import User from "../domain/User";
import UserDataValidator from "../domain/UserDataValidator";
import MakePassword from "../domain/Password/MakePassword";

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
    public readonly errorMessages: Partial<Record<keyof InputData, string[]>>,
    public readonly invalidProperties: (keyof InputData)[]
  ) {
    super();
  }
}

export class EmailAlreadyTaken extends Error {
  constructor(public readonly email: string) {
    super();
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(reason: string, public originalError: any) {
    super(reason);
  }
}

export interface Dependencies {
  saveUser: (u: User) => Promise<void>;
  getUserByEmail: (email: string) => Promise<User | null>;
  notifyUser: (user: User) => Promise<void>;
  userDataValidator: UserDataValidator<InputData>;
  makeCustomer: MakeCustomer;
  makePassword: MakePassword;
}
