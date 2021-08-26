import * as mongo from "mongodb";
import MakePassword from "../../../domain/Password/MakePassword";
import User from "../../../domain/User";
import BaseMongoDb, { MongoConnectionInfo } from "../BaseMongoDb";
import generateId from "../generateId";
import UserDocument from "./UserDocument";
import UserToDocumentGateway from "./UserToDocumentGateway";
import UserToDocumentGatewayImp from "./UserToDocumentGatewayImp";

export default class MongoUserDb extends BaseMongoDb<UserDocument> {
  private gateway: UserToDocumentGateway;

  constructor(connectionInfo: MongoConnectionInfo, makePassword: MakePassword) {
    super(connectionInfo);
    this.gateway = new UserToDocumentGatewayImp({
      makePassword,
      generateId,
    });
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

  private async findOne(filter: mongo.Filter<UserDocument>) {
    const collection = await this.getCollection();
    const document = await collection.findOne(filter);
    if (document === undefined) return null;
    return this.gateway.fromDocumentToUser(document);
  }
}
