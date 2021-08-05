import InMemoryDb from "./InMemoryDb";
import Comment from "../domain/Comment";

export default class InMemoryCommentDb extends InMemoryDb<Comment> {
  protected getId(item: Comment): string {
    return item.metadata.id;
  }
}
