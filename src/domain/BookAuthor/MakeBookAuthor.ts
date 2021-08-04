import BookAuthor, { BookAuthorInfo } from ".";

export default interface MakeBookAuthor {
  (data: BookAuthorData): Promise<BookAuthor> | BookAuthor;
}

export type BookAuthorData = Omit<BookAuthorInfo, "id"> & { id?: string };
