export default interface EmailGateway {
  sendEmail(data: SendEmailInfo): Promise<void>;
}

export interface SendEmailInfo {
  to: string;
  subject: string;
  content: string;
}
