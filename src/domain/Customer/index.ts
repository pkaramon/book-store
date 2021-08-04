import CustomUser from "../CustomUser";
import { UserInfo } from "../User";

export interface CustomerInfo extends UserInfo {}

export default class Customer extends CustomUser {
  constructor(_info: CustomerInfo) {
    super(_info);
  }
}
