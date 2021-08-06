export default interface ValidationResult<UserData> {
  isValid: boolean;
  cleaned: UserData;
  errorMessages: ErrorMessages<UserData>;
  invalidProperties: (keyof UserData)[];
}

export type ErrorMessages<UserData> = Partial<Record<keyof UserData, string[]>>;
