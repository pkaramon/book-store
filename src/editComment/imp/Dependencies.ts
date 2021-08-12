import VerifyToken from "../../auth/VerifyToken";
import CommentContentValidator from "../../domain/CommentContentValidator";
import Comment from "../../domain/Comment";

export default interface Dependencies {
  verifyUserAuthToken: VerifyToken;
  getCommentById: (comId: string) => Promise<Comment | null>;
  commentContentValidator: CommentContentValidator;
  saveComment: (comment: Comment) => Promise<void>;
}
