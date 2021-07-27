import { UserData } from ".";

export default interface UserDataValidator {
  validateUserData(data: UserData): UserDataValidationResult;
  validateProperty<Key extends keyof UserData>(
    key: Key,
    value: UserData[Key]
  ): ValidationResult<Key>;
}

export interface UserDataValidationResult {
  isValid: boolean;
  value: UserData;
  errorMessages: Record<keyof UserData, string[]>;
}

export interface ValidationResult<Key extends keyof UserData> {
  isValid: boolean;
  errorMessages: string[];
  value: UserData[Key];
  key: Key;
}
