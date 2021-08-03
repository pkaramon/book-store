import Book, { BookInfo, BookStatus } from "../domain/Book";
import MakeBook from "../domain/Book/MakeBook";

const makeBook: MakeBook = async (info) => {
  return new BookImp({
    id: info.id ?? Math.random().toString(),
    ...info,
  });
};

export default makeBook;

class BookImp implements Book {
  constructor(private _info: BookInfo) {}

  get info() {
    return this._info;
  }

  publish() {
    this._info.status = BookStatus.published;
  }
}
