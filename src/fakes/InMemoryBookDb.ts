import Book from "../domain/Book";
import BookAuthor from "../domain/BookAuthor";
import User from "../domain/User";

export default class InMemoryBookDb {
  private books = new Map<string, Book>();

  constructor() {
    this.save = this.save.bind(this);
    this.deleteById = this.deleteById.bind(this);
    this.getById = this.getById.bind(this);
    this.getBooksWithAuthors = this.getBooksWithAuthors.bind(this);
    this.getBooksAndAuthorsWithMatchingTitle =
      this.getBooksAndAuthorsWithMatchingTitle.bind(this);
  }

  async save(book: Book) {
    this.books.set(book.info.id, book);
  }

  async deleteById(bookId: string): Promise<void> {
    this.books.delete(bookId);
  }

  async getById(bookId: string): Promise<Book | null> {
    return this.books.get(bookId) ?? null;
  }

  async getBooksWithAuthors(
    getUserById: (userId: string) => Promise<User | null>,
    booksIds: string[]
  ) {
    const books = await Promise.all(booksIds.map((id) => this.getById(id)));
    const withoutNulls = books.filter((b) => b !== null) as Book[];
    return await Promise.all(
      withoutNulls.map(async (book) => {
        const author = (await getUserById(book.info.authorId)) as BookAuthor;
        return { book, author };
      })
    );
  }

  async getBooksAndAuthorsWithMatchingTitle(
    getUserById: (userId: string) => Promise<User | null>,
    titleRegex: RegExp
  ) {
    const books = Array.from(this.books.values());
    const searched = books.filter((b) => titleRegex.test(b.info.title));
    return Promise.all(
      searched.map(async (b) => ({
        book: b,
        author: (await getUserById(b.info.authorId)) as BookAuthor,
      }))
    );
  }

  clear() {
    this.books = new Map();
  }
}
