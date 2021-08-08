export default class ValidationResult<
  Key extends string | number | symbol = any,
  Value = any
> {
  public errorMessages: string[] = [];

  constructor(public readonly key: Key, public value: Value) {}

  get isValid() {
    return this.errorMessages.length === 0;
  }

  addErrorMessage(msg: string) {
    this.errorMessages.push(msg);
  }
}
