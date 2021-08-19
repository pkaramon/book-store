import ResetPasswordTokenManager, {
  MaybePromise,
} from "../changePassword/ResetPasswordTokenManager";

class FakeResetPasswordTokenManager implements ResetPasswordTokenManager {
  create(info: {
    userId: string;
    email: string;
    expiresInMinutes: number;
  }): MaybePromise<string> {
    return `${info.userId} ${info.email}`;
  }

  verify(
    token: string
  ): MaybePromise<{ isValid: boolean; userId?: string | undefined }> {
    const [userId, email] = token.split(" ");
    if (email.includes("@")) return { isValid: true, userId };
    return { isValid: false as false };
  }
}

const resetPasswordTokenManager: ResetPasswordTokenManager =
  new FakeResetPasswordTokenManager();

export default resetPasswordTokenManager;
