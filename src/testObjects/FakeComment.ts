import { CommentInfo } from "../domain/Comment/MakeComment";
import makeComment from "./makeComment";

export default function getFakeComment(newData?: Partial<CommentInfo>) {
  return makeComment({
    id: "10001",
    bookId: "1",
    authorId: "101",
    title: "comment title",
    body: "comment body",
    stars: 3,
    postedAt: new Date(),
    ...newData,
  });
}
