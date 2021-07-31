import buildDeleteBook from "./imp";
import Book from "../domain/Book";
import TableOfContents from "../domain/TableOfContents";
import InMemoryBookDb from "../fakes/InMemoryBookDb";
import { BookNotFound, NotAllowed, CouldNotCompleteRequest } from "./interface";
import FakeTokenManager from "../fakes/FakeTokenManager";
import { createBuildHelper, getThrownError } from "../__test__/fixtures";
import  { TokenVerificationError } from "../auth/VerifyToken";

const db = new InMemoryBookDb();
const tm = new FakeTokenManager();
const buildDeleteBookHelper = createBuildHelper(buildDeleteBook, {
  getBookById: db.getById,
  deleteBookById: db.deleteById,
  verifyUserAuthToken: tm.verifyToken,
});
const deleteBook = buildDeleteBookHelper({});

const authorId = "100";
let authorAuthToken: string;
const bookId = "1";
beforeEach(async () => {
  authorAuthToken = await tm.createTokenFor(authorId);
  db.clear();
  await db.save(
    new Book({
      id: bookId,
      authorId,
      price: 3,
      title: "t",
      filePath: "books/t.pdf",
      description: "d",
      whenCreated: new Date("2012-03-12"),
      numberOfPages: 123,
      sampleFilePath: null,
      tableOfContents: new TableOfContents([
        { title: "chapter 1" },
        { title: "chapter 2" },
      ]),
    })
  );
});

test("book does not exist", async () => {
  const err = await getThrownError(() =>
    deleteBook({ userAuthToken: authorAuthToken, bookId: "123321" })
  );
  expect(err).toBeInstanceOf(BookNotFound);
  expect(err.bookId).toEqual("123321");
});

test("user is not the author of the book", async () => {
  const err: NotAllowed = await getThrownError(async () =>
    deleteBook({
      userAuthToken: await tm.createTokenFor("123321"),
      bookId,
    })
  );
  expect(err).toBeInstanceOf(NotAllowed);
  expect(err.userId).toEqual("123321");
  expect(err.bookId).toEqual(bookId);
});

test("getBookById throws error", async () => {
  const deleteBook = buildDeleteBookHelper({
    getBookById: jest
      .fn()
      .mockRejectedValue(new Error("could not get the book")),
  });
  const err = await getThrownError(() =>
    deleteBook({ userAuthToken: authorAuthToken, bookId })
  );
  expect(err).toBeInstanceOf(CouldNotCompleteRequest);
  expect(err.message).toEqual("could not get the book from db");
});

test("deleteById throws error", async () => {
  const deleteBook = buildDeleteBookHelper({
    deleteBookById: jest
      .fn()
      .mockRejectedValue(new Error("could not delete book")),
  });
  const err = await getThrownError(() =>
    deleteBook({ userAuthToken: authorAuthToken, bookId })
  );
  expect(err).toBeInstanceOf(CouldNotCompleteRequest);
  expect(err.message).toEqual("could not delete the book from db");
});

test("deleting the book", async () => {
  await deleteBook({ userAuthToken: authorAuthToken, bookId });
  expect(await db.getById(bookId)).toBeNull();
});

test("user token is invalid", async () => {
  const err: TokenVerificationError = await getThrownError(() =>
    deleteBook({ userAuthToken: "#invalid#", bookId })
  );
  expect(err).toBeInstanceOf(TokenVerificationError);
  expect(err.invalidToken).toEqual("#invalid#");
});
