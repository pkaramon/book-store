import Password from "../Password";
import UserInfo from "./UserInfo";

export default abstract class User {
  get password() {
    return this.info.password;
  }
  abstract readonly info: UserInfo;
  abstract changePassword(value: Password): void;
}

export { UserInfo };
