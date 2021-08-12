import VerifyToken from "../../auth/VerifyToken";
import { UserData } from "../../domain/PlainUserSchema";
import SchemaValidator from "../../domain/SchemaValidator";
import User from "../../domain/User";

export default interface Dependencies {
  getUserById: GetUserById;
  saveUser: SaveUser;
  userDataValidator: SchemaValidator<UserData>;
  verifyUserAuthToken: VerifyToken;
}

export interface GetUserById {
  (id: string): Promise<User | null>;
}

export interface SaveUser {
  (u: User): Promise<void>;
}
