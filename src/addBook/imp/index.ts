import Book from "../../domain/Book";
import TableOfContents from "../../domain/TableOfContents";
import AddBook, {
  InputData,
  CouldNotCompleteRequest,
  Dependencies,
  BookData,
} from "../interface";
import validateBookData from "./validateBookData";

export default function buildAddBook(deps: Dependencies): AddBook {
  async function addBook({ bookData, userToken }: InputData) {
    const authorId = await deps.verifyUserToken(userToken);
    await validateBookData(bookData, deps);
    const book = createBook(authorId, bookData);
    await tryToSaveBook(book);
    return { bookId: book.id };
  }

  function createBook(authorId: string, data: BookData) {
    return new Book({
      id: deps.createId(),
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
      await deps.saveBook(book);
    } catch {
      throw new CouldNotCompleteRequest();
    }
  }

  return addBook;
}
