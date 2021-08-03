import Book from "../domain/Book";

export default class InMemoryBookDb {
  private books = new Map<string, Book>();

  constructor() {
    this.save = this.save.bind(this);
    this.deleteById = this.deleteById.bind(this);
    this.getById = this.getById.bind(this);
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

  clear() {
    this.books = new Map();
  }
}
