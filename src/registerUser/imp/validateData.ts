import { InputData, ValidateEmail } from "../interface";
import ErrorMessages from "./ErrorMessages";

export default function validateData(
  data: InputData,
  tools: { validateEmail: ValidateEmail; now: () => Date }
) {
  const validator = new UserRegisterDataValidator(
    data,
    tools.validateEmail,
    tools.now
  );
  validator.validate();
}

class UserRegisterDataValidator {
  private errorMessages = new ErrorMessages();
  constructor(
    private data: InputData,
    private emailValidator: ValidateEmail,
    private now: () => Date
  ) {}

  validate() {
    this.validateFirstName();
    this.validateLastName();
    this.validateEmail();
    this.validatePassword();
    this.validateBirthDate();
    if (this.errorMessages.hasAny())
      throw this.errorMessages.convertToInvalidUserRegisterData();
  }

  private validateFirstName() {
    if (this.data.firstName.length === 0)
      this.errorMessages.add("firstName", "firstName cannot be empty");
  }

  private validateLastName() {
    if (this.data.lastName.length === 0)
      this.errorMessages.add("lastName", "lastName cannot be empty");
  }

  private validateEmail() {
    if (!this.emailValidator(this.data.email))
      this.errorMessages.add("email", "email is invalid");
  }

  private validatePassword() {
    this.validatePasswordsLength();
    this.checkIfPasswordHasAtLeast1UppercaseCharacter();
    this.checkIfPasswordHasAtLeast1SpecialSymbol();
  }

  private validatePasswordsLength() {
    if (this.data.password.length < 8)
      this.errorMessages.add(
        "password",
        "password must contain at least 8 characters"
      );
  }

  private checkIfPasswordHasAtLeast1UppercaseCharacter() {
    if (this.countUpperCaseCharacters(this.data.password) < 1)
      this.errorMessages.add(
        "password",
        "password must contain at least 1 uppercase character"
      );
  }

  private countUpperCaseCharacters(str: string) {
    const withoutUpperChars = str.replace(/[A-Z]/, "");
    return str.length - withoutUpperChars.length;
  }

  private checkIfPasswordHasAtLeast1SpecialSymbol() {
    if (!this.containsAnySpecialCharacters(this.data.password))
      this.errorMessages.add(
        "password",
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
    for (const specialChar of specialCharacters) {
      if (chars.has(specialChar)) return true;
    }
    return false;
  }

  private validateBirthDate() {
    if (this.data.birthDate.getTime() > this.now().getTime())
      this.errorMessages.add("birthDate", "birthDate cannot be in the future");
  }
}
