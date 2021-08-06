import User from "../../domain/User";
import UserRegistrator, { ValidationResult } from "../../UserRegistrator";
import RegisterCustomer, {
  InputData,
  Dependencies,
  CouldNotCompleteRequest,
  InvalidCustomerRegisterData,
  EmailAlreadyTaken,
} from "../interface";

export default function buildRegisterCustomer({
  saveUser,
  userDataValidator,
  notifyUser,
  getUserByEmail,
  makeCustomer,
  makePassword,
}: Dependencies): RegisterCustomer {
  async function registerCustomer(data: InputData) {
    const user = await CustomerRegistrator.instance.registerUser(data);
    return { userId: user.info.id };
  }

  class CustomerRegistrator extends UserRegistrator<InputData> {
    public static instance = new CustomerRegistrator({
      saveUser,
      getUserByEmail,
      notifyUser,
      makePassword,
    });

    protected async createUser(data: InputData): Promise<User> {
      return await makeCustomer({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: await this.createPassword(data.password),
        birthDate: data.birthDate,
      });
    }

    protected validateUserData(data: InputData) {
      const res = userDataValidator.validateData(data);
      const errorMessages = this.removePropertiesWithNoErrors(
        res.errorMessages
      ) as any;
      return {
        cleaned: res.value,
        errorMessages,
        invalidProperties: Reflect.ownKeys(errorMessages) as any,
        isValid: res.isValid,
      };
    }

    private removePropertiesWithNoErrors(
      errorMessages: Record<string, string[]>
    ) {
      const result = {} as any;
      for (const key in errorMessages)
        if (errorMessages[key].length > 0) result[key] = errorMessages[key];
      return result;
    }

    protected createUnexpectedFailureError(
      message: string,
      originalError: any
    ): Error {
      throw new CouldNotCompleteRequest(message, originalError);
    }

    protected createFailedValidationError(
      result: ValidationResult<InputData>
    ): Error {
      throw new InvalidCustomerRegisterData(
        result.errorMessages,
        result.invalidProperties
      );
    }

    protected createEmailAlreadyTakenError(email: string): Error {
      return new EmailAlreadyTaken(email);
    }
  }

  return registerCustomer;
}
