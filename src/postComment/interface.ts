import { CommentContent } from "../domain/Comment";

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
    postedAt: Date;
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

export class BookNotPublished extends Error {
  constructor(public bookId: string) {
    super();
    this.name = BookNotPublished.name;
  }
}

export class InvalidUserType extends Error {
  constructor(public userId: string) {
    super();
    this.name = InvalidUserType.name;
  }
}

export class UserNotFound extends Error {
  constructor(public userId: string) {
    super();
    this.name = UserNotFound.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(message: string, public originalError: any) {
    super(message);
    this.name = CouldNotCompleteRequest.name;
  }
}

export class InvalidCommentContent extends Error {
  constructor(
    public readonly errorMessages: Partial<
      Record<keyof CommentContent, string[]>
    >,
    public readonly invalidProperties: Array<keyof CommentContent>
  ) {
    super();
    this.name = InvalidCommentContent.name;
  }
}
