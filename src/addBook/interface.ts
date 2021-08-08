import VerifyToken from "../auth/VerifyToken";
import AsyncSchemaValidator from "../domain/AsyncSchemaValidator";
import Book from "../domain/Book";
import MakeBook from "../domain/Book/MakeBook";
import { TableOfContentsData } from "../domain/Book/TableOfContents";
import User from "../domain/User";

export default interface AddBook {
  (data: InputData): Promise<{ bookId: string }>;
}

export interface InputData {
  userToken: string;
  bookData: BookData;
}

export interface BookData {
  title: string;
  description: string;
  tableOfContents?: TableOfContentsData;
  price: { currency: string; cents: number };
  whenCreated: Date;
  numberOfPages: number;
  sampleFilePath?: string;
  filePath: string;
}

export type InvalidBookDataErrors = Partial<Record<keyof BookData, string[]>>;
export class InvalidBookData extends Error {
  constructor(public readonly errors: InvalidBookDataErrors) {
    super();
    this.name = InvalidBookData.name;
  }

  get invalidProperties() {
    return Reflect.ownKeys(this.errors);
  }
}

export class NotBookAuthor extends Error {
  constructor(public userId: string) {
    super();
    this.name = NotBookAuthor.name;
  }
}

export class UserNotFound extends Error {
  constructor(public userId: string) {
    super();
    this.name = UserNotFound.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(message?: string) {
    super(message);
    this.name = CouldNotCompleteRequest.name;
  }
}

export interface Dependencies {
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
