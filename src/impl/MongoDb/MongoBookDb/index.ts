import * as mongo from "mongodb";
import Book from "../../../domain/Book";
import BookAndAuthor from "../../../domain/BookAndAuthor";
import BookAuthor from "../../../domain/BookAuthor";
import BaseMongoDb, { MongoConnectionInfo } from "../BaseMongoDb";
import BookToDocumentGateway from "./BookToDocumentGateway";
import BookAndAuthorDocument from "./BookAndAuthorDocument";
import BookDocument from "./BookDocument";
import UserToDocumentGateway from "../MongoUserDb/UserToDocumentGateway";

export default class MongoBookDb extends BaseMongoDb<BookDocument> {
  private bookGateway = new BookToDocumentGateway();
  private userCollectionName: string;
  private userGateway: UserToDocumentGateway;

  constructor(
    connectionInfo: MongoConnectionInfo,
    userDbInfo: {
      userCollectionName: string;
      userToDocumentGateway: UserToDocumentGateway;
    }
  ) {
    super(connectionInfo);
    this.userCollectionName = userDbInfo.userCollectionName;
    this.userGateway = userDbInfo.userToDocumentGateway;
  }

  async getById(id: string): Promise<Book | null> {
    const collection = await this.getCollection();
    const document = await collection.findOne({ _id: id });
    if (document === undefined) return null;
    return this.bookGateway.fromDocumentToBook(document);
  }

  async save(book: Book) {
    const collection = await this.getCollection();
    const document = this.bookGateway.fromBookToDocument(book);
    await collection.updateOne(
      { _id: book.info.id },
      { $set: document },
      { upsert: true }
    );
  }

  async deleteById(id: string): Promise<{ wasDeleted: boolean }> {
    const collection = await this.getCollection();
    const { deletedCount } = await collection.deleteOne({ _id: id });
    return { wasDeleted: deletedCount === 1 };
  }

  async getBooksWithAuthors(bookIds: string[]): Promise<BookAndAuthor[]> {
    const documents = await this.findBookAndAuthorDocuments({
      _id: { $in: bookIds },
    });
    const sorted = await this.sortBookAndAuthorDocumentsAccordingToUsersBookIds(
      documents,
      bookIds
    );
    const bookAndAuthorsPromises = sorted.map((doc) =>
      this.fromDocToBookAndAuthor(doc)
    );
    return Promise.all(bookAndAuthorsPromises);
  }

  private async findBookAndAuthorDocuments(filter: mongo.Filter<BookDocument>) {
    const collection = await this.getCollection();
    const aggregationResult = collection.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: this.userCollectionName,
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
    ]);
    return (await aggregationResult.toArray()) as BookAndAuthorDocument[];
  }

  private async sortBookAndAuthorDocumentsAccordingToUsersBookIds(
    documents: BookAndAuthorDocument[],
    bookIds: string[]
  ) {
    const sortingHelper = new Map(bookIds.map((id, idx) => [id, idx]));
    return documents.sort(
      (a, b) => sortingHelper.get(a._id)! - sortingHelper.get(b._id)!
    );
  }

  private async fromDocToBookAndAuthor(doc: any) {
    const book = this.bookGateway.fromDocumentToBook(doc);
    const author = (await this.userGateway.fromDocumentToUser(
      doc.author[0]
    )) as BookAuthor;
    return { book, author };
  }

  async search(query: string): Promise<BookAndAuthor[]> {
    const documents = await this.findBookAndAuthorDocuments({
      $text: { $search: query },
    });
    const objectPromises = documents.map((doc: any) =>
      this.fromDocToBookAndAuthor(doc)
    );
    return await Promise.all(objectPromises);
  }

  protected async afterConnecting() {
    const collection = await this.getCollection();
    if (await collection.indexExists("title_1")) return;
    await collection.createIndex({ title: "text" });
  }

  async TEST_ONLY_dropCollection() {
    const collection = await this.getCollection();
    await collection.drop();
  }
}
