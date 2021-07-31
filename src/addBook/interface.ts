import VerifyToken from "../auth/VerifyToken";
import Book from "../domain/Book";
import { TableOfContentsData } from "../domain/TableOfContents";

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
  price: number;
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

export class CouldNotCompleteRequest extends Error {
  constructor(message?: string) {
    super(message);
    this.name = CouldNotCompleteRequest.name;
  }
}

export interface Dependencies {
  now: () => Date;
  saveBook: SaveBook;
  createId: CreateId;
  isCorrectEbookFile: IsCorrectEbookFile;
  verifyUserToken: VerifyToken;
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
