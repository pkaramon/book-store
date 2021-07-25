import User from "../domain/User";

export default class InMemoryUserDb {
  private users = new Map<string, User>();

  constructor() {
    this.save = this.save.bind(this);
    this.getById = this.getById.bind(this);
    this.deleteById = this.deleteById.bind(this);
    this.clear = this.clear.bind(this);
  }

  async save(u: User): Promise<void> {
    this.users.set(u.id, u);
  }

  async getById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async deleteById(id: string) {
    this.users.delete(id);
  }

  clear() {
    this.users = new Map();
  }
}
