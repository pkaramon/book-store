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
    if (this.data.firstName !== undefined) {
      const result = this.userDataValidator.validateFirstName(
        this.data.firstName
      );
      if (result.isValid) this.user.firstName = result.value;
      else this.errorMessages.firstName = result.errorMessages;
    }
  }

  private tryToUpdateLastName() {
    if (this.data.lastName !== undefined) {
      const result = this.userDataValidator.validateLastName(
        this.data.lastName
      );
      if (result.isValid) this.user.lastName = result.value;
      else this.errorMessages.lastName = result.errorMessages;
    }
  }

  private tryToUpdateBirthDate() {
    if (this.data.birthDate !== undefined) {
      const result = this.userDataValidator.validateBirthDate(
        this.data.birthDate
      );
      if (result.isValid) this.user.birthDate = result.value;
      else this.errorMessages.birthDate = result.errorMessages;
    }
  }

  private throwInvalidEditProfileDataIfThereAreErrorMessages() {
    if (Reflect.ownKeys(this.errorMessages).length > 0) {
      throw new InvalidEditProfileData(this.errorMessages);
    }
  }
}
