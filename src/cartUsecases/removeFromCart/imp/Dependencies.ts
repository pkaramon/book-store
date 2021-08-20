import VerifyToken from "../../../auth/VerifyToken";
import Databases from "../../CartRelatedAction/Databases";

export default interface Dependencies {
  verifyUserToken: VerifyToken;
  userDb: Databases["user"];
  bookDb: Databases["book"];
  cartDb: Databases["cart"];
}
