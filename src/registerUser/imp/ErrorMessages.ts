import { InputData, InvalidUserRegisterData } from "../interface";

export default class ErrorMessages {
  private errorMessages = new Map<keyof InputData, string | string[]>();

  add(key: keyof InputData, errorMessage: string) {
    const alreadySaved = this.errorMessages.get(key);
    if (alreadySaved === undefined) {
      this.errorMessages.set(key, errorMessage);
    } else if (typeof alreadySaved === "string") {
      this.errorMessages.set(key, [alreadySaved, errorMessage]);
    } else {
      this.errorMessages.set(key, [...alreadySaved, errorMessage]);
    }
  }

  hasAny() {
    return this.errorMessages.size > 0;
  }

  convertToInvalidUserRegisterData() {
    const errors = {} as any;
    for (const [key, errorMessage] of this.errorMessages.entries())
      errors[key] = errorMessage;
    return new InvalidUserRegisterData(errors);
  }
}
