export default interface Comment {
  info: CommentInfo;
}

export interface CommentInfo {
  id: string;
  bookId: string;
  authorId: string;
  title: string;
  stars: Stars;
  body: string;
  createdAt: Date;
}

export type Stars = 1 | 2 | 3 | 4 | 5;
