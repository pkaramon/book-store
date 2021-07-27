import User from "../domain/User";
import Login, {
  CouldNotCompleteRequest,
  Dependencies,
  InvalidLoginData,
  LoginData,
} from "./interface";

export default function buildLogin({
  getUserByEmail,
  comparePasswords,
  createToken,
}: Dependencies): Login {
  return async function login(data: LoginData) {
    const user = await getUser(data.email);
    await checkIfPasswordsMatch(user.password, data.password);
    return { token: tryToCreateToken(user) };
  };

  function tryToCreateToken(user: User) {
    try {
      return createToken(user);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not create token", e);
    }
  }

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
    usersPassword: string,
    password: string
  ) {
    if (await arePasswordsNotEqual(usersPassword, password))
      throw new InvalidLoginData();
  }

  async function arePasswordsNotEqual(usersPassword: string, password: string) {
    try {
      const areEqual = await comparePasswords({
        notHashed: password,
        hashed: usersPassword,
      });
      return !areEqual;
    } catch (e) {
      throw new CouldNotCompleteRequest("could not compare passwords", e);
    }
  }
}
