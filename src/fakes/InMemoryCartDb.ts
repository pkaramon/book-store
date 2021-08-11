import Cart from "../domain/Cart";

export default class InMemoryCartDb {
  private carts = new Map<string, Cart>();

  constructor() {
    this.getCartFor = this.getCartFor.bind(this);
    this.saveCart = this.saveCart.bind(this);
  }

  async getCartFor(customerId: string): Promise<Cart> {
    const cart =
      this.carts.get(customerId) ??
      new Cart({ bookIds: [], customerId: customerId });
    return cart;
  }

  async saveCart(cart: Cart): Promise<void> {
    this.carts.set(cart.info.customerId, cart);
  }

  clear() {
    this.carts.clear();
  }
}
