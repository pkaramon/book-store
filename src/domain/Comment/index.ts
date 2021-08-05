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

export interface CommentMetadata {
  id: string;
  bookId: string;
  authorId: string;
  postedAt: Date;
}

export interface CommentContent {
  title: string;
  body: string;
  stars: number;
}
