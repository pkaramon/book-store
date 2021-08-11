import Book from "../../domain/Book";
import BookAuthor from "../../domain/BookAuthor";
import Cart from "../../domain/Cart";
import User from "../../domain/User";

export default interface Database {
  getUserById(userId: string): Promise<User | null>;
  saveCart(c: Cart): Promise<void>;
  getCartFor(customerId: string): Promise<Cart>;
  getBooksWithAuthors(
    booksIds: string[]
  ): Promise<{ book: Book; author: BookAuthor }[]>;
}
