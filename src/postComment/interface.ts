import VerifyToken from "../auth/VerifyToken";
import Book from "../domain/Book";
import MakeComment from "../domain/Comment/MakeComment";

export default interface PostComment {
  (data: InputData): Promise<Response>;
}

export interface InputData {
  userAuthToken: string;
  comment: {
    bookId: string;
    stars: number;
    title: string;
    body: string;
  };
}

export interface Response {
  createdComment: {
    id: string;
    title: string;
    body: string;
    createdAt: Date;
    stars: number;
    authorId: string;
    bookId: string;
  };
}

export class BookNotFound extends Error {
  constructor(public bookId: string) {
    super();
    this.name = BookNotFound.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(message: string, public originalError: any) {
    super(message);
    this.name = CouldNotCompleteRequest.name;
  }
}

export interface CommentData {
  stars: number;
  title: string;
  body: string;
}

export class InvalidCommentData extends Error {
  constructor(
    public readonly errorMessages: Partial<Record<keyof CommentData, string[]>>,
    public readonly invalidProperties: Array<keyof CommentData>
  ) {
    super();
    this.name = InvalidCommentData.name;
  }
}

export interface Dependencies {
  verifyUserAuthToken: VerifyToken;
  makeComment: MakeComment;
  getBookById: (bookId: string) => Promise<Book | null>;
  now: () => Date;
  saveBook: (b: Book) => Promise<void>;
}
