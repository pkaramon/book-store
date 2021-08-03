import Customer from "../domain/Customer";
import MakeCustomer from "../domain/Customer/MakeCustomer";
import { UserData } from "../domain/User";

const makeCustomer: MakeCustomer = (data) => {
  return new CustomerImp({
    ...data,
    id: data.id ?? Math.random().toString(),
  });
};
export default makeCustomer;

export class CustomerImp implements Customer {
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
