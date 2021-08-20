import VerifyToken from "../../auth/VerifyToken";
import Book from "../../domain/Book";
import CommentContentValidator from "../../domain/CommentContentValidator";
import User from "../../domain/User";
import Comment from "../../domain/Comment";
import Clock from "../../domain/Clock";

export default interface Dependencies {
  verifyUserAuthToken: VerifyToken;
  getBookById: (bookId: string) => Promise<Book | null>;
  getUserById: (userId: string) => Promise<User | null>;
  clock: Clock;
  commentDb: CommentDb;
  commentContentValidator: CommentContentValidator;
}

interface CommentDb {
  save(c: Comment): Promise<void>;
  generateId(): string | Promise<string>;
}
