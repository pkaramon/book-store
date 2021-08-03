import Customer from ".";
import { UserInfo } from "../User";

export default interface MakeCustomer {
  (data: CustomerData): Promise<Customer> | Customer;
}

export type CustomerData = Omit<UserInfo, "id"> & { id?: string };
