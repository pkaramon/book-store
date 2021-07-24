import buildPublishBook from "./impl";
import Book, { BookStatus } from "../domain/Book";
import {
  InputData,
  ValidationError,
  CouldNotCompleteRequest,
} from "./interface";

const clock = { now: () => new Date(2020, 1, 1) };
const saveBook = jest.fn();
const createId = jest.fn(() => "123");
const isCorrectEbookFile = jest.fn().mockResolvedValue(true);
const publishBook = buildPublishBook({
  clock,
  saveBook,
  createId,
  isCorrectEbookFile,
});

beforeEach(() => {
  saveBook.mockClear();
  createId.mockClear();
  isCorrectEbookFile.mockClear();
});

const validData: InputData = {
  userId: "1",
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
  sampleFilePath: "books/first book chapter one.pdf",
};

describe("validation", () => {
  test("title cannot be empty", async () => {
    await expectValidationToFail("title", "", "title cannot be empty");
    await expectValidationToFail("title", " ", "title cannot be empty");
  });

  test("description cannot be empty", async () => {
    await expectValidationToFail(
      "description",
      "",
      "description cannot be empty"
    );
    await expectValidationToFail(
      "description",
      "   ",
      "description cannot be empty"
    );
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
    await expectValidationToFail("price", -1, "price must be positive");
    await expectValidationToFail("price", 0, "price must be positive");
  });

  test("numberOfPages must be positive", async () => {
    await expectValidationToFail(
      "numberOfPages",
      -1,
      "numberOfPages must be positive"
    );
    await expectValidationToFail(
      "numberOfPages",
      0,
      "numberOfPages must be positive"
    );
  });

  test("whenCreated cannot be in the future", async () => {
    await expectValidationToPass("whenCreated", clock.now());
    await expectValidationToFail(
      "whenCreated",
      new Date(2020, 1, 2),
      "whenCreated cannot be in the future"
    );
  });

  test("accumulation of errors", async () => {
    try {
      await publishBook({ ...validData, title: "", price: -1 });
      throw "should have thrown";
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
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
  const { bookId } = await publishBook({ ...validData });
  expect(bookId).toEqual(createId());
  const savedBook = saveBook.mock.calls[0][0] as Book;
  expect(savedBook.id).toEqual(bookId);
  expect(savedBook.authorId).toEqual(validData.userId);
  expect(savedBook.title).toEqual(validData.title);
  expect(savedBook.description).toEqual(validData.description);
  expect(savedBook.price).toEqual(validData.price);
  expect(savedBook.whenCreated).toEqual(validData.whenCreated);
  expect(savedBook.numberOfPages).toEqual(validData.numberOfPages);
  expect(savedBook.tableOfContents.data).toEqual(validData.tableOfContents);
  expect(savedBook.status).toEqual(BookStatus.notPublished);
  expect(savedBook.filePath).toEqual(validData.filePath);
  expect(savedBook.sampleFilePath).toEqual(validData.sampleFilePath);
});

test("file system error", async () => {
  isCorrectEbookFile.mockRejectedValueOnce(
    new Error("could not check the file")
  );
  await expect(() => publishBook({ ...validData })).rejects.toThrow(
    CouldNotCompleteRequest
  );
});

test("database error", async () => {
  saveBook.mockRejectedValueOnce(new Error("could not connect to db"));
  await expect(() => publishBook({ ...validData })).rejects.toThrow(
    CouldNotCompleteRequest
  );
});

async function expectValidationToFail<Key extends keyof InputData>(
  key: Key,
  value: typeof validData[Key],
  expectedErrorMessage: string
) {
  try {
    await publishBook({ ...validData, [key]: value });
    throw "should have thrown";
  } catch (e) {
    expect(e).toBeInstanceOf(ValidationError);
    expect(e.errors).toEqual({ [key]: expectedErrorMessage });
    expect(e.invalidProperties).toEqual([key]);
  }
}

async function expectValidationToPass<Key extends keyof InputData>(
  key: Key,
  value: typeof validData[Key]
) {
  await publishBook({ ...validData, [key]: value });
}

function nCharString(n: number) {
  const str: string[] = [];
  for (let i = 0; i < n; i++) {
    str.push("x");
  }
  return str.join("");
}
