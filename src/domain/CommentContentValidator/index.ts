import ErrorMessagesContainer from "../../utils/ErrorMessagesContainer";
import { CommentContent } from "../Comment";

export default abstract class CommentContentValidator {
  async validateContent(
    content: CommentContent
  ): Promise<CommentContentValidationResult> {
    const errors = new ErrorMessagesContainer<CommentContent>();

    const titleResult = await this.validateTitle(content.title);
    const bodyResult = await this.validateBody(content.body);
    const starsResult = await this.validateStars(content.stars);
    if (!titleResult.isValid) errors.set("title", titleResult.errorMessages);
    if (!bodyResult.isValid) errors.set("body", bodyResult.errorMessages);
    if (!starsResult.isValid) errors.set("stars", starsResult.errorMessages);

    const isValid = !errors.hasAny();
    return {
      isValid,
      errorMessages: errors.getErrorMessages(),
      invalidProperties: errors.getInavlidProperties(),
      content: {
        title: titleResult.value,
        body: bodyResult.value,
        stars: starsResult.value,
      },
    };
  }

  abstract validateTitle(title: string): MaybePromise<ValidationResult<string>>;
  abstract validateBody(body: string): MaybePromise<ValidationResult<string>>;
  abstract validateStars(stars: number): MaybePromise<ValidationResult<number>>;
}

export type CommentContentValidationResult = {
  isValid: boolean;
  errorMessages: Partial<Record<keyof CommentContent, string[]>>;
  invalidProperties: Array<keyof CommentContent>;
  content: CommentContent;
};

export type ValidationResult<T> = {
  isValid: boolean;
  value: T;
  errorMessages: string[];
};

export type MaybePromise<T> = T | Promise<T>;
