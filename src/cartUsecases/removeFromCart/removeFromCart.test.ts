import { TokenVerificationError } from "../../auth/VerifyToken";
import BookAuthor from "../../domain/BookAuthor";
import bookDb from "../../testObjects/bookDb";
import cartDb from "../../testObjects/cartDb";
import getFakeAdmin from "../../testObjects/FakeAdmin";
import getFakeBook from "../../testObjects/FakeBook";
import getFakeBookAuthor from "../../testObjects/FakeBookAuthor";
import getFakeCustomer from "../../testObjects/FakeCustomer";
import tokenManager from "../../testObjects/tokenManager";
import userDb from "../../testObjects/userDb";
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

const dependencies = {
  verifyUserToken: tokenManager.verifyToken,
  bookDb,
  userDb,
  cartDb,
};
const removeFromCart = buildRemoveFromCart(dependencies);

const customerId = "1";
const bookId = "101";
const bookAuthorId = "2";
let userAuthToken: string;
beforeEach(async () => {
  await cartDb.TEST_ONLY_clear();
  await bookDb.TEST_ONLY_clear();
  await userDb.TEST_ONLY_clear();

  userAuthToken = await tokenManager.createTokenFor(customerId);

  await userDb.save(await getFakeCustomer({ id: customerId }));
  await userDb.save(await getFakeBookAuthor({ id: bookAuthorId }));

  await bookDb.save(await getFakeBook({ id: bookId, authorId: bookAuthorId }));

  const cart = await cartDb.getCartFor(customerId);
  cart.add(bookId);
  await cartDb.save(cart);
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
      removeFromCart({
        bookId,
        userAuthToken: await tokenManager.createTokenFor("123"),
      }),
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
        userAuthToken: await tokenManager.createTokenFor(adminId),
      }),
    { class: InvalidUserType, wanted: "Customer", received: "Admin" }
  );
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
  await cartDb.save(cart);

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

test("dependency failures", async () => {
  await checkIfItHandlesUnexpectedFailures({
    buildFunction: buildRemoveFromCart,
    defaultDependencies: dependencies,
    dependenciesToTest: [
      "userDb.getById",
      "cartDb.save",
      "cartDb.getCartFor",
      "bookDb.getBooksWithAuthors",
    ],
    validInputData: [{ bookId, userAuthToken }],
    expectedErrorClass: CouldNotCompleteRequest,
    async beforeEach() {
      const cart = await cartDb.getCartFor(customerId);
      cart.clear();
      cart.add(bookId);
      await cartDb.save(cart);
    },
  });
});
