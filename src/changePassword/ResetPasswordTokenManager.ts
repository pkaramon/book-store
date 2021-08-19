export default interface ResetPasswordTokenManager {
  create(info: {
    userId: string;
    email: string;
    expiresInMinutes: number;
  }): MaybePromise<string>;
  verify(token: string): MaybePromise<{ isValid: boolean; userId?: string }>;
}

export type MaybePromise<T> = Promise<T> | T;
