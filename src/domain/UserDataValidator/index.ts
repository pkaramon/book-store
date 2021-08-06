import UserData from "./UserData";

export default abstract class UserDataValidator {
  validateData(data: UserData): DataValidationResult {
    const validationResults = this.getAllKeysFromData().map((k) =>
      this.validateProperty(k, data[k])
    );
    return {
      isValid: this.computeIsValid(validationResults),
      value: this.constructCleanedData(validationResults),
      errorMessages: this.constructErrorMessages(validationResults),
    };
  }

  protected abstract getAllKeysFromData(): (keyof UserData)[];

  abstract validateProperty<Key extends keyof UserData>(
    key: Key,
    value: UserData[Key]
  ): ValidationResult<Key>;

  private computeIsValid(results: ValidationResult<any>[]) {
    return results.every((r) => r.isValid);
  }

  private constructErrorMessages(results: ValidationResult<any>[]) {
    const errorMessages = {} as any;
    for (const r of results) errorMessages[r.key] = r.errorMessages;
    return errorMessages;
  }

  private constructCleanedData(results: ValidationResult<any>[]) {
    const cleanedData = {} as any;
    for (const r of results) cleanedData[r.key] = r.value;
    return cleanedData;
  }
}

export interface DataValidationResult {
  isValid: boolean;
  value: UserData;
  errorMessages: Record<keyof UserData, string[]>;
}

export class ValidationResult<Key extends keyof UserData> {
  public errorMessages: string[] = [];

  constructor(public readonly key: Key, public value: UserData[Key]) {}

  get isValid() {
    return this.errorMessages.length === 0;
  }

  addErrorMessage(msg: string) {
    this.errorMessages.push(msg);
  }
}

export { UserData as RawUserData };
