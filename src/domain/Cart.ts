export default class Cart {
  constructor(private _info: CartInfo) {}

  get info() {
    return this._info;
  }

  getAll() {
    return this._info.bookIds;
  }

  add(bookId: string) {
    this._info.bookIds.push(bookId);
  }

  has(bookId: string) {
    return this._info.bookIds.includes(bookId);
  }

  remove(bookId: string) {
    this._info.bookIds = this._info.bookIds.filter((id) => id !== bookId);
  }

  clear() {
    this._info.bookIds = [];
  }
}

export interface CartInfo {
  customerId: string;
  bookIds: string[];
}
