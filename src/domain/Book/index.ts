import BookInfo from "./BookInfo";
import BookStatus from "./BookStatus";
import TableOfContents from "./TableOfContents";

export default class Book {
  constructor(private _info: BookInfo) {}

  get info() {
    return this._info;
  }

  publish() {
    this._info.status = BookStatus.published;
  }
}

export { BookStatus, BookInfo, TableOfContents };
