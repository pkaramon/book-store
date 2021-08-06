import VerifyToken from "../auth/VerifyToken";
import { UserData } from "../domain/PlainUserSchema";
import User from "../domain/User";
import UserDataValidator from "../domain/UserDataValidator";

export default interface EditProfileDetails {
  (data: InputData): Promise<void>;
}

export interface InputData {
  userAuthToken: string;
  toUpdate: ToUpdate;
}

export interface ToUpdate {
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
}

export class UserNotFound extends Error {
  constructor(public readonly userId: string) {
    super(`user with id: ${userId} was not found`);
    this.name = UserNotFound.name;
  }
}

export class InvalidUserType extends Error {
  constructor() {
    super();
    this.name = InvalidUserType.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(reason?: string) {
    super(reason);
    this.name = CouldNotCompleteRequest.name;
  }
}

export type EditProfileDetailsErrorMessages = Partial<
  Record<keyof ToUpdate, string[]>
>;
export class InvalidEditProfileData extends Error {
  constructor(public errorMessages: EditProfileDetailsErrorMessages) {
    super();
    this.name = InvalidEditProfileData.name;
  }
}

export interface Dependencies {
  getUserById: GetUserById;
  saveUser: SaveUser;
  userDataValidator: UserDataValidator<UserData>;
  verifyUserAuthToken: VerifyToken;
}

export interface GetUserById {
  (id: string): Promise<User | null>;
}

export interface SaveUser {
  (u: User): Promise<void>;
}
