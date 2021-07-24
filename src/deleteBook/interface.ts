import Book from "../domain/Book";

export default interface DeleteBook {
  (data: InputData): Promise<void>;
}

export interface InputData {
  userId: string;
  bookId: string;
}

export interface DeleteBookById {
  (bookId: string): Promise<void>;
}

export interface GetBookById {
  (bookId: string): Promise<Book | null>;
}

export class BookNotFound extends Error {
  constructor(bookId: string) {
    super(`book with id: ${bookId} was not found`);
    this.name = BookNotFound.name;
  }
}

export class NotAllowed extends Error {
  constructor(userId: string) {
    super(`user with id: ${userId} is not the author of the book`);
    this.name = BookNotFound.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = CouldNotCompleteRequest.name;
  }
}
