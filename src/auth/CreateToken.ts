import User from "../domain/User";

export default interface CreateToken {
  (u: User): string;
}
