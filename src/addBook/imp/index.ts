import Book, { BookStatus } from "../../domain/Book";
import TableOfContents from "../../domain/Book/TableOfContents";
import BookAuthor from "../../domain/BookAuthor";
import Price from "../../domain/Price";
import AddBook, {
  InputData,
  CouldNotCompleteRequest,
  BookData,
  NotBookAuthor,
  UserNotFound,
  InvalidBookData,
} from "../interface";
import Dependencies from "./Dependencies";

export default function buildAddBook({
  verifyUserToken,
  userDb,
  bookDb,
  bookDataValidator,
}: Dependencies): AddBook {
  async function addBook({ bookData, userToken }: InputData) {
    const authorId = await verifyUserToken(userToken);
    await verifyAuthor(authorId);
    const cleanedBookData = await validateBookData(bookData);
    const book = await createBook(authorId, cleanedBookData);
    await tryToSaveBook(book);
    return { bookId: book.info.id };
  }

  async function verifyAuthor(authorId: string) {
    const author = await tryToGetUser(authorId);
    if (author === null) throw new UserNotFound(authorId);
    if (!(author instanceof BookAuthor)) throw new NotBookAuthor(authorId);
  }

  async function validateBookData(bookData: BookData) {
    const { isValid, errorMessages, value } = await tryToValidateBookData(
      bookData
    );
    if (!isValid) throw new InvalidBookData(errorMessages);
    return value;
  }

  async function tryToValidateBookData(bookData: BookData) {
    try {
      return await bookDataValidator.validateData(bookData);
    } catch (e) {
      throw new CouldNotCompleteRequest("could nto validate book data", e);
    }
  }

  async function tryToGetUser(userId: string) {
    try {
      return await userDb.getById(userId);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get user from db", e);
    }
  }

  async function createBook(authorId: string, data: BookData) {
    return new Book({
      id: await bookDb.generateId(),
      status: BookStatus.notPublished,
      authorId,
      title: data.title,
      whenCreated: data.whenCreated,
      numberOfPages: data.numberOfPages,
      price: new Price(data.price.currency, data.price.cents),
      description: data.description,
      filePath: data.filePath,
      sampleFilePath: data.sampleFilePath ?? null,
      tableOfContents: data.tableOfContents
        ? new TableOfContents(data.tableOfContents)
        : TableOfContents.EmptyTableOfContents,
    });
  }

  async function tryToSaveBook(book: Book) {
    try {
      await bookDb.save(book);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not save book", e);
    }
  }

  return addBook;
}
