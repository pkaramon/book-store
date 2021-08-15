import * as mongo from "mongodb";
import User from "../../domain/User";

export interface UserDocument {
  _id: string;
  userType: string;
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
  birthDate: Date;
}

export interface UserToDocumentGateway {
  fromUserToDocument(user: User): Promise<UserDocument> | UserDocument;
  fromDocumentToUser(document: UserDocument): Promise<User> | User;
}

export default class MongoUserDb {
  private client?: mongo.MongoClient;

  constructor(
    protected data: {
      uri: string;
      databaseName: string;
      collectionName: string;
    },
    private gateway: UserToDocumentGateway
  ) {}

  public async TESTS_ONLY_clear() {
    const client = await this.getClient();
    await client.db(this.data.databaseName).dropDatabase();
  }

  public async getById(id: string): Promise<User | null> {
    return await this.findOne({ _id: id });
  }

  public async getByEmail(email: string): Promise<User | null> {
    return await this.findOne({ email });
  }

  public async save(user: User) {
    const collection = await this.getCollection();
    const document = await this.gateway.fromUserToDocument(user);
    await collection.updateOne(
      { _id: document._id },
      { $set: document },
      { upsert: true }
    );
  }

  public async deleteById(id: string): Promise<{ wasDeleted: boolean }> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: id });
    return { wasDeleted: result.deletedCount === 1 };
  }

  protected async findOne(filter: mongo.Filter<UserDocument>) {
    const collection = await this.getCollection();
    const document = await collection.findOne(filter);
    if (document === undefined) return null;
    return this.gateway.fromDocumentToUser(document);
  }

  protected async getCollection() {
    const client = await this.getClient();
    const db = client.db(this.data.databaseName);
    return db.collection<UserDocument>(this.data.collectionName);
  }

  private async getClient() {
    if (this.client === undefined) {
      const client = new mongo.MongoClient(this.data.uri);
      await client.connect();
      return client;
    } else {
      return this.client;
    }
  }
}
