import Admin from "../domain/Admin";
import MakePassword from "../domain/Password/MakePassword";
import SchemaValidator from "../domain/SchemaValidator";
import User from "../domain/User";
import RegisterAdmin, {
  AdminData,
  CouldNotCompleteRequest,
  EmailAlreadyTaken,
  InputData,
  InvalidAdminData,
  InvalidSuperAdminCredentials,
} from "./interface";

export interface Dependecies {
  verifySuperAdminToken: (token: string) => boolean | Promise<boolean>;
  makePassword: MakePassword;
  userDb: UserDb;
  notifyUser: (u: User) => Promise<void>;
  adminDataValidator: SchemaValidator<AdminData>;
}

export interface UserDb {
  save(u: User): Promise<void>;
  getByEmail(email: string): Promise<User | null>;
  generateId(): Promise<string> | string;
}

export default function buildRegisterAdmin({
  userDb,
  makePassword,
  adminDataValidator,
  notifyUser,
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
      await notifyUser(user);
    } catch {
      // silencing errors is desired in this case
    }
  }

  return registerAdmin;
}
