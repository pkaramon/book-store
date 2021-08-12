import Password from "../domain/Password";
import User from "../domain/User";
import Tools from "./Tools";
import ValidationResult, { ErrorMessages } from "./ValidationResult";

export { ValidationResult, ErrorMessages };

export default abstract class UserRegistrator<
  UserData extends { email: string }
> {
  constructor(private tools: Tools) {}

  async registerUser(data: UserData) {
    await this.checkIfEmailIsAlreadyTaken(data.email);
    const result = this.validateUserData(data);
    if (!result.isValid) throw this.createFailedValidationError(result);
    const user = await this.createUser(result.cleaned);
    await this.save(user);
    await this.tryToNotifyUser(user);
    return user;
  }

  private async checkIfEmailIsAlreadyTaken(email: string) {
    const user = await this.tryToGetUserByEmail(email);
    if (user !== null) throw this.createEmailAlreadyTakenError(email);
  }

  private async tryToGetUserByEmail(email: string) {
    try {
      return await this.tools.getUserByEmail(email);
    } catch (e) {
      throw this.createUnexpectedFailureError("could not get user by email", e);
    }
  }

  private async save(u: User) {
    try {
      await this.tools.saveUser(u);
    } catch (e) {
      throw this.createUnexpectedFailureError("could not save user", e);
    }
  }

  private async tryToNotifyUser(u: User) {
    try {
      await this.tools.notifyUser(u);
    } catch {
      // silencing errors is desired in this case
    }
  }

  protected async createPassword(password: string): Promise<Password> {
    try {
      return await this.tools.makePassword({ password, isHashed: false });
    } catch (e) {
      throw this.createUnexpectedFailureError("could not hash password", e);
    }
  }

  protected abstract createUser(data: UserData): Promise<User> | User;
  protected abstract validateUserData(
    data: UserData
  ): ValidationResult<UserData>;
  protected abstract createUnexpectedFailureError(
    message: string,
    originalError: any
  ): Error;
  protected abstract createFailedValidationError(
    result: ValidationResult<UserData>
  ): Error;
  protected abstract createEmailAlreadyTakenError(email: string): Error;
}
