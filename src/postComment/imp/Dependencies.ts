import VerifyToken from "../../auth/VerifyToken";
import Book from "../../domain/Book";
import MakeComment from "../../domain/Comment/MakeComment";
import CommentContentValidator from "../../domain/CommentContentValidator";
import User from "../../domain/User";
import Comment from "../../domain/Comment";
import Clock from "../../domain/Clock";

export default interface Dependencies {
  verifyUserAuthToken: VerifyToken;
  makeComment: MakeComment;
  getBookById: (bookId: string) => Promise<Book | null>;
  getUserById: (userId: string) => Promise<User | null>;
  clock: Clock, 
  saveComment: (c: Comment) => Promise<void>;
  commentContentValidator: CommentContentValidator;
}
