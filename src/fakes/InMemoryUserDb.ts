import User from "../domain/User";
import InMemoryDb from "./InMemoryDb";

export default class InMemoryUserDb extends InMemoryDb<User> {
  constructor() {
    super();
    this.getByEmail = this.getByEmail.bind(this);
  }

  async getByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.items.values());
    return users.find((u) => u.info.email === email) ?? null;
  }

  protected getId(item: User): string {
    return item.info.id;
  }
}
