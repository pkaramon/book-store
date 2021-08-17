export default abstract class InMemoryDb<T> {
  public items = new Map<string, T>();

  constructor() {
    this.save = this.save.bind(this);
    this.deleteById = this.deleteById.bind(this);
    this.getById = this.getById.bind(this);
    this.TEST_ONLY_clear = this.TEST_ONLY_clear.bind(this);
  }

  async save(item: T) {
    this.items.set(this.getId(item), item);
  }

  async getById(itemId: string): Promise<T | null> {
    return this.items.get(itemId) ?? null;
  }

  async deleteById(itemId: string): Promise<{ wasDeleted: boolean }> {
    const wasDeleted = this.items.delete(itemId);
    return { wasDeleted };
  }

  protected abstract getId(item: T): string;

  async TEST_ONLY_clear() {
    this.items = new Map();
  }
}
