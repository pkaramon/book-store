import EmailGateway, { SendEmailInfo } from "./EmailGateway";
import nodemailer from "nodemailer";

export interface EmailServerInfo {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
}

export default class NodemailerEmailGateway implements EmailGateway {
  private transporter: nodemailer.Transporter;

  constructor(serverInfo: EmailServerInfo) {
    this.transporter = nodemailer.createTransport(serverInfo);
  }

  async sendEmail(data: SendEmailInfo): Promise<void> {
    await this.transporter.sendMail({
      to: data.to,
      subject: data.subject,
      html: data.content,
    });
  }
}
