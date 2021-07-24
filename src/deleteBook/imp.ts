import Book from "../domain/Book";
import DeleteBook, {
  BookNotFound,
  CouldNotCompleteRequest,
  DeleteBookById,
  GetBookById,
  InputData,
  NotAllowed,
} from "./interface";

export default function buildDeleteBook(
  deleteBookById: DeleteBookById,
  getBookById: GetBookById
): DeleteBook {
  return async function (data: InputData) {
    const book = await tryToGetBook(data.bookId);
    await tryToDeleteBook(validateBook(book, data));
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
    if (book.authorId !== data.userId) throw new NotAllowed(data.userId);
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
