import buildAddBook from "./imp";
import Book, { BookStatus } from "../domain/Book";
import {
  InputData,
  InvalidBookData,
  CouldNotCompleteRequest,
  BookData,
} from "./interface";
import FakeClock from "../fakes/FakeClock";
import InMemoryBookDb from "../fakes/InMemoryBookDb";
import NumberIdCreator from "../fakes/NumberIdCreator";
import FakeTokenManager from "../fakes/FakeTokenManager";
import { getThrownError } from "../__test__/fixtures";
import { TokenVerificationError } from "../auth/VerifyToken";

const bookDb = new InMemoryBookDb();
const idCreator = new NumberIdCreator();
const isCorrectEbookFile = jest.fn().mockResolvedValue(true);
const tokenManager = new FakeTokenManager();
const dependencies = {
  now: new FakeClock({ now: new Date(2020, 1, 1) }).now,
  saveBook: bookDb.save,
  createId: idCreator.create,
  isCorrectEbookFile,
  verifyUserToken: tokenManager.verifyToken,
};
const addBook = buildAddBook(dependencies);
let validData: InputData;

beforeEach(async () => {
  validData = {
    userToken: await tokenManager.createTokenFor("1"),
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
      price: 5.0,
      whenCreated: new Date("2018-02-18"),
      numberOfPages: 123,
      filePath: "books/first book.pdf",
      sampleFilePath: "books/first book chapter one.epub",
    },
  };

  bookDb.clear();
  idCreator.reset();
  isCorrectEbookFile.mockClear();
});

test("userToken is invalid", async () => {
  const err: TokenVerificationError = await getThrownError(() =>
    addBook({ ...validData, userToken: "#!invalid!#" })
  );
  expect(err).toBeInstanceOf(TokenVerificationError);
  expect(err.invalidToken).toEqual("#!invalid!#");
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

  test("price must be positive", async () => {
    const errorMessage = "price must be positive";
    await expectValidationToFail("price", -1, errorMessage);
    await expectValidationToFail("price", 0, errorMessage);
  });

  test("numberOfPages must be positive", async () => {
    const errorMessage = "numberOfPages must be positive";
    await expectValidationToFail("numberOfPages", -1, errorMessage);
    await expectValidationToFail("numberOfPages", 0, errorMessage);
  });

  test("whenCreated cannot be in the future", async () => {
    await expectValidationToPass("whenCreated", dependencies.now());
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
        bookData: { ...validData.bookData, title: "", price: -1 },
      });
      throw "should have thrown";
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidBookData);
      expect(e.errors.title).not.toBeUndefined();
      expect(e.errors.price).not.toBeUndefined();
      expect(e.invalidProperties).toContain("title");
      expect(e.invalidProperties).toContain("price");
    }
  });

  test("tableOfContents can be empty(undefined)", async () => {
    await expectValidationToPass("tableOfContents", undefined);
  });

  test("sampleFilePath is provided, but the path itself is invalid", async () => {
    await expectValidationToPass("sampleFilePath", undefined);
    isCorrectEbookFile.mockResolvedValueOnce(false);
    await expectValidationToFail(
      "sampleFilePath",
      "books/INVALID",
      "sampleFilePath is invalid"
    );
    expect(isCorrectEbookFile).toHaveBeenCalledWith("books/INVALID");
  });

  test("filePath is invalid", async () => {
    const impl = async (path: string) =>
      path === "books/INVALID_FILE_PATH" ? false : true;
    isCorrectEbookFile
      .mockImplementationOnce(impl)
      .mockImplementationOnce(impl);
    await expectValidationToFail(
      "filePath",
      "books/INVALID_FILE_PATH",
      "filePath is invalid"
    );
    expect(isCorrectEbookFile).toHaveBeenCalledWith("books/INVALID_FILE_PATH");
  });
});

test("creating a book", async () => {
  const { bookId } = await addBook({ ...validData });
  expect(bookId).toEqual(idCreator.lastCreated());

  const savedBook = (await bookDb.getById(bookId)) as Book;
  expect(savedBook.id).toEqual(bookId);
  expect(savedBook.authorId).toEqual(
    await tokenManager.verifyToken(validData.userToken)
  );
  const { bookData } = validData;
  expect(savedBook.title).toEqual(bookData.title);
  expect(savedBook.description).toEqual(bookData.description);
  expect(savedBook.price).toEqual(bookData.price);
  expect(savedBook.whenCreated).toEqual(bookData.whenCreated);
  expect(savedBook.numberOfPages).toEqual(bookData.numberOfPages);
  expect(savedBook.tableOfContents.data).toEqual(bookData.tableOfContents);
  expect(savedBook.status).toEqual(BookStatus.notPublished);
  expect(savedBook.filePath).toEqual(bookData.filePath);
  expect(savedBook.sampleFilePath).toEqual(bookData.sampleFilePath);
});

test("file system error", async () => {
  isCorrectEbookFile.mockRejectedValueOnce(
    new Error("could not check the file")
  );
  await expectToThrowError(addBook, validData, CouldNotCompleteRequest);
});

test("database error", async () => {
  const publishBook = buildAddBook({
    ...dependencies,
    saveBook: jest.fn().mockRejectedValueOnce(new Error("could not save book")),
  });
  await expectToThrowError(publishBook, validData, CouldNotCompleteRequest);
});

async function expectValidationToFail<Key extends keyof BookData>(
  key: Key,
  value: BookData[Key],
  expectedErrorMessage: string
) {
  try {
    await addBook({
      ...validData,
      bookData: { ...validData.bookData, [key]: value },
    });
    throw "should have thrown";
  } catch (e) {
    expect(e).toBeInstanceOf(InvalidBookData);
    expect(e.errors).toEqual({ [key]: expectedErrorMessage });
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

async function expectToThrowError(fn: Function, data: any, expectedError: any) {
  await expect(() => fn(data)).rejects.toThrowError(expectedError);
}

function nCharString(n: number) {
  const str: string[] = [];
  for (let i = 0; i < n; i++) {
    str.push("x");
  }
  return str.join("");
}
