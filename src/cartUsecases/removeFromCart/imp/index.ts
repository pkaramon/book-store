import Cart from "../../../domain/Cart";
import Customer from "../../../domain/Customer";
import CartRelatedAction from "../../CartRelatedAction";
import { InputData, BookNotInCart, Response } from "../interface";
import Dependencies from "./Dependencies";

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
