import BookInfo from "./BookInfo";
import BookStatus from "./BookStatus";
import Comment from "../Comment";
import TableOfContents from "./TableOfContents";

export default abstract class Book {
  private _comments: Comment[] = [];

  constructor(private _info: BookInfo) {}

  get info() {
    return this._info;
  }

  publish() {
    this._info.status = BookStatus.published;
  }

  addComment(comment: Comment): void {
    this._comments.push(comment);
  }

  getAllComments(): Promise<ArrayLike<Comment>> | ArrayLike<Comment> {
    return this._comments;
  }
}

export { BookStatus, BookInfo, TableOfContents };
