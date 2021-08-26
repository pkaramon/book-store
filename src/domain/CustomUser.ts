import User, { UserInfo } from "./User";

export default abstract class CustomUser extends User {
  constructor(protected _info: UserInfo) {
    super();
  }

  changeFirstName(value: string): void {
    this._info.firstName = value;
  }
  changeLastName(value: string): void {
    this._info.lastName = value;
  }
  changeBirthDate(value: Date): void {
    this._info.birthDate = value;
  }
}
