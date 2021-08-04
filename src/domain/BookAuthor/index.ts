import CustomUser from "../CustomUser";
import { UserInfo } from "../User";

export default class BookAuthor extends CustomUser {
  constructor(_info: BookAuthorInfo) {
    super(_info);
  }
}

export interface BookAuthorInfo extends UserInfo {}
