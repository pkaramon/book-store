import { CommentContent } from "../../domain/Comment";
import CommentContentValidator from "../../domain/CommentContentValidator";
import Comment from "../../domain/Comment";
import ErrorMessagesContainer from "../../utils/ErrorMessagesContainer";
import { InvalidNewCommentContent } from "../interface";

export default class CommentContentUpdater {
  private errorMessages = new ErrorMessagesContainer<CommentContent>();
  constructor(
    private validator: CommentContentValidator,
    private comment: Comment,
    private newCommentContent: Partial<CommentContent>
  ) {}

  async update() {
    const { title, body, stars } = this.newCommentContent;
    if (this.exists(title)) await this.updateTitle(title);
    if (this.exists(body)) await this.updateBody(body);
    if (this.exists(stars)) await this.updateStars(stars);

    if (this.errorMessages.hasAny())
      throw new InvalidNewCommentContent(
        this.errorMessages.getErrorMessages(),
        this.errorMessages.getInavlidProperties()
      );
  }

  private exists(value: any): value is string | number {
    return value !== undefined;
  }

  private async updateTitle(title: string) {
    const result = await this.validator.validateTitle(title);
    if (result.isValid) this.comment.changeTitle(result.value);
    else this.errorMessages.set("title", result.errorMessages);
  }

  private async updateBody(body: string) {
    const result = await this.validator.validateBody(body);
    if (result.isValid) this.comment.changeBody(result.value);
    else this.errorMessages.set("body", result.errorMessages);
  }

  private async updateStars(stars: number) {
    const result = await this.validator.validateStars(stars);
    if (result.isValid) this.comment.changeStars(result.value);
    else this.errorMessages.set("stars", result.errorMessages);
  }
}
