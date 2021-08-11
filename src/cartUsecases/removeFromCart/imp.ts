import VerifyToken from "../../auth/VerifyToken";
import CartRelatedAction from "../CartRelatedAction";
import Book from "../../domain/Book";
import BookAuthor from "../../domain/BookAuthor";
import Cart from "../../domain/Cart";
import Customer from "../../domain/Customer";
import User from "../../domain/User";
import { BookNotInCart, InputData, Response } from "./interface";

interface Dependencies {
  verifyUserToken: VerifyToken;
  getUserById: (userID: string) => Promise<User | null>;
  saveCart: (cart: Cart) => Promise<void>;
  getCartFor: (customerId: string) => Promise<Cart>;
  getBooksWithAuthors(
    booksIds: string[]
  ): Promise<{ book: Book; author: BookAuthor }[]>;
}

export default function buildRemoveFromCart(deps: Dependencies) {
  async function removeFromCart(data: InputData) {
    return await RemoveFromCart.instance.execute(data);
  }

  class RemoveFromCart extends CartRelatedAction<InputData, Promise<Response>> {
    public static instance = new RemoveFromCart(deps.verifyUserToken, deps);

    protected modifyCart(
      { bookId }: InputData,
      _: Customer,
      cart: Cart
    ): void | Promise<void> {
      if (!cart.has(bookId)) throw new BookNotInCart(bookId);
      cart.remove(bookId);
    }
  }

  return removeFromCart;
}
