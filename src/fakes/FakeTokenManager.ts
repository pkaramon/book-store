import { TokenVerificationError } from "../auth/VerifyToken";
import User from "../domain/User";

export default class FakeTokenManager {
  constructor() {
    this.createToken = this.createToken.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
  }

  createToken(u: User) {
    return `***${u.id}***`;
  }

  verifyToken(token: string) {
    if (this.isTokenValid(token)) {
      return this.extractUserIdFromToken(token);
    } else {
      throw new TokenVerificationError(token);
    }
  }

  private isTokenValid(token: string) {
    return token.startsWith("***") && token.endsWith("***");
  }

  private extractUserIdFromToken(token: string) {
    return token.replace("*", "");
  }
}
