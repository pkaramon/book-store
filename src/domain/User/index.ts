import Password from "../Password";
import UserInfo from "./UserInfo";

export default abstract class User {
  abstract readonly info: UserInfo;

  get password() {
    return this.info.password;
  }
  abstract changePassword(value: Password): void;
}

export { UserInfo };
