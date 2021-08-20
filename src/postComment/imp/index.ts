import Comment, { CommentContent } from "../../domain/Comment";
import PostComment, {
  BookNotFound,
  BookNotPublished,
  CouldNotCompleteRequest,
  InputData,
  InvalidCommentContent,
  InvalidUserType,
  UserNotFound,
} from "../interface";
import Customer from "../../domain/Customer";
import Dependencies from "./Dependencies";
import Book, { BookStatus } from "../../domain/Book";

export default function buildPostComment({
  verifyUserAuthToken,
  getUserById,
  getBookById,
  commentContentValidator,
  clock,
  commentDb,
}: Dependencies): PostComment {
  async function postComment(data: InputData) {
    const userId = await verifyUserAuthToken(data.userAuthToken);
    await verifyUser(userId);
    const bookId = data.comment.bookId;
    const book = await getBook(bookId);
    checkIfBookIsPublished(book);
    const commentContent = await validateCommentContent(data.comment);
    const comment = await createComment({ bookId, userId, commentContent });
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
      return await getUserById(userId);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get user from db", e);
    }
  }

  async function getBook(bookId: string) {
    const book = await tryToGetBook(bookId);
    if (book === null) throw new BookNotFound(bookId);
    return book;
  }

  function checkIfBookIsPublished(book: Book) {
    if (book.info.status === BookStatus.notPublished)
      throw new BookNotPublished(book.info.id);
  }

  async function tryToGetBook(bookId: string) {
    try {
      return await getBookById(bookId);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get book from db", e);
    }
  }

  async function validateCommentContent(content: CommentContent) {
    const result = await commentContentValidator.validateContent(content);
    if (!result.isValid)
      throw new InvalidCommentContent(
        result.errorMessages,
        result.invalidProperties
      );
    return result.content;
  }

  async function createComment(data: {
    bookId: string;
    userId: string;
    commentContent: CommentContent;
  }) {
    return new Comment(
      {
        id: await getId(),
        bookId: data.bookId,
        authorId: data.userId,
        postedAt: clock.now(),
      },
      data.commentContent
    );
  }

  async function getId() {
    try {
      return await commentDb.generateId();
    } catch (e) {
      throw new CouldNotCompleteRequest("could not generate id", e);
    }
  }

  async function save(comment: Comment) {
    try {
      await commentDb.save(comment);
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
