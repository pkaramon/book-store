import VerifyToken from "../../auth/VerifyToken";
import {
  CouldNotCompleteRequest,
  InvalidUserType,
  UserNotFound,
} from "../CartRelatedAction";
import Book from "../../domain/Book";
import BookAuthor from "../../domain/BookAuthor";
import Cart from "../../domain/Cart";
import User from "../../domain/User";

export default interface AddToCart {
  (data: InputData): Promise<Response>;
}

export interface InputData {
  userAuthToken: string;
  bookId: string;
}

export interface Response {
  cartItems: CartItemOutput[];
}

export interface CartItemOutput {
  bookId: string;
  title: string;
  price: {
    currency: string;
    cents: number;
  };
  author: {
    firstName: string;
    lastName: string;
  };
}

export class BookNotFound extends Error {
  constructor(public readonly bookId: string) {
    super();
    this.name = BookNotFound.name;
  }
}

export { UserNotFound, InvalidUserType, CouldNotCompleteRequest };

export interface Dependencies {
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
