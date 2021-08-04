import Password from "../Password";
import User, { UserInfo } from "../User";

export default class Admin extends User {
  constructor(private _info: AdminInfo) {
    super();
  }

  get info() {
    return this._info;
  }

  changePassword(value: Password): void {
    this._info.password = value;
  }
}

export interface AdminInfo extends UserInfo {}

