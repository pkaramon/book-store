import Book, { BookStatus } from "../domain/Book";
import PublishBook, {
  AdminNotFound,
  AlreadyPublished,
  BookNotFound,
  CouldNotCompleteRequest,
  Dependencies,
  InputData,
} from "./interface";

export default function buildPublishBook({
  getBookById,
  saveBook,
  getAdminById,
  verifyAdminAuthToken,
}: Dependencies): PublishBook {
  async function publishBook(data: InputData) {
    const adminId = await verifyAdminAuthToken(data.adminAuthToken);
    await checkIfAdminExists(adminId);
    const book = checkIfBookWasFound(data.bookId, await getBook(data.bookId));
    checkIfBookWasAlreadyPublished(book);
    book.publish();
    await save(book);
  }

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
    if (book.info.status === BookStatus.published)
      throw new AlreadyPublished(book.info.id);
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

  return publishBook;
}
