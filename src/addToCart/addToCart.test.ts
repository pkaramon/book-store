import VerifyToken, { TokenVerificationError } from "../auth/VerifyToken";
import Book from "../domain/Book";
import BookAuthor from "../domain/BookAuthor";
import getFakeBook from "../fakes/FakeBook";
import getFakeBookAuthor from "../fakes/FakeBookAuthor";
import getFakeCustomer from "../fakes/FakeCustomer";
import FakeTokenManager from "../fakes/FakeTokenManager";
import InMemoryBookDb from "../fakes/InMemoryBookDb";
import InMemoryCartDb from "../fakes/InMemoryCartDb";
import InMemoryUserDb from "../fakes/InMemoryUserDb";
import { expectThrownErrorToMatch, rejectWith } from "../__test_helpers__";
import buildAddToCart from "./imp";
import {
  UserNotFound,
  InvalidUserType,
  BookNotFound,
  Database,
  CouldNotCompleteRequest,
} from "./interface";

const userDb = new InMemoryUserDb();

const getBooksWithAuthors = async (booksIds: string[]) => {
  const books = await Promise.all(booksIds.map((id) => bookDb.getById(id)));
  const withoutNulls = books.filter((b) => b !== null) as Book[];
  return await Promise.all(
    withoutNulls.map(async (book) => {
      const author = (await userDb.getById(book.info.authorId)) as BookAuthor;
      return { book, author };
    })
  );
};

const bookDb = new InMemoryBookDb();
const cartDb = new InMemoryCartDb();
const tm = new FakeTokenManager();
const dependencies = {
  verifyUserToken: tm.verifyToken,
  db: {
    getUserById: userDb.getById,
    getBookById: bookDb.getById,
    getBooksWithAuthors,
    getCartFor: cartDb.getCartFor,
    saveCart: cartDb.saveCart,
  },
};
const addToCart = buildAddToCart(dependencies);

const userId = "1";
const bookId = "101";
const secondBookId = "102";
const bookAuthorId = "2";
let userAuthToken: string;
beforeEach(async () => {
  userDb.clear();
  bookDb.clear();
  cartDb.clear();
  userAuthToken = await tm.createTokenFor(userId);
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
      addToCart({ userAuthToken: await tm.createTokenFor("123"), bookId }),
    { class: UserNotFound, userId: "123" }
  );
});

test("user is not a customer", async () => {
  await expectThrownErrorToMatch(
    async () =>
      addToCart({
        userAuthToken: await tm.createTokenFor(bookAuthorId),
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

async function checkIfItHandlesUnexpectedFailures<Deps>(data: {
  buildFunction: (deps: Deps) => (...args: any) => any;
  defaultDependencies: Deps;
  dependenciesToTest: (keyof Deps)[];
  validInputData: Parameters<ReturnType<typeof data.buildFunction>>;
  expectedErrorClass: new (...args: any) => any;
}) {
  for (const dependencyName of data.dependenciesToTest) {
    const usecase = data.buildFunction({
      ...data.defaultDependencies,
      [dependencyName]: rejectWith(new Error("err")),
    });

    await expectThrownErrorToMatch(() => usecase(...data.validInputData), {
      class: data.expectedErrorClass,
      originalError: new Error("err"),
    });
  }
}

test("dependency failures", async () => {
  await checkIfItHandlesUnexpectedFailures({
    buildFunction: (deps: Database & { verifyUserToken: VerifyToken }) => {
      return buildAddToCart({ ...deps, db: { ...deps } });
    },
    defaultDependencies: { ...dependencies, ...dependencies.db },
    dependenciesToTest: [
      "getUserById",
      "getBookById",
      "saveCart",
      "getBooksWithAuthors",
    ],
    validInputData: [{ bookId, userAuthToken }],
    expectedErrorClass: CouldNotCompleteRequest,
  });
});
