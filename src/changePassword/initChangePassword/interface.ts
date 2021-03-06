export default interface InitChangePassword {
  (data: { email: string }): Promise<{ resetPasswordToken: string }>;
}

export class UnknownEmail extends Error {
  constructor(public readonly email: string) {
    super();
    this.name = UnknownEmail.name;
  }
}

export class TokenCouldNotBeDeliver extends Error {
  constructor() {
    super();
    this.name = TokenCouldNotBeDeliver.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(reason: string, public originalError: any) {
    super(reason);
    this.name = CouldNotCompleteRequest.name;
  }
}
