export default interface RegisterCustomer {
  (data: InputData): Promise<{ userId: string }>;
}

export interface InputData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: Date;
}

export class InvalidCustomerRegisterData extends Error {
  constructor(
    public readonly errorMessages: Partial<Record<keyof InputData, string[]>>,
    public readonly invalidProperties: (keyof InputData)[]
  ) {
    super();
    this.name = InvalidCustomerRegisterData.name;
  }
}

export class EmailAlreadyTaken extends Error {
  constructor(public readonly email: string) {
    super();
    this.name = EmailAlreadyTaken.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(reason: string, public originalError: any) {
    super(reason);
    this.name = CouldNotCompleteRequest.name;
  }
}
