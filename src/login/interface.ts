export default interface Login {
  (data: LoginData): Promise<{ token: string }>;
}

export interface LoginData {
  email: string;
  password: string;
}

export class CouldNotCompleteRequest extends Error {
  constructor(public reason: string, public originalError: any) {
    super(reason);
    this.name = CouldNotCompleteRequest.name;
  }
}

export class InvalidLoginData extends Error {
  constructor() {
    super();
    this.name = InvalidLoginData.name;
  }
}
