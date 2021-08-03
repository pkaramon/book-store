import MakeAdmin from "../domain/Admin/MakeAdmin";
import Admin from "../domain/Customer";
import { UserData } from "../domain/User";

const makeAdmin: MakeAdmin = (data) => {
  return new AdminImp({
    ...data,
    id: data.id ?? Math.random().toString(),
  });
};
export default makeAdmin;

export class AdminImp implements Admin {
  constructor(private _info: { id: string } & UserData) {}

  get info() {
    return this._info;
  }

  get id() {
    return this.info.id;
  }

  changeFirstName(value: string): void {
    this._info.firstName = value;
  }
  changeLastName(value: string): void {
    this._info.lastName = value;
  }
  changePassword(value: string): void {
    this._info.password = value;
  }
  changeBirthDate(value: Date): void {
    this._info.birthDate = value;
  }
}
