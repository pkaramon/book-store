import VerifyToken from "../../auth/VerifyToken";
import Book from "../../domain/Book";
import BookAuthor from "../../domain/BookAuthor";
import Cart from "../../domain/Cart";
import User from "../../domain/User";
import CartRelatedAction from "../CartRelatedAction";
import ViewCart, { Response, InputData } from "./interface";

export interface Dependencies {
  verifyUserToken: VerifyToken;
  getUserById(userId: string): Promise<User | null>;
  saveCart(c: Cart): Promise<void>;
  getCartFor(customerId: string): Promise<Cart>;
  getBooksWithAuthors(
    booksIds: string[]
  ): Promise<{ book: Book; author: BookAuthor }[]>;
}

export default function buildViewCart(deps: Dependencies): ViewCart {
  class ViewCart extends CartRelatedAction<InputData, Response> {
    protected modifyCart() {}
  }

  const VIEW_CART = new ViewCart(deps.verifyUserToken, deps);
  return VIEW_CART.execute;
}
