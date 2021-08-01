export default interface Comment {
  id: string;
  bookId: string;
  authorId: string;
  title: string;
  stars: number;
  body: string;
  createdAt: Date;
}
