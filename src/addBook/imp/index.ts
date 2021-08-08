import Book, { BookStatus } from "../../domain/Book";
import TableOfContents from "../../domain/Book/TableOfContents";
import BookAuthor from "../../domain/BookAuthor";
import Price from "../../domain/Price";
import AddBook, {
  InputData,
  CouldNotCompleteRequest,
  Dependencies,
  BookData,
  NotBookAuthor,
  UserNotFound,
} from "../interface";
import validateBookData from "./validateBookData";

export default function buildAddBook({
  verifyUserToken,
  makeBook,
  saveBook,
  now,
  isCorrectEbookFile,
  getUserById,
}: Dependencies): AddBook {
  async function addBook({ bookData, userToken }: InputData) {
    const authorId = await verifyUserToken(userToken);
    await verifyAuthor(authorId);
    const cleanedBookData = await validateBookData(bookData, {
      isCorrectEbookFile,
      now,
    });
    const book = await createBook(authorId, cleanedBookData);
    await tryToSaveBook(book);
    return { bookId: book.info.id };
  }

  async function verifyAuthor(authorId: string) {
    const author = await tryToGetUser(authorId);
    if (author === null) throw new UserNotFound(authorId);
    if (!(author instanceof BookAuthor)) throw new NotBookAuthor();
  }

  async function tryToGetUser(userId: string) {
    try {
      return await getUserById(userId);
    } catch {
      throw new CouldNotCompleteRequest("could not get user from db");
    }
  }

  function createBook(authorId: string, data: BookData) {
    return makeBook({
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
      await saveBook(book);
    } catch {
      throw new CouldNotCompleteRequest("could not save book");
    }
  }

  return addBook;
}
