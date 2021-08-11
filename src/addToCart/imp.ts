import Book from "../domain/Book";
import BookAuthor from "../domain/BookAuthor";
import Cart from "../domain/Cart";
import Customer from "../domain/Customer";
import User from "../domain/User";
import {
  BookNotFound,
  CartItemOutput,
  CouldNotCompleteRequest,
  Dependencies,
  InputData,
  InvalidUserType,
  UserNotFound,
} from "./interface";

export default function buildAddToCart({ verifyUserToken, db }: Dependencies) {
  async function addToCart({ userAuthToken, bookId }: InputData) {
    const userId = await verifyUserToken(userAuthToken);
    const customer = await getCustomer(userId);
    await checkIfBookExists(bookId);
    const cart = await db.getCartFor(customer.info.id);
    cart.add(bookId);
    await tryToSaveCart(cart);
    const cartItems = await createCartItems(cart.getAll());
    return { cartItems };
  }

  async function getCustomer(userId: string) {
    const user = await tryToGetUser(userId);
    await checkIfUserWasFound(userId, user);
    await checkIfUserIsCustomer(user!);
    return user as Customer;
  }

  async function tryToGetUser(userId: string) {
    try {
      return await db.getUserById(userId);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get user from db", e);
    }
  }

  async function checkIfUserWasFound(userId: string, user: User | null) {
    if (user === null) throw new UserNotFound(userId);
  }
  async function checkIfUserIsCustomer(user: User) {
    if (!(user instanceof Customer))
      throw new InvalidUserType("Customer", user.constructor.name);
  }

  async function checkIfBookExists(bookId: string) {
    const book = await tryToGetBook(bookId);
    if (book === null) throw new BookNotFound(bookId);
    return book;
  }

  async function tryToGetBook(bookId: string) {
    try {
      return await db.getBookById(bookId);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get book from db", e);
    }
  }

  async function tryToSaveCart(cart: Cart) {
    try {
      await db.saveCart(cart);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not save user", e);
    }
  }

  async function createCartItems(bookIds: string[]) {
    return (await tryToGetBooksWithAuthors(bookIds)).map(({ book, author }) =>
      createCartItem(book, author)
    );
  }

  async function tryToGetBooksWithAuthors(bookIds: string[]) {
    try {
      return await db.getBooksWithAuthors(bookIds);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get books and authors", e);
    }
  }

  function createCartItem(book: Book, author: BookAuthor): CartItemOutput {
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

  return addToCart;
}
