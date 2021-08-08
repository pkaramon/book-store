import DataValidationResult from "./DataValidationResult";
import Schema from "./Schema";
import ValidationResult from "./ValidationResult";

export default class SchemaValidator<DataStruct extends Record<string, any>> {
  constructor(private schema: Schema<DataStruct>) {}

  private allDataKeys = Reflect.ownKeys(this.schema) as (keyof DataStruct)[];

  public validateData(data: DataStruct): DataValidationResult<DataStruct> {
    const validationResults = this.allDataKeys.map((k) =>
      this.validateProperty(k, data[k])
    );
    return {
      isValid: this.computeIsValid(validationResults),
      value: this.constructCleanedData(validationResults),
      errorMessages: this.constructErrorMessages(validationResults),
    };
  }

  public validateProperty<Key extends keyof DataStruct>(
    key: Key,
    value: DataStruct[Key]
  ): ValidationResult<Key, DataStruct[Key]> {
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
