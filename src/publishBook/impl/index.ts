import Book from "../../domain/Book";
import TableOfContents from "../../domain/TableOfContents";
import PublishBook, {
  InputData,
  CouldNotCompleteRequest,
  Dependencies,
} from "../interface";
import validateInputData from "./validateInputData";

export default function buildPublishBook(deps: Dependencies): PublishBook {
  return async function publishBook(data: InputData) {
    await validateInputData(deps, data);
    const book = createBook(data);
    await tryToSaveBook(book);
    return { bookId: deps.createId() };
  };

  function createBook(data: InputData) {
    return new Book({
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
        : TableOfContents.NullTableOfContents,
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
