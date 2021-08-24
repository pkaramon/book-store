import User from "../../../domain/User";
import UserNotifier from "../../../UserNotifier";
import EmailGateway from "../EmailGateway";
import EmailTemplate from "../EmailTemplate";

export default class UserRegisteredNotifier implements UserNotifier {
  constructor(
    private gateway: EmailGateway,
    private template: EmailTemplate,
    private subject: string
  ) {}

  async notify(user: User): Promise<void> {
    await this.gateway.sendEmail({
      to: user.info.email,
      subject: this.subject,
      content: this.template({ userInfo: user.info }),
    });
  }
}
