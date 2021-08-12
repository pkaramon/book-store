import { CommentContent } from "../domain/Comment";

export default interface EditComment {
  (data: InputData): Promise<Response>;
}

export interface InputData {
  userAuthToken: string;
  commentId: string;
  commentContent: Partial<CommentContent>;
}

export interface Response {
  modifiedComment: {
    id: string;
    title: string;
    body: string;
    postedAt: Date;
    stars: number;
    authorId: string;
    bookId: string;
  };
}

export class CommentNotFound extends Error {
  constructor(public readonly commentId: string) {
    super();
    this.name = CommentNotFound.name;
  }
}

export class NotCommentAuthor extends Error {
  constructor(
    public readonly userId: string,
    public readonly commentId: string
  ) {
    super();
    this.name = NotCommentAuthor.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(message: string, public readonly originalError: any) {
    super(message);
    this.name = CouldNotCompleteRequest.name;
  }
}

export class InvalidNewCommentContent extends Error {
  constructor(
    public readonly errorMessages: Partial<
      Record<keyof CommentContent, string[]>
    >,
    public readonly invalidProperties: Array<keyof CommentContent>
  ) {
    super();
    this.name = InvalidNewCommentContent.name;
  }
}
