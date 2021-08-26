import Admin from "../../../domain/Admin";
import BookAuthor from "../../../domain/BookAuthor";
import Customer from "../../../domain/Customer";
import MakePassword from "../../../domain/Password/MakePassword";
import User from "../../../domain/User";
import UserDocument from "./UserDocument";
import UserToDocumentGateway from "./UserToDocumentGateway";

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
      makePassword: MakePassword;
      generateId: () => string | Promise<string>;
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
        return this.fromDocumentToCustomer(document as any);
      case "bookAuthor":
        return await this.fromDocumentToBookAuthor(document as any);
      case "admin":
        return await this.fromDocumentToAdmin(document as any);
      default:
        throw new Error("unknown user type");
    }
  }

  private async fromDocumentToCustomer(doc: CustomerDocument) {
    return new Customer({
      id: doc._id,
      birthDate: doc.birthDate,
      lastName: doc.lastName,
      firstName: doc.firstName,
      email: doc.email,
      password: await this.getPasswordFromDocument(doc),
    });
  }

  private async fromDocumentToBookAuthor(doc: BookAuthorDocument) {
    return new BookAuthor({
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
    return new Admin({
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
