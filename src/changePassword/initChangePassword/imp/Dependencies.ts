import User from "../../../domain/User";

export default interface Dependencies {
  getUserByEmail: GetUserByEmail;
  deliverResetPasswordTokenToUser: DeliverResetPasswordTokenToUser;
  createResetPasswordToken: CreateResetPasswordToken;
}

export interface GetUserByEmail {
  (email: string): Promise<User | null>;
}

export interface CreateResetPasswordToken {
  (userInfo: { userId: string; email: string }, expiresInMinutes: number):
    | Promise<string>
    | string;
}

export interface DeliverResetPasswordTokenToUser {
  (u: User, token: string): Promise<void>;
}
