import Customer from ".";
import { UserData } from "../User";

export default interface MakeCustomer {
  (data: CustomerData): Promise<Customer> | Customer;
}

export interface CustomerData extends UserData {
  id?: string;
}
