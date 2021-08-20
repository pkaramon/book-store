import User from "../../../domain/User";
import FinishChangePassword, {
  InputData,
  InvalidResetPasswordToken,
  CouldNotCompleteRequest,
  UserNotFound,
  InvalidNewPassword,
} from "../interface";
import Dependencies from "./Dependencies";

export default function buildFinishChangePassword({
  userDb,
  ...deps
}: Dependencies): FinishChangePassword {
  async function finishChangePassword({ token, newPassword }: InputData) {
    const userId = await verifyResetPasswordToken(token);
    const user = await getUser(userId);
    const newPass = validateNewPassword(newPassword);
    user.changePassword(await createPassword(newPass));
    await save(user);
    return { userId };
  }

  async function verifyResetPasswordToken(token: string) {
    const res = await verifyToken(token);
    if (!res.isValid) throw new InvalidResetPasswordToken(token);
    return res.userId!;
  }

  async function verifyToken(token: string) {
    try {
      return await deps.verifyResetPasswordToken(token);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not verify password token", e);
    }
  }

  async function getUser(userId: string) {
    const user = await tryToGetUser(userId);
    if (user === null) throw new UserNotFound(userId);
    return user;
  }

  async function tryToGetUser(id: string) {
    try {
      return await userDb.getById(id);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not talk to db", e);
    }
  }

  function validateNewPassword(pass: string) {
    const { isValid, password, errorMessages } = deps.validateRawPassword(pass);
    if (!isValid) throw new InvalidNewPassword(password, errorMessages);
    return password;
  }

  async function createPassword(password: string) {
    try {
      return await deps.makePassword({ password, isHashed: false });
    } catch (e) {
      throw new CouldNotCompleteRequest("could not create password", e);
    }
  }

  async function save(u: User) {
    try {
      await userDb.save(u);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not save user", e);
    }
  }
  return finishChangePassword;
}
