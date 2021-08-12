import VerifyToken from "../../../auth/VerifyToken";
import Book from "../../../domain/Book";
import BookAuthor from "../../../domain/BookAuthor";
import Cart from "../../../domain/Cart";
import User from "../../../domain/User";

export default interface Dependencies {
  verifyUserToken: VerifyToken;
  getUserById: (userID: string) => Promise<User | null>;
  saveCart: (cart: Cart) => Promise<void>;
  getCartFor: (customerId: string) => Promise<Cart>;
  getBooksWithAuthors(
    booksIds: string[]
  ): Promise<{ book: Book; author: BookAuthor }[]>;
}
