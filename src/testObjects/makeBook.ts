import Book from "../domain/Book";
import MakeBook from "../domain/Book/MakeBook";

const makeBook: MakeBook = async (info) => {
  return new BookImp({
    id: info.id ?? Math.random().toString(),
    ...info,
  });
};

export default makeBook;

class BookImp extends Book {}
