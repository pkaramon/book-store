import MakeCustomer from "../domain/Customer/MakeCustomer";
import User, { UserInfo } from "../domain/User";
import RawUserDataValidator, {
  RawUserData,
} from "../domain/RawUserDataValidator";
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
  saveUser: (u: User) => Promise<void>;
  getUserByEmail: (email: string) => Promise<User | null>;
  notifyUser: (user: User) => Promise<void>;
  userDataValidator: RawUserDataValidator;
  makeCustomer: MakeCustomer;
  makePassword: MakePassword;
}
