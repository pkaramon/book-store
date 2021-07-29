import Book from "../../domain/Book";
import TableOfContents from "../../domain/TableOfContents";
import AddBook, {
  InputData,
  CouldNotCompleteRequest,
  Dependencies,
} from "../interface";
import validateInputData from "./validateInputData";

export default function buildAddBook(deps: Dependencies): AddBook {
  return async function addBook(data: InputData) {
    await validateInputData(data, deps);
    const book = createBook(data);
    await tryToSaveBook(book);
    return { bookId: book.id };
  };

  function createBook(data: InputData) {
    return new Book({
      id: deps.createId(),
      authorId: data.userId,
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
}
