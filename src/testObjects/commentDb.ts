import Comment from "../domain/Comment";
import InMemoryDb from "./InMemoryDb";
import crypto from "crypto";

interface CommentDb {
  save(comment: Comment): Promise<void>;
  getById(id: string): Promise<Comment | null>;
  TEST_ONLY_clear(): Promise<void>;
  generateId(): string | Promise<string>;
}

class InMemoryCommentDb extends InMemoryDb<Comment> {
  constructor() {
    super();
    this.generateId = this.generateId.bind(this);
  }

  protected getId(item: Comment): string {
    return item.metadata.id;
  }

  async generateId() {
    return crypto.randomUUID();
  }
}

const commentDb: CommentDb = new InMemoryCommentDb();
export default commentDb;
