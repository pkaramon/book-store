import { TokenVerificationError } from "../../auth/VerifyToken";
import BookAuthor from "../../domain/BookAuthor";
import getFakeAdmin from "../../fakes/FakeAdmin";
import getFakeBook from "../../fakes/FakeBook";
import getFakeBookAuthor from "../../fakes/FakeBookAuthor";
import getFakeCustomer from "../../fakes/FakeCustomer";
import FakeTokenManager from "../../fakes/FakeTokenManager";
import InMemoryBookDb from "../../fakes/InMemoryBookDb";
import InMemoryCartDb from "../../fakes/InMemoryCartDb";
import InMemoryUserDb from "../../fakes/InMemoryUserDb";
import {
  checkIfItHandlesUnexpectedFailures,
  expectThrownErrorToMatch,
} from "../../__test_helpers__";
import buildRemoveFromCart from "./imp";
import {
  BookNotInCart,
  CouldNotCompleteRequest,
  InvalidUserType,
  UserNotFound,
} from "./interface";

const cartDb = new InMemoryCartDb();
const tm = new FakeTokenManager();
const userDb = new InMemoryUserDb();
const bookDb = new InMemoryBookDb();

const dependencies = {
  verifyUserToken: tm.verifyToken,
  saveCart: cartDb.saveCart,
  getUserById: userDb.getById,
  getCartFor: cartDb.getCartFor,
  getBooksWithAuthors: (ids: string[]) =>
    bookDb.getBooksWithAuthors(userDb.getById, ids),
};
const removeFromCart = buildRemoveFromCart(dependencies);

const customerId = "1";
const bookId = "101";
const bookAuthorId = "2";
let userAuthToken: string;
beforeEach(async () => {
  cartDb.clear();
  bookDb.clear();
  userDb.clear();

  userAuthToken = await tm.createTokenFor(customerId);

  await userDb.save(await getFakeCustomer({ id: customerId }));
  await userDb.save(await getFakeBookAuthor({ id: bookAuthorId }));

  await bookDb.save(await getFakeBook({ id: bookId, authorId: bookAuthorId }));

  const cart = await cartDb.getCartFor(customerId);
  cart.add(bookId);
  await cartDb.saveCart(cart);
});

test("user auth token is invalid", async () => {
  await expectThrownErrorToMatch(
    () => removeFromCart({ bookId, userAuthToken: "invalid" }),
    { class: TokenVerificationError, invalidToken: "invalid" }
  );
});

test("user does not exist", async () => {
  await expectThrownErrorToMatch(
    async () =>
      removeFromCart({ bookId, userAuthToken: await tm.createTokenFor("123") }),
    { class: UserNotFound, userId: "123" }
  );
});

test("user is not a customer", async () => {
  const adminId = "1";
  await userDb.save(await getFakeAdmin({ id: adminId }));
  await expectThrownErrorToMatch(
    async () =>
      removeFromCart({
        bookId,
        userAuthToken: await tm.createTokenFor(adminId),
      }),
    { class: InvalidUserType, wanted: "Customer", received: "Admin" }
  );
});

test("dependency failures", async () => {
  await checkIfItHandlesUnexpectedFailures({
    buildFunction: buildRemoveFromCart,
    defaultDependencies: dependencies,
    dependenciesToTest: [
      "getUserById",
      "saveCart",
      "getCartFor",
      "getBooksWithAuthors",
    ],
    validInputData: [{ bookId, userAuthToken }],
    expectedErrorClass: CouldNotCompleteRequest,
    async beforeEach() {
      const cart = await cartDb.getCartFor(customerId);
      cart.clear();
      cart.add(bookId);
      await cartDb.saveCart(cart);
    },
  });
});

test("book does not exist in the cart", async () => {
  const cart = await cartDb.getCartFor(customerId);
  cart.clear();
  await expectThrownErrorToMatch(
    () => removeFromCart({ userAuthToken, bookId }),
    { class: BookNotInCart, bookId: bookId }
  );
});

test("removing book from cart", async () => {
  await removeFromCart({ userAuthToken, bookId });
  const cart = await cartDb.getCartFor(customerId);
  expect(cart.has(bookId)).toBe(false);
});

test("usecase output", async () => {
  const bookAuthor = (await userDb.getById(bookAuthorId)) as BookAuthor;
  const secondBook = await getFakeBook({ id: "1001", authorId: bookAuthorId });
  const book = await getFakeBook({ id: "1002", authorId: bookAuthorId });
  await bookDb.save(book);
  await bookDb.save(secondBook);

  const cart = await cartDb.getCartFor(customerId);
  cart.clear();
  cart.add(book.info.id);
  cart.add(secondBook.info.id);
  await cartDb.saveCart(cart);

  const response = await removeFromCart({
    bookId: book.info.id,
    userAuthToken,
  });
  const cartItem = response.cartItems[0];
  expect(cartItem.bookId).toEqual(secondBook.info.id);
  expect(cartItem.price.currency).toEqual(secondBook.info.price.currency);
  expect(cartItem.price.cents).toEqual(secondBook.info.price.cents);
  expect(cartItem.title).toEqual(secondBook.info.title);
  expect(cartItem.author.firstName).toEqual(bookAuthor.info.firstName);
  expect(cartItem.author.lastName).toEqual(bookAuthor.info.lastName);
});
