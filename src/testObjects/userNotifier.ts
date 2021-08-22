import User from "../domain/User";
import UserNotifier from "../UserNotifier";

class TestUserNotifier implements UserNotifier {
  private notifications: { for: User }[] = [];

  wasUserNotified(u: User) {
    return this.notifications.find((n) => n.for === u) !== undefined;
  }

  clearNotifications() {
    this.notifications = [];
  }

  async notify(u: User): Promise<void> {
    this.notifications.push({ for: u });
  }

  createFaultyNotifier() {
    const notifier = new TestUserNotifier();
    notifier.notify = async () => {
      throw new Error("notification error");
    };
    return notifier;
  }
}

const userNotifier = new TestUserNotifier();
export default userNotifier;
