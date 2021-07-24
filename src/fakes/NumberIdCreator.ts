export default class NumberIdCreator {
  private i = 0;
  constructor() {
    this.create = this.create.bind(this);
    this.lastCreated = this.lastCreated.bind(this);
  }

  create() {
    this.i++;
    return this.i.toString();
  }

  lastCreated() {
    return this.i.toString();
  }

  reset() {
    this.i = 0;
  }
}
