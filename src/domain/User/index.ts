export default interface User {
  readonly info: UserInfo;
  changeFirstName(value: string): void;
  changeLastName(value: string): void;
  changePassword(value: string): void;
  changeBirthDate(value: Date): void;
}

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: Date;
}
