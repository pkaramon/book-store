import VerifyToken from "../../../auth/VerifyToken";
import Book from "../../../domain/Book";
import BookAuthor from "../../../domain/BookAuthor";
import Cart from "../../../domain/Cart";
import User from "../../../domain/User";

export default interface Dependencies {
  verifyUserToken: VerifyToken;
  db: Database;
}

export interface Database {
  getUserById(userId: string): Promise<User | null>;
  getBookById(bookId: string): Promise<Book | null>;
  saveCart(c: Cart): Promise<void>;
  getCartFor(customerId: string): Promise<Cart>;
  getBooksWithAuthors(
    booksIds: string[]
  ): Promise<{ book: Book; author: BookAuthor }[]>;
}
