import User from "../../domain/User";
import RegisterUser, {
  InputData,
  Dependencies,
  CouldNotCompleteRequest,
} from "../interface";
import validateData from "./validateData";

export default function buildRegisterUser({
  validateEmail,
  now,
  saveUser,
  createId,
  hashPassword,
}: Dependencies): RegisterUser {
  return async function (data: InputData) {
    const cleaned = cleanData(data);
    validateData(cleaned, { now, validateEmail });
    const user = await createUser(cleaned);
    await tryToSaveUser(user);
    return { userId: user.id };
  };

  function cleanData(data: InputData): InputData {
    return {
      ...data,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      password: data.password.trim(),
    };
  }

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
