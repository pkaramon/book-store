import ValidationResult from "./ValidationResult";

type Schema<Data extends Record<string, any>> = {
  [key in keyof Required<Data>]: PropertyValidator<key, Data[key]>;
};

export interface PropertyValidator<
  Key extends string | number | symbol,
  Value
> {
  (value: Value): ValidationResult<Key, Value>;
}

export default Schema;
