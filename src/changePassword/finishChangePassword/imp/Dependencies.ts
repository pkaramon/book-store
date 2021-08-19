import MakePassword from "../../../domain/Password/MakePassword";
import User from "../../../domain/User";

export default interface Dependencies {
  verifyResetPasswordToken: VerifyResetPasswordToken;
  validateRawPassword: ValidateRawPassword;
  getUserById: (id: string) => Promise<User | null>;
  saveUser: (u: User) => Promise<void>;
  makePassword: MakePassword;
}

export interface VerifyResetPasswordToken {
  (token: string): Promise<{ isValid: boolean; userId?: string }>;
}


export interface ValidateRawPassword {
  (password: string): {
    password: string;
    isValid: boolean;
    errorMessages: string[];
  };
}
