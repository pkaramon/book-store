import VerifyToken from "../auth/VerifyToken";
import DeleteUser, {
  CouldNotCompleteRequest,
  InputData,
  UserAlreadyDeleted,
} from "./interface";


export interface Dependencies {
  verifyUserToken: VerifyToken;
  deleteUserById: (userId: string) => Promise<{ wasDeleted: boolean }>;
}

export default function buildDeleteUser(deps: Dependencies): DeleteUser {
  async function deleteUser({ userAuthToken }: InputData) {
    const userId = await deps.verifyUserToken(userAuthToken);
    const { wasDeleted } = await tryToDeleteUser(userId);
    if (!wasDeleted) throw new UserAlreadyDeleted(userId);
    return { userId };
  }

  async function tryToDeleteUser(userId: string) {
    try {
      return await deps.deleteUserById(userId);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not delete the user", e);
    }
  }

  return deleteUser;
}
