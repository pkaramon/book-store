import User from "../../domain/User";

export default interface FinishChangePassword {
  (data: InputData): Promise<{ userId: string }>;
}

export interface InputData {
  token: string;
  newPassword: string;
}

export class CouldNotCompleteRequest extends Error {
  constructor(reason: string, public originalError: any) {
    super(reason);
  }
}

export class InvalidResetPasswordToken extends Error {
  constructor(public readonly token: string) {
    super(`invalid token: ${token}`);
  }
}
export class UserNotFound extends Error {
  constructor(public readonly userId: string) {
    super(`user with id: ${userId} was not found`);
  }
}

export class InvalidNewPassword extends Error {
  constructor(
    public readonly password: string,
    public readonly errorMessages: string[]
  ) {
    super(`invalid password: ${password}`);
  }
}

export interface Dependencies {
  verifyResetPasswordToken: VerifyResetPasswordToken;
  validatePassword: (password: string) => {
    password: string;
    isValid: boolean;
    errorMessages: string[];
  };
  getUserById: (id: string) => Promise<User | null>;
  saveUser: (u: User) => Promise<void>;
}

interface VerifyResetPasswordToken {
  (token: string): Promise<
    { isValid: true; userId: string } | { isValid: false }
  >;
}
