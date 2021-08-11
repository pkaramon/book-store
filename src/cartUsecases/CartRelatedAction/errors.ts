export class UserNotFound extends Error {
  constructor(public readonly userId: string) {
    super();
    this.name = UserNotFound.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(message: string, public readonly originalError: any) {
    super(message);
    this.name = CouldNotCompleteRequest.name;
  }
}

export class InvalidUserType extends Error {
  constructor(public wanted: string, public received: string) {
    super(`invalid user type wanted: ${wanted} but received ${received}`);
    this.name = InvalidUserType.name;
  }
}
