export default interface User {
  readonly info: { id: string } & UserData;
  changeFirstName(value: string): void;
  changeLastName(value: string): void;
  changePassword(value: string): void;
  changeBirthDate(value: Date): void;
}

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: Date;
}
