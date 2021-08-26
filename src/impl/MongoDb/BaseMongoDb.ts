import * as mongo from "mongodb";

export interface MongoConnectionInfo {
  uri: string;
  databaseName: string;
  collectionName: string;
}

export default abstract class BaseMongoDb<Doc> {
  private client?: mongo.MongoClient;

  constructor(private connectionInfo: MongoConnectionInfo) {}

  public async closeCollection() {
    const client = await this.getClient();
    await client.close();
  }

  public async TEST_ONLY_clear() {
    const collection = await this.getCollection();
    await collection.deleteMany({});
  }

  protected async getCollection() {
    const client = await this.getClient();
    const db = client.db(this.connectionInfo.databaseName);
    return db.collection<Doc>(this.connectionInfo.collectionName);
  }

  private async getClient() {
    if (this.client === undefined) {
      const client = new mongo.MongoClient(this.connectionInfo.uri);
      this.client = await client.connect();
      this.afterConnecting && (await this.afterConnecting());
    }
    return this.client;
  }

  protected afterConnecting(): void | Promise<void> {}
}
