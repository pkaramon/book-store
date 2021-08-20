import User from "../domain/User";
import InMemoryDb from "./InMemoryDb";
import crypto from "crypto";

interface UserDb {
  save(u: User): Promise<void>;
  getById(id: string): Promise<User | null>;
  getByEmail(id: string): Promise<User | null>;
  deleteById(id: string): Promise<{ wasDeleted: boolean }>;
  generateId(): Promise<string> | string;
  TEST_ONLY_clear(): Promise<void>;
}

class InMemoryUserDb extends InMemoryDb<User> implements UserDb {
  constructor() {
    super();
  }

  generateId(): string | Promise<string> {
    return crypto.randomUUID();
  }

  async getByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.items.values());
    return users.find((u) => u.info.email === email) ?? null;
  }

  protected getId(item: User): string {
    return item.info.id;
  }
}

class UserDbForTest implements UserDb {
  constructor(private userDb: UserDb) {}
  getByEmail = this.userDb.getByEmail.bind(this.userDb);
  getById = this.userDb.getById.bind(this.userDb);
  save = this.userDb.save.bind(this.userDb);
  deleteById = this.userDb.deleteById.bind(this.userDb);
  TEST_ONLY_clear = this.userDb.TEST_ONLY_clear.bind(this.userDb);
  generateId = this.userDb.generateId.bind(this.userDb);
}

const userDb: UserDb = new UserDbForTest(new InMemoryUserDb());

export default userDb;
