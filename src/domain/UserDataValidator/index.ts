import DataValidationResult from "./DataValidationResult";
import Schema from "./Schema";
import ValidationResult from "./ValidationResult";

export default class UserDataValidator<UD extends Record<string, any>> {
  constructor(private schema: Schema<UD>) {}

  private allDataKeys = Reflect.ownKeys(this.schema) as (keyof UD)[];

  public validateData(data: UD): DataValidationResult<UD> {
    const validationResults = this.allDataKeys.map((k) =>
      this.validateProperty(k, data[k])
    );
    return {
      isValid: this.computeIsValid(validationResults),
      value: this.constructCleanedData(validationResults),
      errorMessages: this.constructErrorMessages(validationResults),
    };
  }

  public validateProperty<Key extends keyof UD>(
    key: Key,
    value: UD[Key]
  ): ValidationResult<Key, UD[Key]> {
    return this.schema[key](value);
  }

  private computeIsValid(results: ValidationResult[]) {
    return results.every((r) => r.isValid);
  }

  private constructErrorMessages(results: ValidationResult[]) {
    const errorMessages = {} as any;
    for (const r of results) {
      if (!r.isValid) errorMessages[r.key] = r.errorMessages;
    }
    return errorMessages;
  }

  private constructCleanedData(results: ValidationResult[]) {
    const cleanedData = {} as any;
    for (const r of results) cleanedData[r.key] = r.value;
    return cleanedData;
  }
}

export { Schema, ValidationResult, DataValidationResult };
