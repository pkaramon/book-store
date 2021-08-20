import Book from "../../domain/Book";
import BookAuthor from "../../domain/BookAuthor";
import Cart from "../../domain/Cart";
import User from "../../domain/User";

export default interface Databases {
  user: UserDb;
  book: BookDb;
  cart: CartDb;
}

export interface UserDb {
  getById(userId: string): Promise<User | null>;
}

export interface CartDb {
  save(c: Cart): Promise<void>;
  getCartFor(customerId: string): Promise<Cart>;
}

export interface BookDb {
  getBooksWithAuthors(
    booksIds: string[]
  ): Promise<{ book: Book; author: BookAuthor }[]>;
}
