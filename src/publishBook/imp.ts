import Book, { BookStatus } from "../domain/Book";
import PublishBook, {
  AdminNotFound,
  AlreadyPublished,
  BookNotFound,
  CouldNotCompleteRequest,
  Dependencies,
} from "./interface";

export default function buildPublishBook({
  getBookById,
  saveBook,
  getAdminById,
}: Dependencies): PublishBook {
  return async function publishBook(data: { adminId: string; bookId: string }) {
    await checkIfAdminExists(data.adminId);
    const book = checkIfBookWasFound(data.bookId, await getBook(data.bookId));
    checkIfBookWasAlreadyPublished(book);
    book.publish();
    await save(book);
  };

  async function checkIfAdminExists(adminId: string) {
    if ((await getAdminById(adminId)) === null)
      throw new AdminNotFound(adminId);
  }

  async function getBook(bookId: string) {
    try {
      return await getBookById(bookId);
    } catch (e) {
      throw new CouldNotCompleteRequest(
        "could not get the book from database",
        e
      );
    }
  }

  function checkIfBookWasFound(bookId: string, book: Book | null) {
    if (book === null) throw new BookNotFound(bookId);
    return book;
  }

  function checkIfBookWasAlreadyPublished(book: Book) {
    if (book.status === BookStatus.published)
      throw new AlreadyPublished(book.id);
  }

  async function save(b: Book) {
    try {
      await saveBook(b);
    } catch (e) {
      throw new CouldNotCompleteRequest(
        "could not save the book to database",
        e
      );
    }
  }
}
