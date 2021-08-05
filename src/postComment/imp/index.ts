import Book from "../../domain/Book";
import { CommentInfoWithOptionalId } from "../../domain/Comment/MakeComment";
import Comment, { CommentContent } from "../../domain/Comment";
import PostComment, {
  BookNotFound,
  CouldNotCompleteRequest,
  InputData,
  Dependencies,
  InvalidCommentContent,
} from "../interface";

export default function buildPostComment(deps: Dependencies): PostComment {
  async function postComment(data: InputData) {
    const userId = await deps.verifyUserAuthToken(data.userAuthToken);
    const bookId = data.comment.bookId;
    const book = await getBook(bookId);

    const commentContent = await validateContent(data.comment);
    const comment = await tryToCreateComment({
      bookId,
      authorId: userId,
      stars: commentContent.stars,
      title: commentContent.title,
      body: commentContent.body,
      postedAt: deps.now(),
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

  async function validateContent(content: CommentContent) {
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
