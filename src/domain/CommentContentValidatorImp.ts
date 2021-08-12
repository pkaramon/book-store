import CommentContentValidator, {
  ValidationResult,
} from "./CommentContentValidator";

export default class CommentContentValidatorImp extends CommentContentValidator {
  validateTitle(title: string): ValidationResult<string> {
    title = title.trim();
    const helper = new ValidationHelper(title);
    if (title.length === 0) helper.addErrorMessage("title cannot be empty");
    return helper.toValidationResult();
  }

  validateBody(body: string): ValidationResult<string> {
    body = body.trim();
    const helper = new ValidationHelper(body);
    if (body.length === 0) helper.addErrorMessage("body cannot be empty");
    return helper.toValidationResult();
  }

  private static STARS = new Set([1, 2, 3, 4, 5]);
  validateStars(stars: number): ValidationResult<number> {
    const helper = new ValidationHelper(stars);
    if (!CommentContentValidatorImp.STARS.has(stars))
      helper.addErrorMessage("stars must be an integer between 1 and 5");
    return helper.toValidationResult();
  }
}

class ValidationHelper<T> {
  private errorMessages: string[] = [];
  constructor(private value: T) {}

  addErrorMessage(em: string) {
    this.errorMessages.push(em);
  }

  toValidationResult() {
    return {
      isValid: this.errorMessages.length === 0,
      errorMessages: this.errorMessages,
      value: this.value,
    };
  }
}
