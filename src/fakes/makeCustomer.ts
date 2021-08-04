import Customer from "../domain/Customer";
import MakeCustomer from "../domain/Customer/MakeCustomer";

const makeCustomer: MakeCustomer = (data) => {
  return new Customer({
    ...data,
    id: data.id ?? Math.random().toString(),
  });
};
export default makeCustomer;
