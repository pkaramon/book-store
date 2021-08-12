import VerifyToken from "../auth/VerifyToken";
import Admin from "../domain/Admin";
import Book, { BookStatus } from "../domain/Book";
import User from "../domain/User";
import PublishBook, {
  AdminNotFound,
  AlreadyPublished,
  BookNotFound,
  CouldNotCompleteRequest,
  InputData,
  UserIsNotAdmin,
} from "./interface";

export interface Dependencies {
  getBookById: (id: string) => Promise<Book | null>;
  saveBook: (b: Book) => Promise<void>;
  getUserById: (id: string) => Promise<User | null>;
  verifyAdminAuthToken: VerifyToken;
}

export default function buildPublishBook({
  getBookById,
  saveBook,
  getUserById,
  verifyAdminAuthToken,
}: Dependencies): PublishBook {
  async function publishBook(data: InputData) {
    const adminId = await verifyAdminAuthToken(data.adminAuthToken);
    await validateAdmin(adminId);
    const book = checkIfBookWasFound(data.bookId, await getBook(data.bookId));
    checkIfBookWasAlreadyPublished(book);
    book.publish();
    await save(book);
  }

  async function validateAdmin(userId: string) {
    const user = await tryToGetUser(userId);
    if (user === null) throw new AdminNotFound(userId);
    if (!(user instanceof Admin)) throw new UserIsNotAdmin(userId);
  }

  async function tryToGetUser(userId: string) {
    try {
      return await getUserById(userId);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get user from db", e);
    }
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
