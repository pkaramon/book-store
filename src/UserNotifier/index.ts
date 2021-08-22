import User from "../domain/User";

export default interface UserNotifier {
  notify(u: User): Promise<void>;
}
