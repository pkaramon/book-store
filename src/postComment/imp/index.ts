import Book from "../../domain/Book";
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
import User from "../../domain/User";

export default function buildPostComment(deps: Dependencies): PostComment {
  async function postComment(data: InputData) {
    const userId = await deps.verifyUserAuthToken(data.userAuthToken);
    const user = await tryToGetUser(userId);
    validateUser(userId, user);
    const bookId = data.comment.bookId;
    const book = await getBook(bookId);
    const commentContent = await validateCommentContent(data.comment);
    const comment = await tryToCreateComment({
      bookId,
      authorId: userId,
      postedAt: deps.now(),
      ...commentContent,
    });
    book.addComment(comment);
    await save(book);
    return generateResponse(comment);
  }

  async function tryToGetUser(userId: string) {
    try {
      return await deps.getUserById(userId);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get user from db", e);
    }
  }

  function validateUser(userId: string, user: User | null) {
    if (user === null) throw new UserNotFound(userId);
    if (!(user instanceof Customer)) {
      throw new InvalidUserType(userId);
    }
  }

  async function getBook(bookId: string) {
    const book = await tryToGetBook(bookId);
    if (book === null) throw new BookNotFound(bookId);
    return book;
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

  async function tryToGetBook(bookId: string) {
    try {
      return await deps.getBookById(bookId);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get book from db", e);
    }
  }

  async function tryToCreateComment(info: CommentInfoWithOptionalId) {
    try {
      return await deps.makeComment(info);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not create comment", e);
    }
  }

  async function save(book: Book) {
    try {
      await deps.saveBook(book);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not save book to db", e);
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
