import User from "../domain/User";

export default class InMemoryUserDb {
  private users = new Map<string, User>();

  constructor() {
    this.save = this.save.bind(this);
    this.getById = this.getById.bind(this);
    this.deleteById = this.deleteById.bind(this);
    this.getByEmail = this.getByEmail.bind(this);
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

  async getByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    return users.find((u) => u.email === email) ?? null;
  }

  clear() {
    this.users = new Map();
  }
}
