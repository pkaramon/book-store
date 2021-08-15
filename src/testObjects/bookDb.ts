import Book from "../domain/Book";
import BookAuthor from "../domain/BookAuthor";
import User from "../domain/User";
import userDb from "./userDb";

interface BookDb {
  save(b: Book): Promise<void>;
  deleteById(id: string): Promise<void>;
  getById(id: string): Promise<Book | null>;
  getBooksWithAuthors(bookIds: string[]): Promise<BookWithAuthor[]>;
  getBooksAndAuthorsWithMatchingTitle(
    titleRegex: RegExp
  ): Promise<BookWithAuthor[]>;
  TEST_ONLY_clear(): Promise<void>;
}

interface BookWithAuthor {
  book: Book;
  author: BookAuthor;
}

class InMemoryBookDb implements BookDb {
  private books = new Map<string, Book>();

  constructor(private getUserById: (userId: string) => Promise<User | null>) {
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

  async getBooksWithAuthors(booksIds: string[]) {
    const books = await Promise.all(booksIds.map((id) => this.getById(id)));
    const withoutNulls = books.filter((b) => b !== null) as Book[];
    return await Promise.all(
      withoutNulls.map(async (book) => {
        const author = (await this.getUserById(
          book.info.authorId
        )) as BookAuthor;
        return { book, author };
      })
    );
  }

  async getBooksAndAuthorsWithMatchingTitle(titleRegex: RegExp) {
    const books = Array.from(this.books.values());
    const searched = books.filter((b) => titleRegex.test(b.info.title));
    return Promise.all(
      searched.map(async (b) => ({
        book: b,
        author: (await this.getUserById(b.info.authorId)) as BookAuthor,
      }))
    );
  }

  async TEST_ONLY_clear() {
    this.books = new Map();
  }
}

const bookDb: BookDb = new InMemoryBookDb(userDb.getById.bind(userDb));
export default bookDb;
