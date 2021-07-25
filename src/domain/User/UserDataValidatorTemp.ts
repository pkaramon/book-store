import { UserData } from ".";

export default interface UserDataValidatorTemp {
  validateUserData(data: UserData): UserData;
  validateFirstName(firstName: string): string;
  validateLastName(lastName: string): string;
  validateEmail(email: string): string;
  validatePassword(password: string): string;
  validateBirthDate(birthDate: Date): Date;
}

export class InvalidUserData extends Error {
  constructor(public errorMessages: Record<keyof UserData, string | string[]>) {
    super();
  }
  get invalidProperties() {
    return Reflect.ownKeys(this.errorMessages);
  }
}

export class InvalidUserDataProperty extends Error {
  constructor(
    public key: keyof UserData,
    public errorMessage: string | string[]
  ) {
    super();
  }
}
