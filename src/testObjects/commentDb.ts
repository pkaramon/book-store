import Comment from "../domain/Comment";
import InMemoryDb from "./InMemoryDb";

interface CommentDb {
  save(comment: Comment): Promise<void>;
  getById(id: string): Promise<Comment | null>;
  TEST_ONLY_clear(): Promise<void>;
}

class InMemoryCommentDb extends InMemoryDb<Comment> {
  protected getId(item: Comment): string {
    return item.metadata.id;
  }
}

const commentDb: CommentDb = new InMemoryCommentDb();
export default commentDb;
