import MongoBookDb from ".";
import Book from "../../../domain/Book";
import getFakeBook from "../../../testObjects/FakeBook";
import getFakeBookAuthor from "../../../testObjects/FakeBookAuthor";
import makePassword from "../../../testObjects/makePassword";
import generateId from "../generateId";
import MongoUserDb from "../MongoUserDb";
import UserToDocumentGatewayImp from "../MongoUserDb/UserToDocumentGatewayImp";

const userGateway = new UserToDocumentGatewayImp({ makePassword, generateId });
const uri = "mongodb://localhost:27017";
const databaseName = "TEST_DB";

const bookDb = new MongoBookDb(
  { uri, databaseName, collectionName: "books" },
  { userCollectionName: "users", userToDocumentGateway: userGateway }
);
const userDb = new MongoUserDb(
  { uri, databaseName, collectionName: "users" },
  makePassword
);

beforeEach(async () => {
  await bookDb.TEST_ONLY_clear();
  await userDb.TEST_ONLY_clear();
});

afterAll(async () => {
  await bookDb.TEST_ONLY_clear();
  await bookDb.closeCollection();
  await userDb.TEST_ONLY_clear();
  await userDb.closeCollection();
});

test("book does not exist", async () => {
  expect(await bookDb.getById("b1")).toBeNull();
});

test("saving and getting the book", async () => {
  const book = await getFakeBook({ id: "b1" });
  await bookDb.save(book);
  const fromDb = (await bookDb.getById("b1")) as Book;
  expect(fromDb.info).toEqual(book.info);
});

test("deleting a book", async () => {
  const book = await getFakeBook({ id: "b1" });
  await bookDb.save(book);
  expect(await bookDb.getById("b1")).not.toBeNull();
  const { wasDeleted } = await bookDb.deleteById("b1");
  expect(wasDeleted).toBe(true);
  expect(await bookDb.getById("b1")).toBeNull();
});

test("trying to delete a book that does not exist", async () => {
  const { wasDeleted } = await bookDb.deleteById("b1");
  expect(wasDeleted).toBe(false);
});

test("getBooksWithAuthors", async () => {
  const bookAuthor = await getFakeBookAuthor({ id: "ba1" });
  await userDb.save(bookAuthor);
  const first = await getFakeBook({ id: "b1", authorId: bookAuthor.info.id });
  const second = await getFakeBook({ id: "b2", authorId: bookAuthor.info.id });

  await bookDb.save(first);
  await bookDb.save(second);

  const [bookWithAuthor1, bookWithAuthor2] = await bookDb.getBooksWithAuthors([
    "b2",
    "b1",
  ]);
  expect(bookWithAuthor1.book).toEqual(second);
  expect(bookWithAuthor2.book).toEqual(first);
  expect(bookWithAuthor1.author).toEqual(bookAuthor);
  expect(bookWithAuthor2.author).toEqual(bookAuthor);
});

test("search returns reasonable response", async () => {
  const bookAuthor = await getFakeBookAuthor({ id: "ba1" });
  await userDb.save(bookAuthor);
  const lordOfTheRings = await getFakeBook({
    id: "b1",
    title: "Lord Of The Rings",
    authorId: "ba1",
  });
  const lordOfTheFlies = await getFakeBook({
    id: "b2",
    title: "Lord Of The Flies",
    authorId: "ba1",
  });
  const harryPotter = await getFakeBook({
    id: "b3",
    title: "Harry Potter",
    authorId: "ba1",
  });

  await bookDb.save(lordOfTheRings);
  await bookDb.save(lordOfTheFlies);
  await bookDb.save(harryPotter);

  const results = await bookDb.search("Lord Of");
  expect(results).toHaveLength(2);
  expect(results).toMatchObject(
    expect.arrayContaining([
      { book: lordOfTheRings, author: bookAuthor },
      { book: lordOfTheFlies, author: bookAuthor },
    ])
  );
});
