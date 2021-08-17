type UserId = string;

export default interface VerifyToken {
  (token: string): Promise<UserId>;
}

export class TokenVerificationError extends Error {
  constructor(public readonly invalidToken: string) {
    super(`invalid token: ${invalidToken}`);
    this.name = TokenVerificationError.name;
  }
}
