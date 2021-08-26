export default class ErrorMessagesContainer<
  DataStruct extends Record<string, any>
> {
  private errorMessages = new Map<keyof DataStruct, string[]>();

  set(key: keyof DataStruct, errorMessages: string[]) {
    this.errorMessages.set(key, errorMessages);
  }

  hasAny() {
    return this.errorMessages.size > 0;
  }

  getErrorMessages() {
    return Object.fromEntries(this.errorMessages.entries()) as Partial<
      Record<keyof DataStruct, string[]>
    >;
  }

  getInavlidProperties() {
    return Array.from(this.errorMessages.keys());
  }
}
