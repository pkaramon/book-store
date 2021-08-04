import Book from "../../domain/Book";
import { CommentInfoWithOptionalId } from "../../domain/Comment/MakeComment";
import Comment from "../../domain/Comment";
import PostComment, {
  BookNotFound,
  CouldNotCompleteRequest,
  InputData,
  Dependencies,
} from "../interface";
import CommentDataValidator from "./CommentDataValidator";

export default function buildPostComment(deps: Dependencies): PostComment {
  async function postComment(data: InputData) {
    const userId = await deps.verifyUserAuthToken(data.userAuthToken);
    const bookId = data.comment.bookId;
    const book = await getBook(bookId);
    const validator = new CommentDataValidator(data.comment);
    const commentData = validator.validate();
    const comment = await tryToCreateComment({
      bookId,
      authorId: userId,
      stars: commentData.stars,
      title: commentData.title,
      body: commentData.body,
      createdAt: deps.now(),
    });

    book.addComment(comment);
    await save(book);

    return generateResponse(comment);
  }

  async function getBook(bookId: string) {
    const book = await tryToGetBook(bookId);
    if (book === null) throw new BookNotFound(bookId);
    return book;
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
        id: comment.info.id,
        title: comment.info.title,
        body: comment.info.body,
        createdAt: comment.info.createdAt,
        stars: comment.info.stars,
        authorId: comment.info.authorId,
        bookId: comment.info.bookId,
      },
    };
  }
  return postComment;
}
