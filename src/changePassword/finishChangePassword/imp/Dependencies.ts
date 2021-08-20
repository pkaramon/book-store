import MakePassword from "../../../domain/Password/MakePassword";
import User from "../../../domain/User";

export default interface Dependencies {
  verifyResetPasswordToken: VerifyResetPasswordToken;
  validateRawPassword: ValidateRawPassword;
  userDb: UserDb;
  makePassword: MakePassword;
}

export interface UserDb {
  save(u: User): Promise<void>;
  getById(id: string): Promise<User | null>;
}

export interface VerifyResetPasswordToken {
  (token: string):
    | Promise<{ isValid: boolean; userId?: string }>
    | { isValid: boolean; userId?: string };
}

export interface ValidateRawPassword {
  (password: string): {
    password: string;
    isValid: boolean;
    errorMessages: string[];
  };
}
