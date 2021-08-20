import VerifyToken from "../auth/VerifyToken";
import Book from "../domain/Book";
import DeleteBook, {
  BookNotFound,
  CouldNotCompleteRequest,
  InputData,
  NotAllowed,
} from "./interface";

export interface Dependencies {
  verifyUserAuthToken: VerifyToken;
  bookDb: BookDb;
}
export interface BookDb {
  deleteById(id: string): Promise<void>;
  getById(id: string): Promise<Book | null>;
}

export default function buildDeleteBook({
  bookDb,
  verifyUserAuthToken,
}: Dependencies): DeleteBook {
  async function deleteBook(data: InputData) {
    const userId = await verifyUserAuthToken(data.userAuthToken);
    const book = await tryToGetBook(data.bookId);
    await tryToDeleteBook(validateBook(book, { userId, bookId: data.bookId }));
  }

  async function tryToGetBook(bookId: string) {
    try {
      return await bookDb.getById(bookId);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get the book from db", e);
    }
  }

  function validateBook(
    book: Book | null,
    data: { userId: string; bookId: string }
  ): Book {
    if (book === null) throw new BookNotFound(data.bookId);
    if (book.info.authorId !== data.userId)
      throw new NotAllowed(data.userId, data.bookId);
    return book;
  }

  async function tryToDeleteBook(book: Book) {
    try {
      await bookDb.deleteById(book.info.id);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not delete the book from db", e);
    }
  }
  return deleteBook;
}
