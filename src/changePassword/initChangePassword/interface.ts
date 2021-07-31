import User from "../../domain/User";

export default interface InitChangePassword {
  (data: { email: string }): Promise<{ resetPasswordToken: string }>;
}

export class UnknownEmail extends Error {
  constructor(public readonly email: string) {
    super();
  }
}

export class TokenCouldNotBeDeliver extends Error {}

export class CouldNotCompleteRequest extends Error {
  constructor(reason: string, public originalError: any) {
    super(reason);
  }
}

export interface Dependencies {
  getUserByEmail: (email: string) => Promise<User | null>;
  deliverResetPasswordTokenToUser: (u: User, token: string) => Promise<void>;
  createResetPasswordToken: (
    userInfo: { userId: string; email: string },
    expiresInMiniutes: number
  ) => Promise<string>;
}
