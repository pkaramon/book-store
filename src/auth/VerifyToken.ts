type UserId = string;

export default interface VerifyToken {
  (token: string): UserId;
}

export class TokenVerificationError extends Error {
  constructor(public readonly invalidToken: string) {
    super(`invalid token: ${invalidToken}`);
  }
}
