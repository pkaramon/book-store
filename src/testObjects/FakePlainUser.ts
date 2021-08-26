import User, { UserInfo } from "../domain/User";
import makePassword from "./makePassword";

export default async function getFakePlainUser(
  newUserInfo?: Partial<UserInfo>
): Promise<User> {
  return new FakePlainUser({
    id: "1",
    email: "bob@mail.com",
    firstName: "bob",
    lastName: "smith",
    birthDate: new Date(2000, 1, 1),
    password: await makePassword({ password: "Pass123$", isHashed: false }),
    ...newUserInfo,
  });
}

class FakePlainUser extends User {
  constructor(private _info: UserInfo) {
    super();
  }

  get info() {
    return this._info;
  }
}
