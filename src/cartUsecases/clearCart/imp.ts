import VerifyToken from "../../auth/VerifyToken";
import Cart from "../../domain/Cart";
import Customer from "../../domain/Customer";
import CartRelatedAction from "../CartRelatedAction";
import { ClearCart, InputData } from "./interface";
import Databases from "../CartRelatedAction/Databases";

export interface Dependencies {
  verifyUserToken: VerifyToken;
  cartDb: Databases["cart"];
  userDb: Databases["user"];
  bookDb: Databases["book"];
}

export default function buildClearCart(deps: Dependencies): ClearCart {
  class ClearCart extends CartRelatedAction<InputData> {
    protected modifyCart(_: InputData, __: Customer, cart: Cart) {
      cart.clear();
    }
  }

  const CLEAR_CART = new ClearCart(deps.verifyUserToken, {
    user: deps.userDb,
    book: deps.bookDb,
    cart: deps.cartDb,
  });
  return CLEAR_CART.execute;
}
