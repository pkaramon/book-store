import Comment, { CommentContent } from "../../domain/Comment";
import EditComment, {
  CommentNotFound,
  CouldNotCompleteRequest,
  Dependencies,
  InputData,
  NotCommentAuthor,
} from "../interface";
import CommentContentUpdater from "./CommentContentUpdater";

export default function buildEditComment(deps: Dependencies): EditComment {
  async function editComment(data: InputData) {
    const userId = await deps.verifyUserAuthToken(data.userAuthToken);
    const comment = checkIfCommentWasFound(
      data.commentId,
      await tryToGetComment(data.commentId)
    );
    checkIfUserIsAuthorOfComment(userId, comment);
    await updateCommentWithNewContent(comment, data.commentContent);
    await tryToSaveComment(comment);
    return createResponse(comment);
  }

  function checkIfCommentWasFound(commentId: string, comment: Comment | null) {
    if (comment === null) throw new CommentNotFound(commentId);
    return comment;
  }

  async function tryToGetComment(commentId: string) {
    try {
      return await deps.getCommentById(commentId);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get comment from db", e);
    }
  }

  function checkIfUserIsAuthorOfComment(userId: string, comment: Comment) {
    if (comment.metadata.authorId !== userId)
      throw new NotCommentAuthor(userId, comment!.metadata.id);
  }

  async function updateCommentWithNewContent(
    comment: Comment,
    newContent: Partial<CommentContent>
  ) {
    const commentContentUpdater = new CommentContentUpdater(
      deps.commentContentValidator,
      comment,
      newContent
    );
    await commentContentUpdater.update();
  }

  async function tryToSaveComment(comment: Comment) {
    try {
      await deps.saveComment(comment);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not save comment to db", e);
    }
  }

  function createResponse(comment: Comment) {
    return {
      modifiedComment: { ...comment.metadata, ...comment.content },
    };
  }

  return editComment;
}
