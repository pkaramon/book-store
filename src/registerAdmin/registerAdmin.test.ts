import Admin from "../domain/Admin";
import buildPlainUserSchema from "../domain/PlainUserSchema";
import SchemaValidator from "../domain/SchemaValidator";
import clock from "../testObjects/clock";
import makePassword from "../testObjects/makePassword";
import superAdminTokenManager from "../testObjects/superAdminTokenManager";
import userDb from "../testObjects/userDb";
import {
  checkIfItHandlesUnexpectedFailures,
  expectThrownErrorToMatch,
} from "../__test_helpers__";
import buildRegisterAdmin from "./imp";
import {
  AdminData,
  CouldNotCompleteRequest,
  EmailAlreadyTaken,
  InvalidAdminData,
  InvalidSuperAdminCredentials,
} from "./interface";

const notifyUser = jest.fn().mockResolvedValue(undefined);
const dependencies = {
  verifySuperAdminToken: (token: string) => {
    return superAdminTokenManager.verify(token);
  },
  makePassword: makePassword,
  userDb,
  adminDataValidator: new SchemaValidator(buildPlainUserSchema(clock)),
  notifyUser,
};
const registerAdmin = buildRegisterAdmin(dependencies);

const adminData: AdminData = {
  firstName: "bob",
  lastName: "smith",
  email: "bob@mail.com",
  password: "Pass123$",
  birthDate: new Date(2000, 1, 1),
};

let superAdminToken: string;
beforeAll(async () => {
  superAdminToken = await superAdminTokenManager.create();
});
beforeEach(async () => {
  await userDb.TEST_ONLY_clear();
});

test("super admin token is invalid", async () => {
  await expectThrownErrorToMatch(
    () => registerAdmin({ superAdminToken: "invalid", adminData }),
    { class: InvalidSuperAdminCredentials }
  );
});

test("adminData validation", async () => {
  await expectThrownErrorToMatch(
    async () =>
      registerAdmin({
        superAdminToken,
        adminData: {
          ...adminData,
          firstName: "  ",
          lastName: " ",
          email: "blablabal",
        },
      }),
    {
      class: InvalidAdminData,
      invalidProperties: expect.arrayContaining([
        "email",
        "firstName",
        "lastName",
      ]),
      errorMessages: {
        email: ["email is invalid"],
        lastName: ["lastName cannot be empty"],
        firstName: ["firstName cannot be empty"],
      },
    }
  );
});

test("saving admin to db", async () => {
  const { adminId } = await registerAdmin({ superAdminToken, adminData });
  const admin = (await userDb.getById(adminId)) as Admin;
  expect(admin).not.toBeNull();
  expect(await admin.password.isEqual(adminData.password)).toBe(true);
  expect(admin.info.firstName).toEqual(adminData.firstName);
  expect(admin.info.lastName).toEqual(adminData.lastName);
  expect(admin.info.email).toEqual(adminData.email);
  expect(admin.info.birthDate).toEqual(adminData.birthDate);
});

test("email must be unique", async () => {
  await registerAdmin({ superAdminToken, adminData });
  await expectThrownErrorToMatch(
    () => registerAdmin({ superAdminToken, adminData }),
    { class: EmailAlreadyTaken, email: adminData.email }
  );
});

test("notifing admin about the registration", async () => {
  const { adminId } = await registerAdmin({ superAdminToken, adminData });
  const admin = (await userDb.getById(adminId)) as Admin;
  expect(notifyUser).toHaveBeenCalledWith(admin);
});

test("notifyUser failure does not impact the result of the transaction", async () => {
  const registerAdmin = buildRegisterAdmin({
    ...dependencies,
    notifyUser: jest.fn().mockRejectedValue(new Error("err")),
  });
  const { adminId } = await registerAdmin({ superAdminToken, adminData });
  expect(await userDb.getById(adminId)).not.toBeNull();
});

test("failing dependencies", async () => {
  await checkIfItHandlesUnexpectedFailures({
    buildFunction: buildRegisterAdmin,
    defaultDependencies: dependencies,
    dependenciesToTest: [
      "userDb.getByEmail",
      "userDb.save",
      "userDb.generateId",
    ],
    validInputData: [{ superAdminToken, adminData }],
    expectedErrorClass: CouldNotCompleteRequest,
  });
});
