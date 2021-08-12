import VerifyToken from "../../auth/VerifyToken";
import Book from "../../domain/Book";
import BookAuthor from "../../domain/BookAuthor";
import Cart from "../../domain/Cart";
import Customer from "../../domain/Customer";
import User from "../../domain/User";
import CartItemOutput from "../CartItemOutput";
import Database from "./Database";
import {
  UserNotFound,
  InvalidUserType,
  CouldNotCompleteRequest,
} from "./errors";

export {
  UserNotFound,
  InvalidUserType,
  CouldNotCompleteRequest,
};

export default abstract class CartRelatedAction<
  InputData extends { userAuthToken: string },
  Result = { cartItems: CartItemOutput[] }
> {
  constructor(private _verifyUserToken: VerifyToken, private _db: Database) {}

  protected abstract modifyCart(
    data: InputData,
    customer: Customer,
    cart: Cart
  ): Promise<void> | void;

  /*final*/ async execute(data: InputData) {
    const userId = await this._verifyUserToken(data.userAuthToken);
    const customer = await this.getCustomer(userId);
    const cart = await this.getCartFor(customer);
    await this.modifyCart(data, customer, cart);
    await this.tryToSaveCart(cart);
    return await this.produceResult(data, customer, cart);
  }

  private async getCustomer(userId: string) {
    const user = await this.tryToGetUser(userId);
    await this.checkIfUserWasFound(userId, user);
    await this.checkIfUserIsCustomer(user!);
    return user as Customer;
  }

  private async getCartFor(customer: Customer) {
    try {
      return await this._db.getCartFor(customer.info.id);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get cart from db", e);
    }
  }

  private async checkIfUserWasFound(userId: string, user: User | null) {
    if (user === null) throw new UserNotFound(userId);
  }
  private async checkIfUserIsCustomer(user: User) {
    if (!(user instanceof Customer))
      throw new InvalidUserType("Customer", user.constructor.name);
  }

  private async tryToGetUser(userId: string) {
    try {
      return await this._db.getUserById(userId);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get user from db", e);
    }
  }

  private async tryToSaveCart(cart: Cart) {
    try {
      await this._db.saveCart(cart);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not save user", e);
    }
  }

  protected async produceResult(
    _: InputData,
    __: Customer,
    cart: Cart
  ): Promise<Result> {
    return {
      cartItems: await this.createCartItems(cart.info.bookIds),
    } as any as Result;
  }

  private async createCartItems(bookIds: string[]) {
    return (await this.tryToGetBooksWithAuthors(bookIds)).map(
      ({ book, author }) => this.createCartItem(book, author)
    );
  }

  private async tryToGetBooksWithAuthors(bookIds: string[]) {
    try {
      return await this._db.getBooksWithAuthors(bookIds);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get books and authors", e);
    }
  }

  private createCartItem(book: Book, author: BookAuthor): CartItemOutput {
    return {
      bookId: book.info.id,
      title: book.info.title,
      price: {
        currency: book.info.price.currency,
        cents: book.info.price.cents,
      },
      author: {
        firstName: author.info.firstName,
        lastName: author.info.lastName,
      },
    };
  }
}
