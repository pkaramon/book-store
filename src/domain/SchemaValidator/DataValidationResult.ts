export default interface DataValidationResult<
  Data extends Record<string, any>
> {
  isValid: boolean;
  value: Data;
  errorMessages: Partial<Record<keyof Data, string[]>>;
}
