import buildAddBook from "./imp";
import Book, { BookStatus } from "../domain/Book";
import {
  InputData,
  InvalidBookData,
  CouldNotCompleteRequest,
  BookData,
  NotBookAuthor,
  UserNotFound,
  Dependencies,
} from "./interface";
import FakeClock from "../fakes/FakeClock";
import InMemoryBookDb from "../fakes/InMemoryBookDb";
import FakeTokenManager from "../fakes/FakeTokenManager";
import { TokenVerificationError } from "../auth/VerifyToken";
import makeBook from "../fakes/makeBook";
import InMemoryUserDb from "../fakes/InMemoryUserDb";
import getFakeBookAuthor from "../fakes/FakeBookAuthor";
import getFakePlainUser from "../fakes/FakePlainUser";
import AsyncSchemaValidator from "../domain/AsyncSchemaValidator";
import buildBookSchema from "../domain/Book/BookSchema";
import {
  getThrownError,
  expectThrownErrorToMatch,
  nCharString,
  DidNotThrowError,
} from "../__test_helpers__";

const bookDb = new InMemoryBookDb();
const userDb = new InMemoryUserDb();
const isCorrectEbookFile = jest.fn(async (filePath: string) =>
  filePath.startsWith("books/")
);

const now = new FakeClock({ now: new Date(2020, 1, 1) }).now;
const tokenManager = new FakeTokenManager();
const dependencies: Dependencies = {
  saveBook: bookDb.save,
  makeBook,
  verifyUserToken: tokenManager.verifyToken,
  getUserById: userDb.getById,
  bookDataValidator: new AsyncSchemaValidator(
    buildBookSchema({ isCorrectEbookFile, now })
  ),
};
const addBook = buildAddBook(dependencies);
let validData: InputData;
const bookAuthorId = "1";
const plainUserId = "2";
beforeEach(async () => {
  validData = {
    userToken: await tokenManager.createTokenFor(bookAuthorId),
    bookData: {
      title: "first book",
      description: "first book desc",
      tableOfContents: [
        {
          title: "1. chapter",
          children: [
            { title: "1. 1" },
            { title: "1. 2", children: [{ title: "1.2.1" }] },
          ],
        },
        { title: "2. chapter" },
      ],
      price: { currency: "USD", cents: 350 },
      whenCreated: new Date("2018-02-18"),
      numberOfPages: 123,
      filePath: "books/first book.pdf",
      sampleFilePath: "books/first book chapter one.epub",
    },
  };

  bookDb.clear();
  isCorrectEbookFile.mockClear();

  await userDb.save(await getFakeBookAuthor({ id: bookAuthorId }));
  await userDb.save(await getFakePlainUser({ id: plainUserId }));
});

test("userToken is invalid", async () => {
  const err: TokenVerificationError = await getThrownError(() =>
    addBook({ ...validData, userToken: "#!invalid!#" })
  );
  expect(err).toBeInstanceOf(TokenVerificationError);
  expect(err.invalidToken).toEqual("#!invalid!#");
});

test("user is not a book author", async () => {
  await expectThrownErrorToMatch(
    async () =>
      addBook({
        ...validData,
        userToken: await tokenManager.createTokenFor(plainUserId),
      }),
    { class: NotBookAuthor, userId: plainUserId }
  );
});

test("user does not exist", async () => {
  await expectThrownErrorToMatch(
    async () =>
      addBook({
        ...validData,
        userToken: await tokenManager.createTokenFor("123321"),
      }),
    { class: UserNotFound, userId: "123321" }
  );
});

describe("validation", () => {
  test("title cannot be empty", async () => {
    const errorMessage = "title cannot be empty";
    await expectValidationToFail("title", "", errorMessage);
    await expectValidationToFail("title", " ", errorMessage);
  });

  test("description cannot be empty", async () => {
    const errorMessage = "description cannot be empty";
    await expectValidationToFail("description", "", errorMessage);
    await expectValidationToFail("description", "   ", errorMessage);
  });

  test("description must be at most 1000 characters long", async () => {
    await expectValidationToPass("description", nCharString(1000));
    await expectValidationToFail(
      "description",
      nCharString(1001),
      "description cannot be more than 1000 characters long"
    );
  });

  test("price.currency can only be USD", async () => {
    await expectValidationToFail(
      "price",
      { currency: "EURO", cents: 400 },
      "price.currency can be USD only"
    );
  });

  test("price.cents must be positive", async () => {
    const errorMessage = "price.cents must be positive";
    for (const cents of [-1, 0])
      await expectValidationToFail(
        "price",
        { currency: "USD", cents },
        errorMessage
      );
  });

  test("price.cents can only be an integer", async () => {
    const errorMessage = "price.cents must be an integer";
    for (const cents of [1.2, 2.31])
      await expectValidationToFail(
        "price",
        { currency: "USD", cents },
        errorMessage
      );
  });

  test("numberOfPages must be positive", async () => {
    const errorMessage = "numberOfPages must be positive";
    await expectValidationToFail("numberOfPages", -1, errorMessage);
    await expectValidationToFail("numberOfPages", 0, errorMessage);
  });

  test("whenCreated cannot be in the future", async () => {
    await expectValidationToPass("whenCreated", now());
    await expectValidationToFail(
      "whenCreated",
      new Date(2020, 1, 2),
      "whenCreated cannot be in the future"
    );
  });

  test("accumulation of errors", async () => {
    try {
      await addBook({
        userToken: validData.userToken,
        bookData: { ...validData.bookData, title: "", description: "" },
      });
      throw "should have thrown";
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidBookData);
      expect(e.errors.title).not.toBeUndefined();
      expect(e.errors.description).not.toBeUndefined();
      expect(e.invalidProperties).toContain("title");
      expect(e.invalidProperties).toContain("description");
    }
  });

  test("tableOfContents can be empty(undefined)", async () => {
    await expectValidationToPass("tableOfContents", undefined);
  });

  test("sampleFilePath is provided, but the path itself is invalid", async () => {
    await expectValidationToPass("sampleFilePath", undefined);
    await expectValidationToFail(
      "sampleFilePath",
      "INVALID_FOLDER/sample.pdf",
      "sampleFilePath is invalid"
    );
    expect(isCorrectEbookFile).toHaveBeenCalledWith(
      "INVALID_FOLDER/sample.pdf"
    );
  });

  test("filePath is invalid", async () => {
    await expectValidationToFail(
      "filePath",
      "INVALID_FOLDER/book.pdf",
      "filePath is invalid"
    );
    expect(isCorrectEbookFile).toHaveBeenCalledWith("INVALID_FOLDER/book.pdf");
  });
});

test("creating a book", async () => {
  const { bookId } = await addBook({ ...validData });
  expect(typeof bookId).toBe("string");

  const savedBook = (await bookDb.getById(bookId)) as Book;
  expect(savedBook.info.id).toEqual(bookId);
  expect(savedBook.info.authorId).toEqual(
    await tokenManager.verifyToken(validData.userToken)
  );
  const { bookData } = validData;
  expect(savedBook.info.title).toEqual(bookData.title);
  expect(savedBook.info.price.currency).toEqual(bookData.price.currency);
  expect(savedBook.info.price.cents).toEqual(bookData.price.cents);
  expect(savedBook.info.whenCreated).toEqual(bookData.whenCreated);
  expect(savedBook.info.numberOfPages).toEqual(bookData.numberOfPages);
  expect(savedBook.info.tableOfContents.data).toEqual(bookData.tableOfContents);
  expect(savedBook.info.status).toEqual(BookStatus.notPublished);
  expect(savedBook.info.filePath).toEqual(bookData.filePath);
  expect(savedBook.info.sampleFilePath).toEqual(bookData.sampleFilePath);
});

test("file system error", async () => {
  isCorrectEbookFile.mockRejectedValueOnce(
    new Error("could not check the file")
  );
  await expectThrownErrorToMatch(() => addBook(validData), {
    class: CouldNotCompleteRequest,
  });
});

test("saveBook error", async () => {
  const addBook = buildAddBook({
    ...dependencies,
    saveBook: jest.fn().mockRejectedValue(new Error("save book err")),
  });
  await expectThrownErrorToMatch(() => addBook(validData), {
    class: CouldNotCompleteRequest,
    message: "could not save book",
  });
});

test("getUserById error", async () => {
  const addBook = buildAddBook({
    ...dependencies,
    getUserById: jest.fn().mockRejectedValue(new Error("could not save book")),
  });
  await expectThrownErrorToMatch(() => addBook({ ...validData }), {
    class: CouldNotCompleteRequest,
    message: "could not get user from db",
  });
});

async function expectValidationToFail<Key extends keyof BookData>(
  key: Key,
  value: BookData[Key],
  ...expectedErrorMessages: string[]
) {
  try {
    await addBook({
      ...validData,
      bookData: { ...validData.bookData, [key]: value },
    });
    throw new DidNotThrowError();
  } catch (e) {
    expect(e).toBeInstanceOf(InvalidBookData);
    expect(e.errors).toEqual({ [key]: expectedErrorMessages });
    expect(e.invalidProperties).toEqual([key]);
  }
}

async function expectValidationToPass<Key extends keyof BookData>(
  key: Key,
  value: BookData[Key]
) {
  await addBook({
    ...validData,
    bookData: { ...validData.bookData, [key]: value },
  });
}
