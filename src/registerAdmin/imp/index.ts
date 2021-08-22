import Admin from "../../domain/Admin";
import User from "../../domain/User";
import RegisterAdmin, {
  AdminData,
  InputData,
  EmailAlreadyTaken,
  CouldNotCompleteRequest,
  InvalidSuperAdminCredentials,
  InvalidAdminData,
} from "../interface";

import Dependecies from "./Dependencies";

export default function buildRegisterAdmin({
  userDb,
  makePassword,
  adminDataValidator,
  userNotifier,
  verifySuperAdminToken,
}: Dependecies): RegisterAdmin {
  async function registerAdmin(data: InputData) {
    await checkIfEmailIsAlreadyUsed(data.adminData.email);
    await validateSuperAdminToken(data.superAdminToken);
    const adminData = validateAdminData(data.adminData);
    const admin = await tryToCreateAdmin(adminData);
    await tryToSaveUser(admin);
    await tryToNotifyUser(admin);
    return { adminId: admin.info.id };
  }

  async function checkIfEmailIsAlreadyUsed(email: string) {
    const user = await tryToGetUser(email);
    if (user !== null) throw new EmailAlreadyTaken(email);
  }

  async function tryToGetUser(email: string) {
    try {
      return await userDb.getByEmail(email);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not get user from db", e);
    }
  }

  async function validateSuperAdminToken(token: string) {
    const isValid = await verifySuperAdminToken(token);
    if (!isValid) throw new InvalidSuperAdminCredentials();
  }

  function validateAdminData(adminData: AdminData) {
    const result = adminDataValidator.validateData(adminData);
    if (!result.isValid)
      throw new InvalidAdminData(
        result.errorMessages,
        Reflect.ownKeys(result.errorMessages) as (keyof AdminData)[]
      );
    return result.value;
  }

  async function tryToCreateAdmin(adminData: AdminData) {
    try {
      return await createAdmin(adminData);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not create admin", e);
    }
  }

  async function createAdmin(adminData: AdminData) {
    return new Admin({
      id: await userDb.generateId(),
      ...adminData,
      password: await makePassword({
        password: adminData.password,
        isHashed: false,
      }),
    });
  }

  async function tryToSaveUser(u: User) {
    try {
      return await userDb.save(u);
    } catch (e) {
      throw new CouldNotCompleteRequest("could not save user to db", e);
    }
  }

  async function tryToNotifyUser(user: User) {
    try {
      await userNotifier.notify(user);
    } catch {
      // silencing errors is desired in this case
    }
  }

  return registerAdmin;
}
