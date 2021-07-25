import { UserData } from ".";

export default interface UserDataValidator {
  validateUserData(data: UserData): UserDataValidationResult;
  validateFirstName(firstName: string): ValidationResult<"firstName">;
  validateLastName(lastName: string): ValidationResult<"lastName">;
  validateEmail(email: string): ValidationResult<"email">;
  validatePassword(password: string): ValidationResult<"password">;
  validateBirthDate(birthDate: Date): ValidationResult<"birthDate">;
}

export interface UserDataValidationResult {
  isValid: boolean;
  value: UserData;
  errorMessages: Record<keyof UserData, string[]>;
}

export type ValidationResult<Key extends keyof UserData> = {
  isValid: boolean;
  errorMessages: string[];
  value: UserData[Key];
  key: Key;
};
