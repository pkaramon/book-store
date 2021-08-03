import RawUserData from "./RawUserData";

export default interface RawUserDataValidator {
  validateData(data: RawUserData): DataValidationResult;
  validateProperty<Key extends keyof RawUserData>(
    key: Key,
    value: RawUserData[Key]
  ): ValidationResult<Key>;
}

export interface DataValidationResult {
  isValid: boolean;
  value: RawUserData;
  errorMessages: Record<keyof RawUserData, string[]>;
}

export interface ValidationResult<Key extends keyof RawUserData> {
  isValid: boolean;
  errorMessages: string[];
  value: RawUserData[Key];
  key: Key;
}

export { RawUserData };
