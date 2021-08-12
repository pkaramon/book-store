import Book, { BookStatus } from "../domain/Book";
import BookAuthor from "../domain/BookAuthor";
import Search, { BookOutput, CouldNotCompleteRequest } from "./interface";

export interface Dependencies {
  getBooksAndAuthorsWithMatchingTitle: (
    titleRegex: RegExp
  ) => Promise<{ book: Book; author: BookAuthor }[]>;
}

export default function buildSearch(deps: Dependencies): Search {
  async function search(query: string) {
    return {
      books: (await getSearchedBooksWithAuthors(query))
        .filter(({ book }) => isBookPublished(book))
        .map(({ book, author }) => createBookOutput(book, author)),
    };
  }

  async function getSearchedBooksWithAuthors(query: string) {
    try {
      return await deps.getBooksAndAuthorsWithMatchingTitle(createRegex(query));
    } catch (e) {
      throw new CouldNotCompleteRequest("could not talk to db", e);
    }
  }

  function createRegex(query: string) {
    return new RegExp(query, "i");
  }
  function isBookPublished(book: Book) {
    return book.info.status === BookStatus.published;
  }

  function createBookOutput(book: Book, author: BookAuthor): BookOutput {
    return {
      id: book.info.id,
      price: {
        currency: book.info.price.currency,
        cents: book.info.price.cents,
      },
      title: book.info.title,
      description: book.info.description,
      numberOfPages: book.info.numberOfPages,
      author: {
        id: author.info.id,
        lastName: author.info.lastName,
        firstName: author.info.firstName,
      },
    };
  }

  return search;
}
