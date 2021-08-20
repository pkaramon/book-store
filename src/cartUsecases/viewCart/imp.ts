import VerifyToken from "../../auth/VerifyToken";
import CartRelatedAction from "../CartRelatedAction";
import Databases from "../CartRelatedAction/Databases";
import ViewCart, { Response, InputData } from "./interface";

export interface Dependencies {
  userDb: Databases["user"];
  bookDb: Databases["book"];
  cartDb: Databases["cart"];
  verifyUserToken: VerifyToken;
}

export default function buildViewCart(deps: Dependencies): ViewCart {
  class ViewCart extends CartRelatedAction<InputData, Response> {
    protected modifyCart() {}
  }

  const VIEW_CART = new ViewCart(deps.verifyUserToken, {
    user: deps.userDb,
    cart: deps.cartDb,
    book: deps.bookDb,
  });
  return VIEW_CART.execute;
}
