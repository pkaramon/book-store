import { CommentInfoWithOptionalId } from "../../domain/Comment/MakeComment";
import Comment, { CommentContent } from "../../domain/Comment";
import PostComment, {
  BookNotFound,
  CouldNotCompleteRequest,
  InputData,
  Dependencies,
  InvalidCommentContent,
  InvalidUserType,
  UserNotFound,
} from "../interface";
import Customer from "../../domain/Customer";

export default function buildPostComment(deps: Dependencies): PostComment {
  async function postComment(data: InputData) {
    const userId = await deps.verifyUserAuthToken(data.userAuthToken);
    await verifyUser(userId);
    const bookId = data.comment.bookId;
    await checkIfBookExists(bookId);
    const commentContent = await validateCommentContent(data.comment);
    const comment = await tryToCreateComment({
      bookId,
      authorId: userId,
      postedAt: deps.now(),
      ...commentContent,
    });
    await save(comment);
    return generateResponse(comment);
  }

  async function verifyUser(userId: string) {
    const user = await tryToGetUser(userId);
    if (user === null) throw new UserNotFound(userId);
    if (!(user instanceof Customer)) {
      throw new InvalidUserType(userId);
    }
  }

  async function tryToGetUser(userId: string) {
    try {
      return await deps.getUserById(userId);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get user from db", e);
    }
  }

  async function checkIfBookExists(bookId: string) {
    const book = await tryToGetBook(bookId);
    if (book === null) throw new BookNotFound(bookId);
  }

  async function tryToGetBook(bookId: string) {
    try {
      return await deps.getBookById(bookId);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get book from db", e);
    }
  }

  async function validateCommentContent(content: CommentContent) {
    const result = await deps.commentContentValidator.validateContent(content);
    if (!result.isValid)
      throw new InvalidCommentContent(
        result.errorMessages,
        result.invalidProperties
      );
    return result.content;
  }

  async function tryToCreateComment(info: CommentInfoWithOptionalId) {
    try {
      return await deps.makeComment(info);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not create comment", e);
    }
  }

  async function save(comment: Comment) {
    try {
      await deps.saveComment(comment);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not save comment to db", e);
    }
  }

  function generateResponse(comment: Comment) {
    return {
      createdComment: {
        title: comment.content.title,
        body: comment.content.body,
        stars: comment.content.stars,
        id: comment.metadata.id,
        postedAt: comment.metadata.postedAt,
        authorId: comment.metadata.authorId,
        bookId: comment.metadata.bookId,
      },
    };
  }

  return postComment;
}
