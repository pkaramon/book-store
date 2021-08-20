import VerifyToken from "../../../auth/VerifyToken";
import Book from "../../../domain/Book";
import Databases from "../../CartRelatedAction/Databases";

interface Dependencies {
  verifyUserToken: VerifyToken;
  userDb: Databases["user"];
  cartDb: Databases["cart"];
  bookDb: BookDb;
}

type BaseBookDb = Databases["book"];
interface BookDb extends BaseBookDb {
  getById(id: string): Promise<Book | null>;
}

export default Dependencies;
