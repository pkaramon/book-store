import VerifyToken from "../../auth/VerifyToken";
import Book from "../../domain/Book";
import BookAuthor from "../../domain/BookAuthor";
import Cart from "../../domain/Cart";
import Customer from "../../domain/Customer";
import User from "../../domain/User";
import CartRelatedAction from "../CartRelatedAction";
import { ClearCart, InputData } from "./interface";

export interface Dependencies {
  verifyUserToken: VerifyToken;
  getUserById(userId: string): Promise<User | null>;
  saveCart(c: Cart): Promise<void>;
  getCartFor(customerId: string): Promise<Cart>;
  getBooksWithAuthors(
    booksIds: string[]
  ): Promise<{ book: Book; author: BookAuthor }[]>;
}

export default function buildClearCart(deps: Dependencies): ClearCart {
  class ClearCart extends CartRelatedAction<InputData> {
    protected modifyCart(_: InputData, __: Customer, cart: Cart) {
      cart.clear();
    }
  }

  const CLEAR_CART = new ClearCart(deps.verifyUserToken, deps);
  return CLEAR_CART.execute.bind(CLEAR_CART);
}
