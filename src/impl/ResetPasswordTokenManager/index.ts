import { CreateResetPasswordToken } from "../../changePassword/initChangePassword/imp/Dependencies";
import { VerifyResetPasswordToken } from "../../changePassword/finishChangePassword/imp/Dependencies";
import * as jwt from "jsonwebtoken";

export default class ResetPasswordTokenManager {
  constructor(private secretKey: string) {}

  verify: VerifyResetPasswordToken = async (token: string) => {
    try {
      const payload = jwt.verify(token, this.secretKey) as any;
      return { isValid: true, userId: payload.userId };
    } catch {
      return { isValid: false };
    }
  };

  create: CreateResetPasswordToken = async ({ userId, expiresInMinutes }) => {
    const expiresIn = expiresInMinutes * 60;
    return jwt.sign({ userId }, this.secretKey, { expiresIn });
  };
}
