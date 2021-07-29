import Book from "../domain/Book";

export default class InMemoryBookDb {
  private books = new Map<string, Book>();

  constructor() {
    this.save = this.save.bind(this);
    this.delete = this.delete.bind(this);
    this.getById = this.getById.bind(this);
  }

  async save(book: Book) {
    this.books.set(book.id, book);
  }

  async delete(bookId: string): Promise<void> {
    this.books.delete(bookId);
  }

  async getById(bookId: string): Promise<Book | null> {
    return this.books.get(bookId) ?? null;
  }

  clear() {
    this.books = new Map();
  }
}
