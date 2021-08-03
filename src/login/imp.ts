import Password from "../domain/Password";
import User from "../domain/User";
import Login, {
  CouldNotCompleteRequest,
  Dependencies,
  InvalidLoginData,
  LoginData,
} from "./interface";

export default function buildLogin({
  getUserByEmail,
  createToken,
}: Dependencies): Login {
  return async function login(data: LoginData) {
    const user = await getUser(data.email);
    await checkIfPasswordsMatch(user.password, data.password);
    return { token: await tryToCreateToken(user) };
  };

  async function getUser(email: string) {
    const u = await tryToGetUser(email);
    if (u === null) throw new InvalidLoginData();
    return u;
  }

  async function tryToGetUser(email: string) {
    try {
      return await getUserByEmail(email);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not talk to db", e);
    }
  }

  async function checkIfPasswordsMatch(
    usersPassword: Password,
    password: string
  ) {
    const areEqual = await arePasswordsEqual(usersPassword, password);
    if (!areEqual) throw new InvalidLoginData();
  }

  async function arePasswordsEqual(usersPassword: Password, password: string) {
    try {
      return await usersPassword.isEqual(password);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not compare passwords", e);
    }
  }

  async function tryToCreateToken(user: User) {
    try {
      return await createToken(user.info.id);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not create token", e);
    }
  }
}
