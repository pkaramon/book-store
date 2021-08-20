import { TokenVerificationError } from "../../auth/VerifyToken";
import Book, { BookStatus } from "../../domain/Book";
import BookAuthor from "../../domain/BookAuthor";
import bookDb from "../../testObjects/bookDb";
import cartDb from "../../testObjects/cartDb";
import getFakeBook from "../../testObjects/FakeBook";
import getFakeBookAuthor from "../../testObjects/FakeBookAuthor";
import getFakeCustomer from "../../testObjects/FakeCustomer";
import tokenManager from "../../testObjects/tokenManager";
import userDb from "../../testObjects/userDb";
import {
  expectThrownErrorToMatch,
  checkIfItHandlesUnexpectedFailures,
} from "../../__test_helpers__";
import buildAddToCart from "./imp";
import Dependencies from "./imp/Dependencies";
import {
  UserNotFound,
  InvalidUserType,
  BookNotFound,
  CouldNotCompleteRequest,
  BookWasNotPublished,
} from "./interface";

const dependencies: Dependencies = {
  verifyUserToken: tokenManager.verifyToken,
  userDb,
  bookDb,
  cartDb,
};
const addToCart = buildAddToCart(dependencies);

const userId = "1";
const bookId = "101";
const secondBookId = "102";
const bookAuthorId = "2";
let userAuthToken: string;
beforeEach(async () => {
  await userDb.TEST_ONLY_clear();
  await bookDb.TEST_ONLY_clear();
  await cartDb.TEST_ONLY_clear();
  userAuthToken = await tokenManager.createTokenFor(userId);
  await userDb.save(await getFakeCustomer({ id: userId }));
  await userDb.save(await getFakeBookAuthor({ id: bookAuthorId }));
  await bookDb.save(await getFakeBook({ id: bookId, authorId: bookAuthorId }));
  await bookDb.save(
    await getFakeBook({ id: secondBookId, authorId: bookAuthorId })
  );
});

test("user auth token is invalid", async () => {
  await expectThrownErrorToMatch(
    () => addToCart({ userAuthToken: "invalid 123", bookId }),
    { class: TokenVerificationError, invalidToken: "invalid 123" }
  );
});

test("user does not exist", async () => {
  await expectThrownErrorToMatch(
    async () =>
      addToCart({
        userAuthToken: await tokenManager.createTokenFor("123"),
        bookId,
      }),
    { class: UserNotFound, userId: "123" }
  );
});

test("user is not a customer", async () => {
  await expectThrownErrorToMatch(
    async () =>
      addToCart({
        userAuthToken: await tokenManager.createTokenFor(bookAuthorId),
        bookId,
      }),
    { class: InvalidUserType, wanted: "Customer", received: "BookAuthor" }
  );
});

test("book does not exist", async () => {
  await expectThrownErrorToMatch(
    () => addToCart({ userAuthToken, bookId: "123321" }),
    { class: BookNotFound, bookId: "123321" }
  );
});

test("book is not published", async () => {
  const bookId = Math.random().toString();
  await bookDb.save(
    await getFakeBook({ id: bookId, status: BookStatus.notPublished })
  );

  await expectThrownErrorToMatch(() => addToCart({ userAuthToken, bookId }), {
    class: BookWasNotPublished,
    bookId,
  });
});

test("adding book to cart", async () => {
  const { cartItems } = await addToCart({ userAuthToken, bookId });
  expect(cartItems).toHaveLength(1);
  expect(cartItems[0].bookId).toEqual(bookId);

  const cart = await cartDb.getCartFor(userId);
  expect(cart?.getAll()).toEqual([bookId]);
});

test("adding multiple books", async () => {
  await addToCart({ userAuthToken, bookId });
  const { cartItems } = await addToCart({
    userAuthToken,
    bookId: secondBookId,
  });
  expect(cartItems).toHaveLength(2);
  expect(cartItems[0].bookId).toEqual(bookId);
  expect(cartItems[1].bookId).toEqual(secondBookId);
  const cart = await cartDb.getCartFor(userId);
  expect(cart?.getAll()).toEqual([bookId, secondBookId]);
});

test("book info returned from usecase", async () => {
  const { cartItems } = await addToCart({ userAuthToken, bookId });
  const cartItem = cartItems[0] as any;
  expect(cartItem.bookId).toEqual(bookId);
  const book = (await bookDb.getById(bookId)) as Book;
  const author = (await userDb.getById(bookAuthorId)) as BookAuthor;
  expect(cartItem.title).toEqual(book.info.title);
  expect(cartItem.price).toEqual(book.info.price);
  expect(cartItem.author.firstName).toEqual(author.info.firstName);
  expect(cartItem.author.lastName).toEqual(author.info.lastName);
});

test("dependency failures", async () => {
  await checkIfItHandlesUnexpectedFailures({
    buildFunction: buildAddToCart,
    defaultDependencies: dependencies,
    dependenciesToTest: [
      "userDb.getById",
      "cartDb.save",
      "cartDb.getCartFor",
      "bookDb.getById",
      "bookDb.getBooksWithAuthors",
    ],
    validInputData: [{ bookId, userAuthToken }],
    expectedErrorClass: CouldNotCompleteRequest,
  });
});
