import User, { UserData } from "../../domain/User";
import RegisterUser, {
  InputData,
  Dependencies,
  CouldNotCompleteRequest,
  InvalidUserRegisterData,
} from "../interface";
import validateData from "./validateData";

export default function buildRegisterUser({
  saveUser,
  createId,
  hashPassword,
  userDataValidator,
}: Dependencies): RegisterUser {
  return async function (data: InputData) {
    const cleaned = validateData(userDataValidator, data);
    const user = await createUser(cleaned);
    await tryToSaveUser(user);
    return { userId: user.id };
  };

  async function createUser(data: InputData) {
    return new User({
      id: createId(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: await tryToHashPassword(data.password),
      birthDate: data.birthDate,
    });
  }

  async function tryToHashPassword(pass: string) {
    try {
      return await hashPassword(pass);
    } catch {
      throw new CouldNotCompleteRequest("hashing failure");
    }
  }

  async function tryToSaveUser(u: User) {
    try {
      await saveUser(u);
    } catch {
      throw new CouldNotCompleteRequest("could not save the user");
    }
  }
}
