import Comment, { CommentInfo } from ".";

export default interface MakeComment {
  (info: CommentInfoWithOptionalId): Comment | Promise<Comment>;
}

export type CommentInfoWithOptionalId = { id?: string } & Omit<
  CommentInfo,
  "id"
>;
