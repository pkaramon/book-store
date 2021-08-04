import VerifyToken from "../auth/VerifyToken";
import Book from "../domain/Book";
import User from "../domain/User";

export default interface PublishBook {
  (data: InputData): Promise<void>;
}

export interface InputData {
  adminAuthToken: string;
  bookId: string;
}

export class BookNotFound extends Error {
  constructor(public readonly bookId: string) {
    super(`book with id ${bookId} was not found`);
    this.name = BookNotFound.name;
  }
}

export class AdminNotFound extends Error {
  constructor(public readonly adminId: string) {
    super(`admin with id ${adminId} was not found`);
    this.name = AdminNotFound.name;
  }
}

export class UserIsNotAdmin extends Error {
  constructor(public readonly userId: string) {
    super(`user with id ${userId} is not an admin`);
    this.name = UserIsNotAdmin.name;
  }
}

export class AlreadyPublished extends Error {
  constructor(public readonly bookId: string) {
    super(`book with id ${bookId} was already published`);
    this.name = AlreadyPublished.name;
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
  getUserById: (id: string) => Promise<User | null>;
  verifyAdminAuthToken: VerifyToken;
}
