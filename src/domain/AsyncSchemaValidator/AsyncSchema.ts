import {MaybePromise} from "../CommentContentValidator";
import { ValidationResult } from "../SchemaValidator";

type AsyncSchema<Data extends Record<string, any>> = {
  [key in keyof Required<Data>]: AsyncPropertyValidator<key, Data[key]>
};

export interface AsyncPropertyValidator<
  Key extends string | number | symbol,
  Value
> {
  (value: Value): MaybePromise<ValidationResult<Key, Value>>;
}
export default AsyncSchema;
