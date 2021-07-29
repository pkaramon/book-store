import Admin from "../domain/Admin";
import Book, { BookStatus } from "../domain/Book";
import TableOfContents from "../domain/TableOfContents";
import InMemoryBookDb from "../fakes/InMemoryBookDb";
import InMemoryDb from "../fakes/InMemoryDb";
import { getThrownError } from "../__test__/fixtures";
import buildPublishBook from "./imp";
import {
  AdminNotFound,
  AlreadyPublished,
  BookNotFound,
  CouldNotCompleteRequest,
  Dependencies,
} from "./interface";

const bookDb = new InMemoryBookDb();
const adminDb = new InMemoryDb<Admin>();
const publishBook = buildPublishBookHelper({});
beforeEach(async () => {
  bookDb.clear();
  adminDb.clear();
  await bookDb.save(
    new Book({
      id: "1",
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
      id: "1001",
      email: "adminemail@mail.com",
      firstName: "Joe",
      lastName: "Smith",
      password: "HASHED - Pass123$",
      birthDate: new Date(2000, 1, 1),
    })
  );
});

test("book does not exist", async () => {
  const err: BookNotFound = await getThrownError(() =>
    publishBook({ adminId: "1001", bookId: "37" })
  );
  expect(err).toBeInstanceOf(BookNotFound);
  expect(err.bookId).toEqual("37");
});

test("admin with passed id does not exist", async () => {
  const err: AdminNotFound = await getThrownError(() =>
    publishBook({ adminId: "123321", bookId: "1" })
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
  await publishBook({ bookId: "1", adminId: "1001" });
  const book = await bookDb.getById("1");
  expect(book?.status).toEqual(BookStatus.published);
});

test("book has been already published", async () => {
  await publishBook({ bookId: "1", adminId: "1001" });

  const err: AlreadyPublished = await getThrownError(() =>
    publishBook({ bookId: "1", adminId: "1001" })
  );
  expect(err).toBeInstanceOf(AlreadyPublished);
  expect(err.bookId).toEqual("1");
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
    publishBook({ adminId: "1001", bookId: "1" })
  );
  expect(err).toBeInstanceOf(CouldNotCompleteRequest);
  expect(err.originalError).toEqual(data.originalError);
  expect(err.message).toEqual(data.message);
}

function buildPublishBookHelper(newDeps?: Partial<Dependencies>) {
  return buildPublishBook({
    getBookById: bookDb.getById,
    saveBook: bookDb.save,
    getAdminById: adminDb.getById,
    ...newDeps,
  });
}
