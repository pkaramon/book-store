import CustomUser from "../CustomUser";
import { UserInfo } from "../User";

export default class BookAuthor extends CustomUser {
  constructor(private bookAuthorInfo: BookAuthorInfo) {
    super(bookAuthorInfo);
  }

  get info() {
    return this.bookAuthorInfo;
  }
}

export interface BookAuthorInfo extends UserInfo {
  bio: string;
}
