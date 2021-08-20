import Book, { BookInfo, BookStatus, TableOfContents } from "../domain/Book";
import Price from "../domain/Price";

export default async function getFakeBook(newBookInfo?: Partial<BookInfo>) {
  return new Book({
    id: "1",
    status: BookStatus.published,
    price: new Price("USD", 300),
    title: "t",
    description: "d",
    authorId: "101",
    filePath: "books/book.pdf",
    whenCreated: new Date(2000, 1, 1),
    numberOfPages: 123,
    sampleFilePath: "books/sample.pdf",
    tableOfContents: new TableOfContents([
      {
        title: "1. chapter",
        children: [
          { title: "1. 1" },
          { title: "1. 2", children: [{ title: "1.2.1" }] },
        ],
      },
      { title: "2. chapter" },
    ]),
    ...newBookInfo,
  });
}
