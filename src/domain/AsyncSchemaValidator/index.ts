import { MaybePromise } from "../CommentContentValidator";
import { DataValidationResult, ValidationResult } from "../SchemaValidator";
import AsyncSchema from "./AsyncSchema";

export default class AsyncSchemaValidator<
  DataStruct extends Record<string, any>
> {
  constructor(private schema: AsyncSchema<DataStruct>) {}

  private allDataKeys = Reflect.ownKeys(this.schema) as (keyof DataStruct)[];

  public async validateData(
    data: DataStruct
  ): Promise<DataValidationResult<DataStruct>> {
    const resultPromises = this.allDataKeys.map((k) =>
      this.validateProperty(k, data[k])
    );
    const results = await Promise.all(resultPromises);
    return {
      isValid: this.computeIsValid(results),
      value: this.constructCleanedData(results),
      errorMessages: this.constructErrorMessages(results),
    };
  }

  public validateProperty<Key extends keyof DataStruct>(
    key: Key,
    value: DataStruct[Key]
  ): MaybePromise<ValidationResult<Key, DataStruct[Key]>> {
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

export { AsyncSchema };
