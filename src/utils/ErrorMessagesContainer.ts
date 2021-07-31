export default class ErrorMessagesContainer<
  DataStruct extends Record<string, any>
> {
  private errorMessages: Partial<Record<keyof DataStruct, string[]>> = {};

  set(key: keyof DataStruct, errorMessages: string[]) {
    this.saveErrorMessagesFor(key, errorMessages);
  }

  add(key: keyof DataStruct, errorMessage: string) {
    const errorMessages = this.getErrorMessagesFor(key);
    errorMessages.push(errorMessage);
    this.saveErrorMessagesFor(key, errorMessages);
  }

  private getErrorMessagesFor(key: keyof DataStruct): string[] {
    return this.errorMessages[key] === undefined
      ? []
      : this.errorMessages[key]!;
  }

  private saveErrorMessagesFor(key: keyof DataStruct, errorMessages: string[]) {
    this.errorMessages[key] = errorMessages;
  }

  hasAny() {
    return Reflect.ownKeys(this.errorMessages).length > 0;
  }

  getErrorMessages() {
    return this.errorMessages;
  }
}
