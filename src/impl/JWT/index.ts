import jwt from "jsonwebtoken";
import { TokenVerificationError } from "../../auth/VerifyToken";

export default class JWTManager {
  constructor(private secretKey: string) {
    this.createTokenFor = this.createTokenFor.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
  }

  async createTokenFor(userId: string): Promise<string> {
    return jwt.sign({ userId }, this.secretKey);
  }

  async verifyToken(token: string): Promise<string> {
    try {
      const payload = jwt.verify(token, this.secretKey) as { userId: string };
      return payload.userId;
    } catch (e) {
      throw new TokenVerificationError(token);
    }
  }
}
