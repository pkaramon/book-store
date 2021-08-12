import CreateToken from "../auth/CreateToken";
import Password from "../domain/Password";
import User from "../domain/User";
import Login, {
  CouldNotCompleteRequest,
  InvalidLoginData,
  LoginData,
} from "./interface";

export interface Dependencies {
  getUserByEmail: GetUserByEmail;
  createToken: CreateToken;
}

export interface GetUserByEmail {
  (email: string): Promise<User | null>;
}

export interface ComparePasswords {
  (passwords: { hashed: string; notHashed: string }): Promise<boolean>;
}

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
    const user = await tryToGetUser(email);
    if (user === null) throw new InvalidLoginData();
    return user;
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
