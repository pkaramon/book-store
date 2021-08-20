import Admin, { AdminInfo } from "../domain/Admin";
import makePassword from "./makePassword";

export default async function getFakeAdmin(
  newAdminInfo?: Partial<AdminInfo>
): Promise<Admin> {
  return new Admin({
    id: "1",
    email: "bob@mail.com",
    firstName: "bob",
    lastName: "smith",
    birthDate: new Date(2000, 1, 1),
    password: await makePassword({ password: "Pass123$", isHashed: false }),
    ...newAdminInfo,
  });
}
