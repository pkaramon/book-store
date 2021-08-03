import User from "./User";

export default abstract class CustomUser extends User {
  abstract changeFirstName(value: string): void;
  abstract changeLastName(value: string): void;
  abstract changeBirthDate(value: Date): void;
}
