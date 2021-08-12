import VerifyToken from "../../../auth/VerifyToken";
import Cart from "../../../domain/Cart";
import Customer from "../../../domain/Customer";
import CartRelatedAction from "../../CartRelatedAction";
import {
  Response,
  InputData,
  BookNotFound,
  CouldNotCompleteRequest,
} from "../interface";
import Dependencies, { Database } from "./Dependencies";

export default function buildAddToCart({ verifyUserToken, db }: Dependencies) {
  async function addToCart(data: InputData) {
    return await AddToCart.instance.execute(data);
  }

  class AddToCart extends CartRelatedAction<InputData, Promise<Response>> {
    public static instance = new AddToCart(verifyUserToken, db);

    constructor(verifyUserToken: VerifyToken, private db: Database) {
      super(verifyUserToken, db);
    }

    protected async modifyCart(data: InputData, _: Customer, cart: Cart) {
      await this.checkIfBookExists(data.bookId);
      cart.add(data.bookId);
    }

    async checkIfBookExists(bookId: string) {
      const book = await this.tryToGetBook(bookId);
      if (book === null) throw new BookNotFound(bookId);
      return book;
    }

    async tryToGetBook(bookId: string) {
      try {
        return await this.db.getBookById(bookId);
      } catch (e) {
        throw new CouldNotCompleteRequest("could not get book from db", e);
      }
    }
  }

  return addToCart;
}
