import User from "../../domain/User";
import EditProfileDetails, {
  Dependencies,
  EditProfileInputData,
  CouldNotCompleteRequest,
  UserNotFound,
} from "../interface";
import UserDetailsUpdater from "./UserDetailsUpdater";

export default function buildEditProfileDetails({
  getUserById,
  saveUser,
  userDataValidator,
}: Dependencies): EditProfileDetails {
  return async function (data: EditProfileInputData) {
    const user = await tryToGetUser(data.userId);
    validateUser(user, data);
    const updater = new UserDetailsUpdater(user!, userDataValidator, data);
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

  function validateUser(user: User | null, data: EditProfileInputData) {
    if (user === null) throw new UserNotFound(data.userId);
  }

  async function tryToSaveUser(u: User) {
    try {
      await saveUser(u);
    } catch {
      throw new CouldNotCompleteRequest("could not save the user to db");
    }
  }
}
