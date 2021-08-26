import UserDocument from "../MongoUserDb/UserDocument";
import BookDocument from "./BookDocument";

export default interface BookAndAuthorDocument extends BookDocument {
  author: UserDocument;
}
