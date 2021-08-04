import Password from "./Password";
import User, { UserInfo } from "./User";

export default abstract class CustomUser extends User {
  constructor(protected _info: UserInfo) {
    super();
  }

  get info() {
    return this._info;
  }

  changeFirstName(value: string): void {
    this._info.firstName = value;
  }
  changeLastName(value: string): void {
    this._info.lastName = value;
  }
  changePassword(value: Password): void {
    this._info.password = value;
  }
  changeBirthDate(value: Date): void {
    this._info.birthDate = value;
  }
}
