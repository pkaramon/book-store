import Book, { BookStatus } from "../../domain/Book";
import TableOfContents from "../../domain/Book/TableOfContents";
import AddBook, {
  InputData,
  CouldNotCompleteRequest,
  Dependencies,
  BookData,
} from "../interface";
import validateBookData from "./validateBookData";

export default function buildAddBook({
  verifyUserToken,
  makeBook,
  saveBook,
  now,
  isCorrectEbookFile,
}: Dependencies): AddBook {
  async function addBook({ bookData, userToken }: InputData) {
    const authorId = await verifyUserToken(userToken);
    await validateBookData(bookData, { isCorrectEbookFile, now });
    const book = await createBook(authorId, bookData);
    await tryToSaveBook(book);
    return { bookId: book.info.id };
  }

  function createBook(authorId: string, data: BookData) {
    return makeBook({
      status: BookStatus.notPublished,
      authorId,
      title: data.title,
      whenCreated: data.whenCreated,
      numberOfPages: data.numberOfPages,
      price: data.price,
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
      throw new CouldNotCompleteRequest();
    }
  }

  return addBook;
}
