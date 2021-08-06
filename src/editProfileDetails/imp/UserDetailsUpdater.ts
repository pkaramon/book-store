import UserDataValidator from "../../domain/UserDataValidator";
import ErrorMessagesContainer from "../../utils/ErrorMessagesContainer";
import {
  EditProfileDetailsErrorMessages,
  InvalidEditProfileData,
  ToUpdate,
} from "../interface";
import CustomUser from "../../domain/CustomUser";
import { UserData } from "../../domain/PlainUserSchema";

export default class UserDetailsUpdater {
  public errorMessages: EditProfileDetailsErrorMessages = {};
  public container = new ErrorMessagesContainer<ToUpdate>();
  constructor(
    private user: CustomUser,
    private userDataValidator: UserDataValidator<UserData>,
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
    if (isValid) this.user.changeFirstName(value);
  }

  private tryToUpdateLastName() {
    const { isValid, value } = this.getValidationResultsFor("lastName");
    if (isValid) this.user.changeLastName(value);
  }

  private tryToUpdateBirthDate() {
    const { isValid, value } = this.getValidationResultsFor("birthDate");
    if (isValid) this.user.changeBirthDate(value);
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
