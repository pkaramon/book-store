import Book from ".";
import BookInfo from "./BookInfo";

export default interface MakeBook {
  (info: BookInfoWithOpionalId): Book | Promise<Book>;
}

export type BookInfoWithOpionalId = Omit<BookInfo, "id"> & { id?: string };
