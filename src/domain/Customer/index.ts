import CustomUser from "../CustomUser";
import { UserInfo } from "../User";

export interface CustomerInfo extends UserInfo {}

export default class Customer extends CustomUser {
  constructor(private customerInfo: CustomerInfo) {
    super(customerInfo);
  }

  get info() {
    return this.customerInfo;
  }
  get password() {
    return this.customerInfo.password;
  }
}
