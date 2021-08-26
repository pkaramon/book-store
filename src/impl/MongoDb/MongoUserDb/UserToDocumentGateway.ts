import User from "../../../domain/User";
import UserDocument from "./UserDocument";

export default interface UserToDocumentGateway {
  fromUserToDocument(user: User): Promise<UserDocument> | UserDocument;
  fromDocumentToUser(document: UserDocument): Promise<User> | User;
}
