import User from "../domain/User";

export default interface EditProfileDetails {
  (data: EditProfileInputData): Promise<void>;
}

export interface EditProfileInputData {
  userId: string;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
}

export class UserNotFound extends Error {
  constructor(public userId: string) {
    super(`user with id: ${userId} was not found`);
    this.name = UserNotFound.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(reason?: string) {
    super(reason);
    this.name = CouldNotCompleteRequest.name;
  }
}

export interface EditProfileDetailsErrorMessages {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
}
export class InvalidEditProfileData extends Error {
  constructor(public errorMessages: EditProfileDetailsErrorMessages) {
    super();
    this.name = InvalidEditProfileData.name;
  }
}

export interface Dependencies {
  getUserById: GetUserById;
  saveUser: SaveUser;
  now: () => Date;
}

export interface GetUserById {
  (id: string): Promise<User | null>;
}

export interface SaveUser {
  (u: User): Promise<void>;
}
