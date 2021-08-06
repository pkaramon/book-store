import UserDataValidator, { ValidationResult } from "./UserDataValidator";
import { RawUserData } from "./UserDataValidator";

export default class PlainUserDataValidator extends UserDataValidator {
  constructor(private now: () => Date) {
    super();
  }

  protected getAllKeysFromData(): (keyof RawUserData)[] {
    return ["firstName", "lastName", "email", "password", "birthDate"];
  }

  validateProperty<Key extends keyof RawUserData>(
    key: Key,
    value: RawUserData[Key]
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

  private validateFirstName(firstName: string): ValidationResult<"firstName"> {
    const res = new ValidationResult("firstName", firstName.trim());
    if (res.value.length === 0)
      res.addErrorMessage("firstName cannot be empty");
    return res;
  }

  private validateLastName(lastName: string): ValidationResult<"lastName"> {
    const res = new ValidationResult("lastName", lastName.trim());
    if (res.value.length === 0) res.addErrorMessage("lastName cannot be empty");
    return res;
  }

  private validateEmail(email: string): ValidationResult<"email"> {
    const res = new ValidationResult("email", email.trim());
    if (!PlainUserDataValidator.EMAIL_REGEX.test(res.value))
      res.addErrorMessage("email is invalid");
    return res;
  }

  private static EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  private validatePassword(password: string): ValidationResult<"password"> {
    const res = new ValidationResult("password", password.trim());

    this.validatePasswordsLength(password, res);
    this.checkIfPasswordHasAtLeast1UppercaseCharacter(password, res);
    this.checkIfPasswordHasAtLeast1SpecialSymbol(password, res);

    return res;
  }

  private validatePasswordsLength(
    password: string,
    res: ValidationResult<"password">
  ) {
    if (password.length < 8)
      res.addErrorMessage("password must contain at least 8 characters");
  }

  private checkIfPasswordHasAtLeast1UppercaseCharacter(
    password: string,
    res: ValidationResult<"password">
  ) {
    if (this.countUpperCaseCharacters(password) < 1)
      res.addErrorMessage(
        "password must contain at least 1 uppercase character"
      );
  }

  private countUpperCaseCharacters(str: string) {
    const withoutUpperChars = str.replace(/[A-Z]/, "");
    return str.length - withoutUpperChars.length;
  }

  private checkIfPasswordHasAtLeast1SpecialSymbol(
    password: string,
    res: ValidationResult<"password">
  ) {
    if (!this.containsAnySpecialCharacters(password))
      res.addErrorMessage("password must contain at least 1 special character");
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
    const res = new ValidationResult("birthDate", birthDate);
    if (birthDate.getTime() > this.now().getTime())
      res.addErrorMessage("birthDate cannot be in the future");
    return res;
  }
}
