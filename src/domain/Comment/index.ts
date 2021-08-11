import CommentContent from "./CommentContent";
import CommentMetadata from "./CommentMetadata";

export { CommentContent, CommentMetadata };

export default abstract class Comment {
  constructor(
    private _metadata: CommentMetadata,
    private _content: CommentContent
  ) {}

  get metadata() {
    return this._metadata;
  }

  get content() {
    return this._content;
  }

  changeTitle(title: string) {
    this._content.title = title;
  }

  changeBody(body: string) {
    this._content.body = body;
  }

  changeStars(stars: number) {
    this._content.stars = stars;
  }
}
