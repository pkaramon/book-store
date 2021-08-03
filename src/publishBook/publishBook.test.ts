import Admin from "../domain/Admin";
import { BookStatus } from "../domain/Book";
import TableOfContents from "../domain/Book/TableOfContents";
import FakeTokenManager from "../fakes/FakeTokenManager";
import InMemoryBookDb from "../fakes/InMemoryBookDb";
import InMemoryDb from "../fakes/InMemoryDb";
import makeBook from "../fakes/makeBook";
import { createBuildHelper, getThrownError } from "../__test__/fixtures";
import buildPublishBook from "./imp";
import {
  AdminNotFound,
  AlreadyPublished,
  BookNotFound,
  CouldNotCompleteRequest,
  Dependencies,
} from "./interface";

const tm = new FakeTokenManager();
const bookDb = new InMemoryBookDb();
const adminDb = new InMemoryDb<Admin>();
const buildPublishBookHelper = createBuildHelper(buildPublishBook, {
  getBookById: bookDb.getById,
  saveBook: bookDb.save,
  getAdminById: adminDb.getById,
  verifyAdminAuthToken: tm.verifyToken,
});
const publishBook = buildPublishBookHelper({});
const adminId = "1001";
const bookId = "1";
let adminAuthToken: string;
beforeEach(async () => {
  bookDb.clear();
  adminDb.clear();
  await bookDb.save(
    await makeBook({
      id: bookId,
      status: BookStatus.notPublished,
      price: 3.0,
      title: "t",
      description: "d",
      authorId: "101",
      filePath: "books/book.pdf",
      whenCreated: new Date(2000, 1, 1),
      numberOfPages: 123,
      sampleFilePath: "books/sample.pdf",
      tableOfContents: TableOfContents.EmptyTableOfContents,
    })
  );
  await adminDb.save(
    new Admin({
      id: adminId,
      email: "adminemail@mail.com",
      firstName: "Joe",
      lastName: "Smith",
      password: "HASHED - Pass123$",
      birthDate: new Date(2000, 1, 1),
    })
  );
  adminAuthToken = await tm.createTokenFor(adminId);
});

test("book does not exist", async () => {
  const err: BookNotFound = await getThrownError(() =>
    publishBook({ adminAuthToken, bookId: "37" })
  );
  expect(err).toBeInstanceOf(BookNotFound);
  expect(err.bookId).toEqual("37");
});

test("admin with passed id does not exist", async () => {
  const err: AdminNotFound = await getThrownError(async () =>
    publishBook({
      adminAuthToken: await tm.createTokenFor("123321"),
      bookId,
    })
  );
  expect(err).toBeInstanceOf(AdminNotFound);
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

  const err: AlreadyPublished = await getThrownError(() =>
    publishBook({ bookId, adminAuthToken })
  );
  expect(err).toBeInstanceOf(AlreadyPublished);
  expect(err.bookId).toEqual(bookId);
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
