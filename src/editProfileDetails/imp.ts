import User from "../domain/User";
import EditProfileDetails, {
  CouldNotCompleteRequest,
  EditProfileInputData,
  EditProfileDetailsErrorMessages,
  InvalidEditProfileData,
  UserNotFound,
  Dependencies,
} from "./interface";

export default function buildEditProfileDetails({
  getUserById,
  saveUser,
  now,
}: Dependencies): EditProfileDetails {
  return async function (data: EditProfileInputData) {
    const user = await tryToGetUser(data.userId);
    const errorMessages: EditProfileDetailsErrorMessages = {};
    if (user === null) throw new UserNotFound(data.userId);
    if (data.firstName !== undefined) {
      if ((data.firstName ?? "").trim().length === 0) {
        errorMessages.firstName = "firstName cannot be empty";
      } else {
        user.firstName = data.firstName;
      }
    }

    if (data.lastName !== undefined) {
      if ((data.lastName ?? "").trim().length === 0) {
        errorMessages.lastName = "lastName cannot be empty";
      } else {
        user.lastName = data.lastName;
      }
    }

    if (data.birthDate !== undefined) {
      if (data.birthDate.getTime() > now().getTime())
        errorMessages.birthDate = "birthDate cannot be in the future";
      user.birthDate = data.birthDate;
    }

    if (Reflect.ownKeys(errorMessages).length) {
      throw new InvalidEditProfileData(errorMessages);
    }

    user.firstName = data.firstName!;
    await tryToSaveUser(user);
  };

  async function tryToGetUser(userId: string) {
    try {
      return await getUserById(userId);
    } catch {
      throw new CouldNotCompleteRequest("could not get the user from db");
    }
  }
  async function tryToSaveUser(u: User) {
    try {
      await saveUser(u);
    } catch {
      throw new CouldNotCompleteRequest("could not save the user to db");
    }
  }
}
