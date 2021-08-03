import User from "../../domain/User";
import RegisterCustomer, {
  InputData,
  Dependencies,
  CouldNotCompleteRequest,
} from "../interface";
import validateData from "./validateData";

export default function buildRegisterCustomer({
  saveUser,
  userDataValidator,
  notifyUser,
  getUserByEmail,
  makeCustomer,
  makePassword,
}: Dependencies): RegisterCustomer {
  return async function registerCustomer(data: InputData) {
    const cleaned = await validateData(getUserByEmail, userDataValidator, data);
    const customer = await createCustomer(cleaned);
    await tryToSaveCustomer(customer);
    await tryToNotifyUser(customer);
    return { userId: customer.info.id };
  };

  async function createCustomer(data: InputData) {
    return makeCustomer({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: await getHashedPassword(data.password),
      birthDate: data.birthDate,
    });
  }

  async function getHashedPassword(password: string) {
    try {
      return await makePassword({ password, isHashed: false });
    } catch (e) {
      throw new CouldNotCompleteRequest("hashing failure", e);
    }
  }

  async function tryToSaveCustomer(u: User) {
    try {
      await saveUser(u);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not save the user", e);
    }
  }

  async function tryToNotifyUser(u: User) {
    try {
      await notifyUser(u);
    } catch {
      // silencing errors is desired in this case
    }
  }
}
