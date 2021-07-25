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
  constructor(public errors: Partial<Record<keyof InputData, string[]>>) {
    super();
  }
  get invalidProperties() {
    return Reflect.ownKeys(this.errors);
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(reason?: string) {
    super(reason);
  }
}

export interface Dependencies {
  saveUser: SaveUser;
  createId: () => string;
  hashPassword: HashPassword;
  userDataValidator: UserDataValidator;
}

export interface ValidateEmail {
  (email: string): boolean;
}

export interface SaveUser {
  (u: User): Promise<void>;
}
export interface HashPassword {
  (pass: string): Promise<string>;
}
