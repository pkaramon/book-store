import Customer from "../domain/Customer";
import MakeCustomer, { CustomerData } from "../domain/Customer/MakeCustomer";
import Password from "../domain/Password";

const makeCustomer: MakeCustomer = (data) => {
  return new CustomerImp({
    ...data,
    id: data.id ?? Math.random().toString(),
  });
};
export default makeCustomer;

export class CustomerImp extends Customer {
  constructor(private _info: { id: string } & CustomerData) {
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
