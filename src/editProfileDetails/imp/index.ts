import User from "../../domain/User";
import EditProfileDetails, {
  Dependencies,
  InputData,
  CouldNotCompleteRequest,
  UserNotFound,
} from "../interface";
import UserDetailsUpdater from "./UserDetailsUpdater";

export default function buildEditProfileDetails({
  getUserById,
  saveUser,
  userDataValidator,
  verifyUserAuthToken,
}: Dependencies): EditProfileDetails {
  return async function (data: InputData) {
    const userId = await verifyUserAuthToken(data.userAuthToken);
    const user = await tryToGetUser(userId);
    validateUser(user, userId);
    const updater = new UserDetailsUpdater(
      user!,
      userDataValidator,
      data.toUpdate
    );
    updater.update();
    await tryToSaveUser(user!);
  };

  async function tryToGetUser(userId: string) {
    try {
      return await getUserById(userId);
    } catch {
      throw new CouldNotCompleteRequest("could not get the user from db");
    }
  }

  function validateUser(user: User | null, userId: string) {
    if (user === null) throw new UserNotFound(userId);
  }

  async function tryToSaveUser(u: User) {
    try {
      await saveUser(u);
    } catch {
      throw new CouldNotCompleteRequest("could not save the user to db");
    }
  }
}
