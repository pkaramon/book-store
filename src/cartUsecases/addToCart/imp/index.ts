import VerifyToken from "../../../auth/VerifyToken";
import Book, { BookStatus } from "../../../domain/Book";
import Cart from "../../../domain/Cart";
import Customer from "../../../domain/Customer";
import CartRelatedAction from "../../CartRelatedAction";
import {
  Response,
  InputData,
  BookNotFound,
  CouldNotCompleteRequest,
  BookWasNotPublished,
} from "../interface";
import Dependencies, { Database } from "./Dependencies";

export default function buildAddToCart({ verifyUserToken, db }: Dependencies) {
  class AddToCart extends CartRelatedAction<InputData, Promise<Response>> {
    constructor(verifyUserToken: VerifyToken, private db: Database) {
      super(verifyUserToken, db);
    }

    protected async modifyCart(data: InputData, _: Customer, cart: Cart) {
      const book = await this.getBook(data.bookId);
      this.checkIfBookWasPublished(book);
      cart.add(data.bookId);
    }

    async getBook(bookId: string) {
      const book = await this.tryToGetBook(bookId);
      this.checkIfBookWasFound(bookId, book);
      return book!;
    }

    private async tryToGetBook(bookId: string) {
      try {
        return await this.db.getBookById(bookId);
      } catch (e) {
        throw new CouldNotCompleteRequest("could not get book from db", e);
      }
    }

    private checkIfBookWasFound(bookId: string, book: Book | null) {
      if (book === null) throw new BookNotFound(bookId);
    }

    private checkIfBookWasPublished(book: Book) {
      if (book.info.status === BookStatus.notPublished)
        throw new BookWasNotPublished(book.info.id);
      return book;
    }
  }

  const ADD_TO_CART = new AddToCart(verifyUserToken, db);
  return ADD_TO_CART.execute;
}
