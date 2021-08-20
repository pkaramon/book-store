import Comment, { CommentContent, CommentMetadata } from "../domain/Comment";

export interface CommentInfo extends CommentContent, CommentMetadata {}

export default function getFakeComment(newData?: Partial<CommentInfo>) {
  return new Comment(
    {
      id: "10001",
      bookId: "1",
      authorId: "101",
      postedAt: new Date(2020, 1, 1),
      ...newData,
    },
    {
      title: "comment title",
      body: "comment body",
      stars: 3,
      ...newData,
    }
  );
}
