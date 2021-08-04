import Customer, { CustomerInfo } from ".";

export default interface MakeCustomer {
  (data: CustomerData): Promise<Customer> | Customer;
}

export type CustomerData = Omit<CustomerInfo, "id"> & { id?: string };
