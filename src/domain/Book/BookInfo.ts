import TableOfContents from "./TableOfContents";
import BookStatus from "./BookStatus";

export default interface BookInfo {
  id: string;
  status: BookStatus;
  authorId: string;
  title: string;
  description: string;
  tableOfContents: TableOfContents;
  price: number;
  whenCreated: Date;
  numberOfPages: number;
  sampleFilePath: string | null;
  filePath: string;
}

