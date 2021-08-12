import Cart from "../../../domain/Cart";
import Customer from "../../../domain/Customer";
import CartRelatedAction from "../../CartRelatedAction";
import { InputData, BookNotInCart, Response } from "../interface";
import Dependencies from "./Dependencies";

export default function buildRemoveFromCart(deps: Dependencies) {
  class RemoveFromCart extends CartRelatedAction<InputData, Promise<Response>> {
    protected modifyCart({ bookId }: InputData, _: Customer, cart: Cart) {
      if (!cart.has(bookId)) throw new BookNotInCart(bookId);
      cart.remove(bookId);
    }
  }

  const REMOVE_FROM_CART = new RemoveFromCart(deps.verifyUserToken, deps);
  return REMOVE_FROM_CART.execute;
}
