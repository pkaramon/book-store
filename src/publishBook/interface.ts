import Book from "../domain/Book";
import { TableOfContentsData } from "../domain/TableOfContents";

export default interface PublishBook {
  (data: InputData): Promise<{ bookId: string }>;
}

export interface InputData {
  userId: string;
  title: string;
  description: string;
  tableOfContents: undefined | TableOfContentsData;
  price: number;
  whenCreated: Date;
  numberOfPages: number;
  sampleFilePath?: string;
  filePath: string;
}

export interface Dependencies {
  clock: Clock;
  saveBook: SaveBook;
  createId: CreateId;
  isCorrectEbookFile: IsCorrectEbookFile;
}

export interface Clock {
  now(): Date;
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

export class ValidationError extends Error {
  constructor(public readonly errors: Record<string, string>) {
    super();
    this.name = ValidationError.name;
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
