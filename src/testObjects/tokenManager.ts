import {TokenVerificationError} from "../auth/VerifyToken";

interface TokenManager {
  createTokenFor(userId: string): Promise<string>;
  verifyToken(token: string): Promise<string>;
}

// token format ***<userId>***
class FakeTokenManager {
  constructor() {
    this.createTokenFor = this.createTokenFor.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
  }

  async createTokenFor(userId: string) {
    return `***${userId}***`;
  }

  async verifyToken(token: string) {
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
    return token.replace(/\*/g, "");
  }
}

const tokenManager: TokenManager = new FakeTokenManager();
export default tokenManager;
