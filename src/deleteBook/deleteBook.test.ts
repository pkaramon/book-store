import buildDeleteBook from "./imp";
import Book from "../domain/Book";
import TableOfContents from "../domain/TableOfContents";
import InMemoryBookDb from "../fakes/InMemoryBookDb";
import { BookNotFound, NotAllowed, CouldNotCompleteRequest } from "./interface";

const db = new InMemoryBookDb();
const deleteBook = buildDeleteBook(db.delete, db.getById);

beforeEach(async () => {
  db.clear();
  await db.save(
    new Book({
      id: "1",
      authorId: "100",
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
  const fn = () => deleteBook({ userId: "100", bookId: "123321" });
  await expect(fn).rejects.toThrowError(BookNotFound);
  await expect(fn).rejects.toThrowError("book with id: 123321 was not found");
});

test("user is not the author of the book", async () => {
  const fn = () => deleteBook({ userId: "123321", bookId: "1" });

  await expect(fn).rejects.toThrowError(NotAllowed);
  await expect(fn).rejects.toThrowError(
    "user with id: 123321 is not the author of the book"
  );
});

test("getBookById throws error", async () => {
  const deleteBook = buildDeleteBook(
    db.delete,
    jest.fn().mockRejectedValue(new Error("could not get the book"))
  );
  const fn = () => deleteBook({ userId: "100", bookId: "1" });

  await expect(fn).rejects.toThrowError(CouldNotCompleteRequest);
  await expect(fn).rejects.toThrowError("could not get the book from db");
});

test("deleteById throws error", async () => {
  const deleteBook = buildDeleteBook(
    jest.fn().mockRejectedValue(new Error("could not delete book")),
    db.getById
  );
  const fn = () => deleteBook({ userId: "100", bookId: "1" });
  await expect(fn).rejects.toThrowError(CouldNotCompleteRequest);
  await expect(fn).rejects.toThrowError("could not delete the book from db");
});

test("deleting the book", async () => {
  await deleteBook({ userId: "100", bookId: "1" });
  expect(await db.getById("1")).toBeNull();
});
