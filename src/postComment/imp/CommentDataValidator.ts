import { Stars } from "../../domain/Comment";
import ErrorMessagesContainer from "../../utils/ErrorMessagesContainer";
import { CommentData, InvalidCommentData } from "../interface";

export default class CommentDataValidator {
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
    return stars as Stars;
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
