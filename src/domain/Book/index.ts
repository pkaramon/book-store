import BookInfo from "./BookInfo";
import BookStatus from "./BookStatus";
import TableOfContents from "./TableOfContents";

export default interface Book {
  info: BookInfo;
  publish(): void;
}
export { BookStatus, BookInfo, TableOfContents };
