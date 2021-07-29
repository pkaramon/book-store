import Admin from "../domain/Admin";
import Book from "../domain/Book";

export default interface PublishBook {
  (data: InputData): Promise<void>;
}

export interface InputData {
  adminId: string;
  bookId: string;
}

export class BookNotFound extends Error {
  constructor(public readonly bookId: string) {
    super(`book with id ${bookId} was not found`);
  }
}

export class AdminNotFound extends Error {
  constructor(public readonly adminId: string) {
    super(`admin with id ${adminId} was not found`);
  }
}

export class AlreadyPublished extends Error {
  constructor(public readonly bookId: string) {
    super(`book with id ${bookId} was already published`);
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(message: string, public originalError: any) {
    super(message);
  }
}

export interface Dependencies {
  getBookById: (id: string) => Promise<Book | null>;
  saveBook: (b: Book) => Promise<void>;
  getAdminById: (id: string) => Promise<Admin | null> 
}
