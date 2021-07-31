import Book from "../domain/Book";
import DeleteBook, {
  BookNotFound,
  CouldNotCompleteRequest,
  Dependencies,
  InputData,
  NotAllowed,
} from "./interface";

export default function buildDeleteBook({
  deleteBookById,
  getBookById,
  verifyUserAuthToken,
}: Dependencies): DeleteBook {
  return async function (data: InputData) {
    const userId = await verifyUserAuthToken(data.userAuthToken);
    const book = await tryToGetBook(data.bookId);
    await tryToDeleteBook(validateBook(book, { userId, bookId: data.bookId }));
  };

  async function tryToGetBook(bookId: string) {
    try {
      return await getBookById(bookId);
    } catch {
      throw new CouldNotCompleteRequest("could not get the book from db");
    }
  }

  function validateBook(
    book: Book | null,
    data: { userId: string; bookId: string }
  ): Book {
    if (book === null) throw new BookNotFound(data.bookId);
    if (book.authorId !== data.userId)
      throw new NotAllowed(data.userId, data.bookId);
    return book;
  }

  async function tryToDeleteBook(book: Book) {
    try {
      await deleteBookById(book.id);
    } catch {
      throw new CouldNotCompleteRequest("could not delete the book from db");
    }
  }
}
