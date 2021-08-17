import Admin from "../../domain/Admin";
import MakeAdmin from "../../domain/Admin/MakeAdmin";
import BookAuthor from "../../domain/BookAuthor";
import MakeBookAuthor from "../../domain/BookAuthor/MakeBookAuthor";
import Customer from "../../domain/Customer";
import MakeCustomer from "../../domain/Customer/MakeCustomer";
import MakePassword from "../../domain/Password/MakePassword";
import User from "../../domain/User";
import { UserDocument, UserToDocumentGateway } from "./MongoUserDb";

interface CustomerDocument extends UserDocument {
  userType: "customer";
}

interface AdminDocument extends UserDocument {
  userType: "admin";
}

interface BookAuthorDocument extends UserDocument {
  userType: "bookAuthor";
  bio: string;
}

export default class UserToDocumentGatewayImp implements UserToDocumentGateway {
  constructor(
    protected tools: {
      makeCustomer: MakeCustomer;
      makeBookAuthor: MakeBookAuthor;
      makePassword: MakePassword;
      makeAdmin: MakeAdmin;
    }
  ) {}

  fromUserToDocument(user: User): UserDocument {
    const commonData = {
      _id: user.info.id,
      hashedPassword: user.password.hashedString(),
      email: user.info.email,
      firstName: user.info.firstName,
      lastName: user.info.lastName,
      birthDate: user.info.birthDate,
    };

    if (user instanceof Customer)
      return {
        ...commonData,
        userType: "customer",
      } as CustomerDocument;

    if (user instanceof BookAuthor)
      return {
        ...commonData,
        userType: "bookAuthor",
        bio: user.info.bio,
      } as BookAuthorDocument;

    if (user instanceof Admin)
      return {
        ...commonData,
        userType: "admin",
      } as AdminDocument;
    throw new Error("unknown user type");
  }

  async fromDocumentToUser(document: UserDocument): Promise<User> {
    switch (document.userType) {
      case "customer":
        return await this.fromDocumentToCustomer(document as any);
      case "bookAuthor":
        return await this.fromDocumentToBookAuthor(document as any);
      case "admin":
        return await this.fromDocumentToAdmin(document as any);
      default:
        throw new Error("unknown user type");
    }
  }

  private async fromDocumentToCustomer(doc: CustomerDocument) {
    return await this.tools.makeCustomer({
      id: doc._id,
      birthDate: doc.birthDate,
      lastName: doc.lastName,
      firstName: doc.firstName,
      email: doc.email,
      password: await this.getPasswordFromDocument(doc),
    });
  }

  private async fromDocumentToBookAuthor(doc: BookAuthorDocument) {
    return await this.tools.makeBookAuthor({
      id: doc._id,
      birthDate: doc.birthDate,
      lastName: doc.lastName,
      firstName: doc.firstName,
      email: doc.email,
      bio: doc.bio,
      password: await this.getPasswordFromDocument(doc),
    });
  }

  private async fromDocumentToAdmin(doc: AdminDocument) {
    return await this.tools.makeAdmin({
      id: doc._id,
      birthDate: doc.birthDate,
      lastName: doc.lastName,
      firstName: doc.firstName,
      email: doc.email,
      password: await this.getPasswordFromDocument(doc),
    });
  }

  private async getPasswordFromDocument(doc: UserDocument) {
    return await this.tools.makePassword({
      password: doc.hashedPassword,
      isHashed: true,
    });
  }
}
