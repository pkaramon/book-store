import Customer from ".";
import { UserInfo } from "../User";

export default interface MakeCustomer {
  (data: CustomerData): Promise<Customer> | Customer;
}

export interface CustomerData extends UserInfo {
  id?: string;
}
