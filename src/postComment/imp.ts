import VerifyToken from "../auth/VerifyToken";
import Comment from "../domain/Comment";
import ErrorMessagesContainer from "../utils/ErrorMessagesContainer";

interface Dependencies {
  saveComment: (comment: any) => Promise<void>;
  verifyUserAuthToken: VerifyToken;
  doesBookExist: (bookId: string) => Promise<boolean>;
  now: () => Date;
  createId: () => string;
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

interface CommentData {
  stars: number;
  title: string;
  body: string;
}

export default function buildPostComment(deps: Dependencies) {
  return async function postComment(data: InputData) {
    const { bookId } = data.comment;
    const userId = await deps.verifyUserAuthToken(data.userAuthToken);
    const bookExists = await deps.doesBookExist(bookId);
    if (!bookExists) throw new BookNotFound(bookId);

    const validator = new CommentDataValidator(data.comment);
    const commentData = validator.validate();
    const comment: Comment = {
      id: deps.createId(),
      bookId,
      authorId: userId,
      stars: commentData.stars,
      title: commentData.title,
      body: commentData.body,
      createdAt: deps.now(),
    };

    await deps.saveComment(comment);
    return { commentId: comment.id };
  };
}

class CommentDataValidator {
  private container = new ErrorMessagesContainer<CommentData>();
  private static STARS = new Set([1, 2, 3, 4, 5]);

  constructor(private data: CommentData) {}

  validate() {
    const stars = this.validateStars();
    const title = this.validateTitle();
    const body = this.validateBody();
    if (this.container.hasAny())
      throw new InvalidCommentData(
        this.container.getErrorMessages(),
        this.container.getInavlidProperties()
      );
    return { stars, title, body };
  }

  private validateStars() {
    const stars = this.data.stars;
    if (!CommentDataValidator.STARS.has(stars))
      this.container.add("stars", "stars must be an integer between 1 and 5");
    return stars;
  }

  private validateTitle() {
    const title = this.data.title.trim();
    if (title.length === 0)
      this.container.add("title", "title cannot be empty");
    return title;
  }

  private validateBody() {
    const body = this.data.body.trim();
    if (body.length === 0) this.container.add("body", "body cannot be empty");
    return body;
  }
}

export class BookNotFound extends Error {
  constructor(public bookId: string) {
    super();
  }
}

export class InvalidCommentData extends Error {
  constructor(
    public readonly errorMessages: Partial<Record<keyof CommentData, string[]>>,
    public readonly invalidProperties: Array<keyof CommentData>
  ) {
    super();
  }
}
