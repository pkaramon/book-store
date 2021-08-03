export default interface Comment {
  info: CommentInfo;
}

export interface CommentInfo {
  id: string;
  bookId: string;
  authorId: string;
  title: string;
  stars: number;
  body: string;
  createdAt: Date;
}
