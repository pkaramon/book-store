export default interface RegisterAdmin {
  (data: InputData): Promise<{ adminId: string }>;
}

export interface InputData {
  superAdminToken: string;
  adminData: AdminData;
}

export interface AdminData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: Date;
}

export class InvalidSuperAdminCredentials extends Error {
  constructor() {
    super();
    this.name = InvalidSuperAdminCredentials.name;
  }
}

type AdminDataErrorMessages = Partial<Record<keyof AdminData, string[]>>;
export class InvalidAdminData extends Error {
  constructor(
    public errorMessages: AdminDataErrorMessages,
    public invalidProperties: (keyof AdminData)[]
  ) {
    super();
    this.name = InvalidAdminData.name;
  }
}

export class EmailAlreadyTaken extends Error {
  constructor(public readonly email: string) {
    super();
    this.name = EmailAlreadyTaken.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(
    public readonly message: string,
    public readonly originalError: Error
  ) {
    super();
    this.name = CouldNotCompleteRequest.name;
  }
}
