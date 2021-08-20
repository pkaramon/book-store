import VerifyToken from "../../auth/VerifyToken";
import AsyncSchemaValidator from "../../domain/AsyncSchemaValidator";
import Book from "../../domain/Book";
import User from "../../domain/User";
import { BookData } from "../interface";

export default interface Dependencies {
  bookDb: BookDb;
  userDb: UserDb;
  bookDataValidator: AsyncSchemaValidator<BookData>;
  verifyUserToken: VerifyToken;
}

export interface BookDb {
  save(book: Book): Promise<void>;
  generateId(): string | Promise<string>;
}

export interface UserDb {
  getById(id: string): Promise<User | null>;
}

export interface IsCorrectEbookFile {
  (path: string): Promise<boolean>;
}
