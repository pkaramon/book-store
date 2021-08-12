import { BookStatus } from "../domain/Book";
import getFakeAdmin from "../fakes/FakeAdmin";
import getFakeBook from "../fakes/FakeBook";
import getFakePlainUser from "../fakes/FakePlainUser";
import FakeTokenManager from "../fakes/FakeTokenManager";
import InMemoryBookDb from "../fakes/InMemoryBookDb";
import InMemoryUserDb from "../fakes/InMemoryUserDb";
import {
  createBuildHelper,
  expectThrownErrorToMatch,
  getThrownError,
} from "../__test_helpers__";
import buildPublishBook, { Dependencies } from "./imp";
import {
  AdminNotFound,
  AlreadyPublished,
  BookNotFound,
  CouldNotCompleteRequest,
  UserIsNotAdmin,
} from "./interface";

const tm = new FakeTokenManager();
const bookDb = new InMemoryBookDb();
const userDb = new InMemoryUserDb();
const buildPublishBookHelper = createBuildHelper(buildPublishBook, {
  getBookById: bookDb.getById,
  saveBook: bookDb.save,
  getUserById: userDb.getById,
  verifyAdminAuthToken: tm.verifyToken,
});
const publishBook = buildPublishBookHelper({});
const adminId = "1001";
const plainUserId = "1002";
const bookId = "1";
let adminAuthToken: string;
beforeEach(async () => {
  bookDb.clear();
  userDb.clear();
  await bookDb.save(
    await getFakeBook({ id: bookId, status: BookStatus.notPublished })
  );
  await userDb.save(await getFakeAdmin({ id: adminId }));
  await userDb.save(await getFakePlainUser({ id: plainUserId }));
  adminAuthToken = await tm.createTokenFor(adminId);
});

test("book does not exist", async () => {
  const err: BookNotFound = await getThrownError(() =>
    publishBook({ adminAuthToken, bookId: "37" })
  );
  expect(err).toBeInstanceOf(BookNotFound);
  expect(err.bookId).toEqual("37");
});

test("admin does not exist", async () => {
  const err: AdminNotFound = await getThrownError(async () =>
    publishBook({
      adminAuthToken: await tm.createTokenFor("123321"),
      bookId,
    })
  );
  expect(err).toBeInstanceOf(AdminNotFound);
});

test("user is not an admin", async () => {
  await expectThrownErrorToMatch(
    async () =>
      publishBook({
        adminAuthToken: await tm.createTokenFor(plainUserId),
        bookId,
      }),
    { class: UserIsNotAdmin, userId: plainUserId }
  );
});

test("getById failure", async () => {
  await expectToThrowCouldNotCompleteRequest(
    { getBookById: jest.fn().mockRejectedValue(new Error("could not get")) },
    {
      message: "could not get the book from database",
      originalError: new Error("could not get"),
    }
  );
});

test("publishing a book", async () => {
  await publishBook({ bookId, adminAuthToken });
  const book = await bookDb.getById(bookId);
  expect(book?.info?.status).toEqual(BookStatus.published);
});

test("book has been already published", async () => {
  await publishBook({ bookId, adminAuthToken });
  await expectThrownErrorToMatch(
    () => publishBook({ bookId, adminAuthToken }),
    { class: AlreadyPublished, bookId: bookId }
  );
});

test("saveBook failure", async () => {
  await expectToThrowCouldNotCompleteRequest(
    { saveBook: jest.fn().mockRejectedValue(new Error("could not save")) },
    {
      message: "could not save the book to database",
      originalError: new Error("could not save"),
    }
  );
});

test("getUserById failure", async () => {
  await expectToThrowCouldNotCompleteRequest(
    { getUserById: jest.fn().mockRejectedValue(new Error("db err")) },
    {
      message: "could not get user from db",
      originalError: new Error("db err"),
    }
  );
});

async function expectToThrowCouldNotCompleteRequest(
  newDeps: Partial<Dependencies>,
  data: { message: string; originalError: any }
) {
  const publishBook = buildPublishBookHelper({ ...newDeps });
  const err: CouldNotCompleteRequest = await getThrownError(() =>
    publishBook({ adminAuthToken, bookId })
  );
  expect(err).toBeInstanceOf(CouldNotCompleteRequest);
  expect(err.originalError).toEqual(data.originalError);
  expect(err.message).toEqual(data.message);
}
