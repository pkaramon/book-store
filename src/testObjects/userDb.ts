import User from "../domain/User";
import InMemoryDb from "./InMemoryDb";

interface UserDb {
  save(u: User): Promise<void>;
  getById(id: string): Promise<User | null>;
  getByEmail(id: string): Promise<User | null>;
  deleteById(id: string): Promise<void>;
  TEST_ONLY_clear(): Promise<void>;
}

class InMemoryUserDb extends InMemoryDb<User> implements UserDb {
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

const userDb: UserDb = new InMemoryUserDb();
export default userDb;
