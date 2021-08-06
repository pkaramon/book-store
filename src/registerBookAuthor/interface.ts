import MakeBookAuthor from "../domain/BookAuthor/MakeBookAuthor";
import MakePassword from "../domain/Password/MakePassword";
import User from "../domain/User";
import UserDataValidator from "../domain/UserDataValidator";

export interface InputData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: Date;
  bio: string;
}

export class EmailAlreadyTaken extends Error {
  constructor(public readonly email: string) {
    super();
    this.name = EmailAlreadyTaken.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(message: string, public readonly originalError: any) {
    super(message);
    this.name = CouldNotCompleteRequest.name;
  }
}

export class InvalidBookAuthorRegisterData extends Error {
  constructor(
    public readonly errorMessages: Partial<Record<keyof InputData, string[]>>,
    public readonly invalidProperties: (keyof InputData)[]
  ) {
    super();
    this.name = InvalidBookAuthorRegisterData.name;
  }
}

export interface Dependencies {
  saveUser: (u: User) => Promise<void>;
  getUserByEmail: (email: string) => Promise<User | null>;
  notifyUser: (u: User) => Promise<void>;
  makePassword: MakePassword;
  userDataValidator: UserDataValidator<InputData>;
  makeBookAuthor: MakeBookAuthor;
}
