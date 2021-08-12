export default interface RegisterBookAuthor {
  (data: InputData): Promise<{ userId: string }>;
}

export interface InputData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: Date;
  bio: string;
}

export class EmailAlreadyTaken extends Error {
  constructor(public readonly email: string) {
    super();
    this.name = EmailAlreadyTaken.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(message: string, public readonly originalError: any) {
    super(message);
    this.name = CouldNotCompleteRequest.name;
  }
}

export class InvalidBookAuthorRegisterData extends Error {
  constructor(
    public readonly errorMessages: Partial<Record<keyof InputData, string[]>>,
    public readonly invalidProperties: (keyof InputData)[]
  ) {
    super();
    this.name = InvalidBookAuthorRegisterData.name;
  }
}
