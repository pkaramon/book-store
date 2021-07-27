import User from "../../domain/User";
import UserDataValidator from "../../domain/User/UserDataValidator";
import {
  EditProfileDetailsErrorMessages,
  EditProfileInputData,
  InvalidEditProfileData,
} from "../interface";

export default class UserDetailsUpdater {
  public errorMessages: EditProfileDetailsErrorMessages = {};
  constructor(
    private user: User,
    private userDataValidator: UserDataValidator,
    private data: EditProfileInputData
  ) {}

  update() {
    this.tryToUpdateFirstName();
    this.tryToUpdateLastName();
    this.tryToUpdateBirthDate();
    this.throwInvalidEditProfileDataIfThereAreErrorMessages();
  }

  private tryToUpdateFirstName() {
    const { isValid, value } = this.getValidationResultsFor("firstName");
    if (isValid) this.user.firstName = value;
  }

  private tryToUpdateLastName() {
    const { isValid, value } = this.getValidationResultsFor("lastName");
    if (isValid) this.user.lastName = value;
  }

  private tryToUpdateBirthDate() {
    const { isValid, value } = this.getValidationResultsFor("birthDate");
    if (isValid) this.user.birthDate = value;
  }

  private getValidationResultsFor<
    Key extends "firstName" | "lastName" | "birthDate"
  >(key: Key) {
    const { isValid, value, errorMessages } =
      this.data[key] === undefined
        ? { isValid: false, errorMessages: [], value: undefined }
        : this.userDataValidator.validateProperty(key, this.data[key] as any);

    if (errorMessages.length > 0) this.errorMessages[key] = errorMessages;

    return { isValid, value: value! };
  }

  private throwInvalidEditProfileDataIfThereAreErrorMessages() {
    if (Reflect.ownKeys(this.errorMessages).length > 0) {
      throw new InvalidEditProfileData(this.errorMessages);
    }
  }
}
