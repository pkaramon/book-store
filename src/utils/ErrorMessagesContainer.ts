export default class ErrorMessagesContainer<
  DataStruct extends Record<string, any>
> {
  private errorMessages = new Map<keyof DataStruct, string[]>();

  set(key: keyof DataStruct, errorMessages: string[]) {
    this.errorMessages.set(key, errorMessages);
  }

  add(key: keyof DataStruct, errorMessage: string) {
    const errorMessages = this.errorMessages.get(key) ?? [];
    errorMessages.push(errorMessage);
    this.errorMessages.set(key, errorMessages);
  }

  hasAny() {
    return this.errorMessages.size > 0;
  }

  getErrorMessages() {
    const errMsgs: Partial<Record<keyof DataStruct, string[]>> = {};
    for (const [k, v] of this.errorMessages.entries()) errMsgs[k] = v;
    return errMsgs;
  }

  getInavlidProperties(): (keyof DataStruct)[] {
    return Array.from(this.errorMessages.keys());
  }
}
