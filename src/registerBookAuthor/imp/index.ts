import UserRegistrator, { ValidationResult } from "../../UserRegistrator";
import RegisterBookAuthor, {
  InputData,
  CouldNotCompleteRequest,
  InvalidBookAuthorRegisterData,
  EmailAlreadyTaken,
} from "../interface";
import Dependencies from "./Dependencies";

export default function buildRegisterBookAuthor(
  deps: Dependencies
): RegisterBookAuthor {
  async function registerBookAuthor(data: InputData) {
    const user = await BookAuthorRegistrator.instance.registerUser(data);
    return { userId: user.info.id };
  }

  class BookAuthorRegistrator extends UserRegistrator<InputData> {
    public static instance = new BookAuthorRegistrator(deps);

    protected validateUserData(data: InputData) {
      const result = deps.userDataValidator.validateData(data);
      return {
        cleaned: result.value,
        isValid: result.isValid,
        errorMessages: result.errorMessages,
        invalidProperties: Reflect.ownKeys(result.errorMessages) as any,
      };
    }

    protected async createUser(data: InputData) {
      return await deps.makeBookAuthor({
        ...data,
        password: await this.createPassword(data.password),
      });
    }

    protected createUnexpectedFailureError(
      message: string,
      originalError: any
    ) {
      return new CouldNotCompleteRequest(message, originalError);
    }

    protected createFailedValidationError(result: ValidationResult<InputData>) {
      return new InvalidBookAuthorRegisterData(
        result.errorMessages,
        result.invalidProperties
      );
    }

    protected createEmailAlreadyTakenError(email: string) {
      return new EmailAlreadyTaken(email);
    }
  }

  return registerBookAuthor;
}
