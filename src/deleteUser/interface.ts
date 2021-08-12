export default interface DeleteUser {
  (data: InputData): Promise<{ userId: string }>;
}

export interface InputData {
  userAuthToken: string;
}

export class UserAlreadyDeleted extends Error {
  constructor(public userId: string) {
    super();
    this.name = UserAlreadyDeleted.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(message: string, public readonly originalError: any) {
    super(message);
    this.name = CouldNotCompleteRequest.name;
  }
}
