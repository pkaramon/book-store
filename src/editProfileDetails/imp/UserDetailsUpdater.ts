import User from "../../domain/User";
import UserDataValidator from "../../domain/User/UserDataValidator";
import ErrorMessagesContainer from "../../utils/ErrorMessagesContainer";
import {
  EditProfileDetailsErrorMessages,
  InvalidEditProfileData,
  ToUpdate,
} from "../interface";

export default class UserDetailsUpdater {
  public errorMessages: EditProfileDetailsErrorMessages = {};
  public container = new ErrorMessagesContainer<ToUpdate>();
  constructor(
    private user: User,
    private userDataValidator: UserDataValidator,
    private data: ToUpdate
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

    if (errorMessages.length > 0) this.container.set(key, errorMessages);
    return { isValid, value: value! };
  }

  private throwInvalidEditProfileDataIfThereAreErrorMessages() {
    if (this.container.hasAny())
      throw new InvalidEditProfileData(this.container.getErrorMessages());
  }
}
