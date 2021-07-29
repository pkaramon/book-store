export default class InMemoryDb<T extends { id: string }> {
  public items = new Map<string, T>();

  constructor() {
    this.save = this.save.bind(this);
    this.deleteById = this.deleteById.bind(this);
    this.getById = this.getById.bind(this);
    this.clear = this.clear.bind(this);
  }

  async save(item: T) {
    this.items.set(item.id, item);
  }

  async getById(itemId: string): Promise<T | null> {
    return this.items.get(itemId) ?? null;
  }

  async deleteById(itemId: string): Promise<void> {
    this.items.delete(itemId);
  }

  clear() {
    this.items = new Map();
  }
}
