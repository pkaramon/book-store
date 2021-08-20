import Customer, { CustomerInfo } from "../domain/Customer";
import makePassword from "./makePassword";

export default async function getFakeCustomer(newInfo?: Partial<CustomerInfo>) {
  return new Customer({
    id: "1",
    email: "bob@mail.com",
    firstName: "bob",
    lastName: "smith",
    birthDate: new Date(2000, 1, 1),
    password: await makePassword({ password: "Pass123$", isHashed: false }),
    ...newInfo,
  });
}
