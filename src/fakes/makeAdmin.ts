import MakeAdmin from "../domain/Admin/MakeAdmin";
import { AdminInfo } from "../domain/Admin";
import User from "../domain/User";
import Password from "../domain/Password";

const makeAdmin: MakeAdmin = (info) => {
  return new AdminImp({
    ...info,
    id: info.id ?? Math.random().toString(),
  });
};

class AdminImp extends User {
  constructor(private _info: AdminInfo) {
    super();
  }

  get info() {
    return this._info;
  }

  changePassword(pass: Password) {
    this._info.password = pass;
  }
}

export default makeAdmin;
