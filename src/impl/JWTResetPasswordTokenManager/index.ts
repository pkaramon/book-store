import * as jwt from "jsonwebtoken";
import ResetPasswordTokenManager from "../../changePassword/ResetPasswordTokenManager";

export default class JWTResetPasswordTokenManager
  implements ResetPasswordTokenManager
{
  constructor(private secretKey: string) {}

  async verify(token: string) {
    try {
      const payload = jwt.verify(token, this.secretKey) as any;
      return { isValid: true, userId: payload.userId };
    } catch {
      return { isValid: false };
    }
  }

  async create({
    userId,
    expiresInMinutes,
  }: {
    userId: string;
    email: string;
    expiresInMinutes: number;
  }) {
    const expiresIn = expiresInMinutes * 60;
    return jwt.sign({ userId }, this.secretKey, { expiresIn });
  }
}
