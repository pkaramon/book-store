import User from "../domain/User";
import UserDataValidator from "../domain/User/UserDataValidator";

export default interface RegisterUser {
  (data: InputData): Promise<{ userId: string }>;
}

export interface InputData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: Date;
}

export class InvalidUserRegisterData extends Error {
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
  createId: () => string;
  hashPassword: (pass: string) => Promise<string>;
  notifyUser: (user: User) => Promise<void>;
  userDataValidator: UserDataValidator;
}
