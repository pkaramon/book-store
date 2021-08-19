import User from "../../../domain/User";
import InitChangePassword, {
  UnknownEmail,
  CouldNotCompleteRequest,
  TokenCouldNotBeDeliver,
} from "../interface";
import Dependencies from "./Dependencies";

export default function buildInitChangePassword({
  getUserByEmail,
  createResetPasswordToken,
  deliverResetPasswordTokenToUser,
}: Dependencies): InitChangePassword {
  async function initChangePassword({ email }: { email: string }) {
    const user = await checkIfEmailBelongsToOneOfUsers(email);
    const resetPasswordToken = await createTokenFor(user);
    await deliverTokenToUser(user, resetPasswordToken);
    return { resetPasswordToken };
  }

  async function checkIfEmailBelongsToOneOfUsers(email: string) {
    email = email.trim();
    const user = await getUser(email);
    if (user === null) throw new UnknownEmail(email);
    return user;
  }

  async function getUser(email: string) {
    try {
      return await getUserByEmail(email);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get user from db", e);
    }
  }

  async function createTokenFor(user: User) {
    try {
      return await createResetPasswordToken({
        email: user.info.email,
        userId: user.info.id,
        expiresInMinutes: 5,
      });
    } catch (e) {
      throw new CouldNotCompleteRequest(
        "could not create reset password token",
        e
      );
    }
  }

  async function deliverTokenToUser(user: User, token: string) {
    try {
      await deliverResetPasswordTokenToUser(user, token);
    } catch {
      throw new TokenCouldNotBeDeliver();
    }
  }
  return initChangePassword;
}
