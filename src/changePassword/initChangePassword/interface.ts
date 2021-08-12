export default interface InitChangePassword {
  (data: { email: string }): Promise<{ resetPasswordToken: string }>;
}

export class UnknownEmail extends Error {
  constructor(public readonly email: string) {
    super();
  }
}

export class TokenCouldNotBeDeliver extends Error {}

export class CouldNotCompleteRequest extends Error {
  constructor(reason: string, public originalError: any) {
    super(reason);
  }
}
