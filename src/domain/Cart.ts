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
}

export interface CartInfo {
  customerId: string;
  bookIds: string[];
}
