import { UserData } from "./User";
import UserDataValidator, {
  UserDataValidationResult,
  ValidationResult,
} from "./User/UserDataValidator";

export default class UserDataValidatorImp implements UserDataValidator {
  constructor(private now: () => Date) {}

  validateUserData(data: UserData): UserDataValidationResult {
    const validationResults = [
      this.validateProperty("firstName", data.firstName),
      this.validateProperty("lastName", data.lastName),
      this.validateProperty("email", data.email),
      this.validateProperty("password", data.password),
      this.validateProperty("birthDate", data.birthDate),
    ];

    return {
      isValid: this.computeIsValid(validationResults),
      value: this.constructCleanedData(validationResults),
      errorMessages: this.constructErrorMessages(validationResults),
    };
  }

  validateProperty<Key extends keyof UserData>(
    key: Key,
    value: UserData[Key]
  ): ValidationResult<Key> {
    switch (key) {
      case "firstName":
        return this.validateFirstName(value as string) as any;
      case "lastName":
        return this.validateLastName(value as string) as any;
      case "email":
        return this.validateEmail(value as string) as any;
      case "password":
        return this.validatePassword(value as string) as any;
      case "birthDate":
        return this.validateBirthDate(value as Date) as any;
      default:
        throw new Error(`UNKNOWN PROPERTY: ${key}=${value}`);
    }
  }

  private computeIsValid(results: ValidationResult<any>[]) {
    return results.every((r) => r.isValid);
  }

  private constructErrorMessages(results: ValidationResult<any>[]) {
    const errorMessages = {} as any;
    for (const r of results) errorMessages[r.key] = r.errorMessages;
    return errorMessages;
  }

  private constructCleanedData(results: ValidationResult<any>[]) {
    const cleanedData = {} as any;
    for (const r of results) cleanedData[r.key] = r.value;
    return cleanedData;
  }

  private validateFirstName(firstName: string): ValidationResult<"firstName"> {
    const data = new ValidationData("firstName", firstName.trim());
    if (data.value.length === 0)
      data.addErrorMessage("firstName cannot be empty");
    return data.toValidationResult();
  }

  private validateLastName(lastName: string): ValidationResult<"lastName"> {
    const data = new ValidationData("lastName", lastName.trim());
    if (data.value.length === 0)
      data.addErrorMessage("lastName cannot be empty");
    return data.toValidationResult();
  }

  private validateEmail(email: string): ValidationResult<"email"> {
    const data = new ValidationData("email", email.trim());
    if (!UserDataValidatorImp.EMAIL_REGEX.test(data.value))
      data.addErrorMessage("email is invalid");
    return data.toValidationResult();
  }

  private static EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  private validatePassword(password: string): ValidationResult<"password"> {
    const data = new ValidationData("password", password.trim());

    this.validatePasswordsLength(password, data);
    this.checkIfPasswordHasAtLeast1UppercaseCharacter(password, data);
    this.checkIfPasswordHasAtLeast1SpecialSymbol(password, data);

    return data.toValidationResult();
  }

  private validatePasswordsLength(
    password: string,
    data: ValidationData<"password">
  ) {
    if (password.length < 8)
      data.addErrorMessage("password must contain at least 8 characters");
  }

  private checkIfPasswordHasAtLeast1UppercaseCharacter(
    password: string,
    data: ValidationData<"password">
  ) {
    if (this.countUpperCaseCharacters(password) < 1)
      data.addErrorMessage(
        "password must contain at least 1 uppercase character"
      );
  }

  private countUpperCaseCharacters(str: string) {
    const withoutUpperChars = str.replace(/[A-Z]/, "");
    return str.length - withoutUpperChars.length;
  }

  private checkIfPasswordHasAtLeast1SpecialSymbol(
    password: string,
    data: ValidationData<"password">
  ) {
    if (!this.containsAnySpecialCharacters(password))
      data.addErrorMessage(
        "password must contain at least 1 special character"
      );
  }

  private containsAnySpecialCharacters(str: string) {
    const specialCharacters = [
      "!",
      "@",
      "#",
      "$",
      "%",
      "^",
      "&",
      "*",
      "(",
      ")",
      "[",
      "]",
      "{",
      "}",
      ";",
      ":",
      "'",
      '"',
      "'",
      "\\",
      "|",
      "<",
      ">",
      ",",
      ".",
      "/",
      "?",
      "`",
      "~",
      "-",
      "=",
      "+",
      "_",
    ];

    const chars = new Set(str);
    for (const specialChar of specialCharacters)
      if (chars.has(specialChar)) return true;
    return false;
  }

  private validateBirthDate(birthDate: Date): ValidationResult<"birthDate"> {
    const data = new ValidationData("birthDate", birthDate);
    if (birthDate.getTime() > this.now().getTime())
      data.addErrorMessage("birthDate cannot be in the future");
    return data.toValidationResult();
  }
}

class ValidationData<Key extends keyof UserData> {
  public errorMessages: string[] = [];

  constructor(public key: Key, public value: UserData[Key]) {}

  addErrorMessage(msg: string) {
    this.errorMessages.push(msg);
  }

  toValidationResult(): ValidationResult<Key> {
    return {
      isValid: this.errorMessages.length === 0,
      errorMessages: this.errorMessages,
      key: this.key,
      value: this.value,
    };
  }
}
