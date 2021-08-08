import TableOfContents from "./TableOfContents";
import BookStatus from "./BookStatus";
import Price from "../Price";

export default interface BookInfo {
  id: string;
  status: BookStatus;
  authorId: string;
  title: string;
  description: string;
  tableOfContents: TableOfContents;
  price: Price;
  whenCreated: Date;
  numberOfPages: number;
  sampleFilePath: string | null;
  filePath: string;
}
