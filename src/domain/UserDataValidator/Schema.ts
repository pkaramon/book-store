import ValidationResult from "./ValidationResult";

type Schema<UD extends Record<string, any>> = {
  [key in keyof UD]: (value: UD[key]) => ValidationResult<key, UD[key]>;
};

export default Schema;
