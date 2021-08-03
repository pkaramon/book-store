import Password from "../Password";
import UserInfo from "./UserInfo";

export default abstract class User {
  get password() {
    return this.info.password;
  }

  abstract readonly info: UserInfo;
  abstract changeFirstName(value: string): void;
  abstract changeLastName(value: string): void;
  abstract changePassword(value: Password): void;
  abstract changeBirthDate(value: Date): void;
}

export { UserInfo };
