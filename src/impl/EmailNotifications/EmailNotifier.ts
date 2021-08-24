import UserNotifier from "../../UserNotifier";
import nodemailer from "nodemailer";
import User from "../../domain/User";
import Book from "../../domain/Book";

export interface EmailServerInfo {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
}

export default abstract class GeneralEmailNotifier {
  static templates: Map<string, (context: any) => string>;
  static serverInfo: EmailServerInfo;
  static transporter: nodemailer.Transporter;
  static connect() {
    this.transporter = nodemailer.createTransport(
      GeneralEmailNotifier.serverInfo
    );
  }

  protected template = GeneralEmailNotifier.templates.get(this.templateName)!;
  constructor(protected subject: string, protected templateName: string) {}

  protected async sendEmailTo(to: string, content: string) {
    await GeneralEmailNotifier.transporter.sendMail({
      to,
      subject: this.subject,
      html: content,
    });
  }

  abstract notify(...args: any[]): Promise<void>;
}

export class NotifierAboutBookDeletion extends GeneralEmailNotifier {
  async notify(user: User, deletedBook: Book): Promise<void> {
    this.sendEmailTo(
      user.info.email,
      this.template({ user: user.info, book: deletedBook.info })
    );
  }
}
