import { UserData } from "./User";
import UserDataValidator, {
  InvalidUserDataProperty,
  InvalidUserData,
} from "./User/UserDataValidatorTemp";

export default class UserDataValidatorTempImp implements UserDataValidator {
  constructor(private now: () => Date) {}

  validateUserData(d: UserData): UserData {
    const data = this.cleanData(d);
    const errors: InvalidUserDataProperty[] = [];
    this.addToErrors(() => this.validateFirstName(data.firstName), errors);
    this.addToErrors(() => this.validateLastName(data.lastName), errors);
    this.addToErrors(() => this.validateEmail(data.email), errors);
    this.addToErrors(() => this.validatePassword(data.password), errors);
    this.addToErrors(() => this.validateBirthDate(data.birthDate), errors);
    if (errors.length > 0)
      throw new InvalidUserData(this.createErrorsMessagesRecord(errors));
    else return data;
  }

  private cleanData(data: UserData): UserData {
    return {
      ...data,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      password: data.password.trim(),
    };
  }

  private createErrorsMessagesRecord(errors: InvalidUserDataProperty[]) {
    const errorMessages = {} as any;
    for (const e of errors) errorMessages[e.key] = e.errorMessage;
    return errorMessages;
  }

  private addToErrors(fn: Function, errors: InvalidUserDataProperty[]) {
    try {
      fn();
    } catch (e) {
      errors.push(e);
    }
  }

  validateFirstName(firstName: string): string {
    firstName = firstName.trim();
    if (firstName.length === 0)
      throw new InvalidUserDataProperty(
        "firstName",
        "firstName cannot be empty"
      );
    return firstName;
  }

  validateLastName(lastName: string): string {
    lastName = lastName.trim();
    if (lastName.length === 0)
      throw new InvalidUserDataProperty("lastName", "lastName cannot be empty");
    return lastName;
  }

  validateEmail(email: string) {
    email = email.trim();
    if (!UserDataValidatorTempImp.EMAIL_REGEX.test(email))
      throw new InvalidUserDataProperty("email", "email is invalid");
    return email;
  }

  private static EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  validatePassword(password: string): string {
    password = password.trim();
    const errorMessages: string[] = [];
    this.validatePasswordsLength(password, errorMessages);
    this.checkIfPasswordHasAtLeast1UppercaseCharacter(password, errorMessages);
    this.checkIfPasswordHasAtLeast1SpecialSymbol(password, errorMessages);
    if (errorMessages.length === 1)
      throw new InvalidUserDataProperty("password", errorMessages[0]);
    else if (errorMessages.length > 1)
      throw new InvalidUserDataProperty("password", errorMessages);
    return password;
  }

  private validatePasswordsLength(password: string, errorMessages: string[]) {
    if (password.length < 8)
      errorMessages.push("password must contain at least 8 characters");
  }

  private checkIfPasswordHasAtLeast1UppercaseCharacter(
    password: string,
    errorMessages: string[]
  ) {
    if (this.countUpperCaseCharacters(password) < 1)
      errorMessages.push(
        "password must contain at least 1 uppercase character"
      );
  }

  private countUpperCaseCharacters(str: string) {
    const withoutUpperChars = str.replace(/[A-Z]/, "");
    return str.length - withoutUpperChars.length;
  }

  private checkIfPasswordHasAtLeast1SpecialSymbol(
    password: string,
    errorMessages: string[]
  ) {
    if (!this.containsAnySpecialCharacters(password))
      errorMessages.push("password must contain at least 1 special character");
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

  validateBirthDate(birthDate: Date): Date {
    if (birthDate.getTime() > this.now().getTime())
      throw new InvalidUserDataProperty(
        "birthDate",
        "birthDate cannot be in the future"
      );
    return birthDate;
  }
}
