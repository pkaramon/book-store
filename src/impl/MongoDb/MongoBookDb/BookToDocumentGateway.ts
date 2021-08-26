import Book, { BookStatus, TableOfContents } from "../../../domain/Book";
import Price from "../../../domain/Price";
import BookDocument from "./BookDocument";

export default class BookToDocumentGateway {
  fromBookToDocument({ info }: Book): BookDocument {
    return {
      _id: info.id,
      status:
        info.status === BookStatus.published ? "published" : "notPublished",
      authorId: info.authorId,
      title: info.title,
      description: info.description,
      tableOfContents: info.tableOfContents.data,
      price: { cents: info.price.cents, currency: info.price.currency },
      whenCreated: info.whenCreated,
      numberOfPages: info.numberOfPages,
      sampleFilePath: info.sampleFilePath,
      filePath: info.filePath,
    };
  }

  fromDocumentToBook(bookDocument: BookDocument): Book {
    return new Book({
      id: bookDocument._id,
      status:
        bookDocument.status === "published"
          ? BookStatus.published
          : BookStatus.notPublished,
      authorId: bookDocument.authorId,
      title: bookDocument.title,
      description: bookDocument.description,
      tableOfContents: new TableOfContents(bookDocument.tableOfContents),
      price: new Price(bookDocument.price.currency, bookDocument.price.cents),
      whenCreated: bookDocument.whenCreated,
      numberOfPages: bookDocument.numberOfPages,
      sampleFilePath: bookDocument.sampleFilePath,
      filePath: bookDocument.filePath,
    });
  }
}
