import Comment, { CommentContent, CommentMetadata } from ".";

export default interface MakeComment {
  (info: CommentInfoWithOptionalId): Comment | Promise<Comment>;
}

export type CommentInfoWithOptionalId = { id?: string } & Omit<
  CommentInfo,
  "id"
>;

export interface CommentInfo extends CommentContent, CommentMetadata{}
