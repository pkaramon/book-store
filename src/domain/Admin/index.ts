import User, { UserInfo } from "../User";

export default class Admin extends User {
  constructor(private _info: AdminInfo) {
    super();
  }

  get info() {
    return this._info;
  }
}

export interface AdminInfo extends UserInfo {}

