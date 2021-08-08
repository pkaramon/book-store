export default class DidNotThrowError extends Error {
  constructor() {
    super();
    this.name = DidNotThrowError.name;
  }
}
