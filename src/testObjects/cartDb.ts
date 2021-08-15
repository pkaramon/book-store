import Cart from "../domain/Cart";

interface CartDb {
  getCartFor(customerId: string): Promise<Cart>;
  save(cart: Cart): Promise<void>;
  TEST_ONLY_clear(): Promise<void>;
}

class InMemoryCartDb {
  private carts = new Map<string, Cart>();

  constructor() {
    this.getCartFor = this.getCartFor.bind(this);
    this.save = this.save.bind(this);
  }

  async getCartFor(customerId: string): Promise<Cart> {
    const cart =
      this.carts.get(customerId) ??
      new Cart({ bookIds: [], customerId: customerId });
    return cart;
  }

  async save(cart: Cart): Promise<void> {
    this.carts.set(cart.info.customerId, cart);
  }

  async TEST_ONLY_clear() {
    this.carts.clear();
  }
}

const cartDb: CartDb = new InMemoryCartDb();
export default cartDb;
