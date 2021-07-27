import CreateToken from "../auth/CreateToken";
import User from "../domain/User";

export default interface Login {
  (data: LoginData): Promise<{ token: string }>;
}

export interface LoginData {
  email: string;
  password: string;
}

export class CouldNotCompleteRequest extends Error {
  constructor(public reason: string, public originalError: any) {
    super(reason);
  }
}

export class InvalidLoginData extends Error {
  constructor() {
    super();
    this.name = InvalidLoginData.name;
  }
}

export interface Dependencies {
  getUserByEmail: GetUserByEmail;
  comparePasswords: ComparePasswords;
  createToken: CreateToken;
}

export interface GetUserByEmail {
  (email: string): Promise<User | null>;
}

export interface ComparePasswords {
  (passwords: { hashed: string; notHashed: string }): Promise<boolean>;
}
