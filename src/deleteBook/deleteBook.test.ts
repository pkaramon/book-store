import { TokenVerificationError } from "../auth/VerifyToken";
import bookDb from "../testObjects/bookDb";
import getFakeBook from "../testObjects/FakeBook";
import tokenManager from "../testObjects/tokenManager";
import {
  createBuildHelper,
  expectThrownErrorToMatch,
  getThrownError,
  rejectWith,
} from "../__test_helpers__";
import buildDeleteBook from "./imp";
import { BookNotFound, CouldNotCompleteRequest, NotAllowed } from "./interface";

const buildDeleteBookHelper = createBuildHelper(buildDeleteBook, {
  getBookById: bookDb.getById,
  deleteBookById: bookDb.deleteById,
  verifyUserAuthToken: tokenManager.verifyToken,
});
const deleteBook = buildDeleteBookHelper({});

const authorId = "100";
let authorAuthToken: string;
const bookId = "1";
beforeEach(async () => {
  authorAuthToken = await tokenManager.createTokenFor(authorId);
  await bookDb.TEST_ONLY_clear();
  await bookDb.save(await getFakeBook({ id: bookId, authorId }));
});

test("book does not exist", async () => {
  const err = await getThrownError(() =>
    deleteBook({ userAuthToken: authorAuthToken, bookId: "123321" })
  );
  expect(err).toBeInstanceOf(BookNotFound);
  expect(err.bookId).toEqual("123321");
});

test("user is not the author of the book", async () => {
  await expectThrownErrorToMatch(
    async () =>
      deleteBook({ userAuthToken: await tokenManager.createTokenFor("123321"), bookId }),
    { class: NotAllowed, userId: "123321", bookId }
  );
});

test("getBookById throws error", async () => {
  const deleteBook = buildDeleteBookHelper({
    getBookById: rejectWith(new Error("could not get the book")),
  });
  await expectThrownErrorToMatch(
    () => deleteBook({ userAuthToken: authorAuthToken, bookId }),
    { class: CouldNotCompleteRequest }
  );
});

test("deleteById throws error", async () => {
  const deleteBook = buildDeleteBookHelper({
    deleteBookById: rejectWith(new Error("could not delete book")),
  });
  await expectThrownErrorToMatch(
    () => deleteBook({ userAuthToken: authorAuthToken, bookId }),
    { class: CouldNotCompleteRequest }
  );
});

test("deleting the book", async () => {
  await deleteBook({ userAuthToken: authorAuthToken, bookId });
  expect(await bookDb.getById(bookId)).toBeNull();
});

test("user token is invalid", async () => {
  await expectThrownErrorToMatch(
    () => deleteBook({ userAuthToken: "#invalid#", bookId }),
    { class: TokenVerificationError, invalidToken: "#invalid#" }
  );
});
