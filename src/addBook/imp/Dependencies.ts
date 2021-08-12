import VerifyToken from "../../auth/VerifyToken";
import AsyncSchemaValidator from "../../domain/AsyncSchemaValidator";
import Book from "../../domain/Book";
import MakeBook from "../../domain/Book/MakeBook";
import User from "../../domain/User";
import {BookData} from "../interface";

export default interface Dependencies {
  saveBook: SaveBook;
  makeBook: MakeBook;
  bookDataValidator: AsyncSchemaValidator<BookData>;
  verifyUserToken: VerifyToken;
  getUserById: GetUserById;
}

export interface SaveBook {
  (book: Book): Promise<void>;
}

export interface CreateId {
  (): string;
}

export interface IsCorrectEbookFile {
  (path: string): Promise<boolean>;
}

export interface GetUserById {
  (userId: string): Promise<User | null>;
}
