import Clock from "./Clock";
import { Schema, ValidationResult } from "./SchemaValidator";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: Date;
}

export default function buildPlainUserSchema(clock: Clock): Schema<UserData> {
  return {
    firstName: validateFirstName,
    lastName: validateLastName,
    email: validateEmail,
    birthDate: (v) => validateBirthDate(clock, v),
    password: validatePassword,
  };
}

function validateFirstName(firstName: string) {
  const res = new ValidationResult("firstName", firstName.trim());
  if (res.value.length === 0) res.addErrorMessage("firstName cannot be empty");
  return res;
}

function validateLastName(lastName: string) {
  const res = new ValidationResult("lastName", lastName.trim());
  if (res.value.length === 0) res.addErrorMessage("lastName cannot be empty");
  return res;
}

function validateEmail(email: string) {
  const res = new ValidationResult("email", email.trim());
  if (!EMAIL_REGEX.test(res.value)) res.addErrorMessage("email is invalid");
  return res;
}

const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function validatePassword(password: string) {
  const res = new ValidationResult("password", password.trim());

  validatePasswordsLength(password, res);
  checkIfPasswordHasAtLeast1UppercaseCharacter(password, res);
  checkIfPasswordHasAtLeast1SpecialSymbol(password, res);

  return res;
}

function validatePasswordsLength(
  password: string,
  res: ValidationResult<"password", string>
) {
  if (password.length < 8)
    res.addErrorMessage("password must contain at least 8 characters");
}

function checkIfPasswordHasAtLeast1UppercaseCharacter(
  password: string,
  res: ValidationResult<"password", any>
) {
  if (countUpperCaseCharacters(password) < 1)
    res.addErrorMessage("password must contain at least 1 uppercase character");
}

function countUpperCaseCharacters(str: string) {
  const withoutUpperChars = str.replace(/[A-Z]/, "");
  return str.length - withoutUpperChars.length;
}

function checkIfPasswordHasAtLeast1SpecialSymbol(
  password: string,
  res: ValidationResult<"password", any>
) {
  if (!containsAnySpecialCharacters(password))
    res.addErrorMessage("password must contain at least 1 special character");
}

function containsAnySpecialCharacters(str: string) {
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

function validateBirthDate(clock: Clock, birthDate: Date) {
  const res = new ValidationResult("birthDate", birthDate);
  if (birthDate.getTime() > clock.now().getTime())
    res.addErrorMessage("birthDate cannot be in the future");
  return res;
}
