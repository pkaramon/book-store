import getFakeCustomer from "../testObjects/FakeCustomer";
import makePassword from "../testObjects/makePassword";
import {
  checkIfItHandlesUnexpectedFailures,
  createBuildHelper,
  expectThrownErrorToMatch,
  rejectWith,
} from "../__test_helpers__";
import buildLogin from "./imp";
import { CouldNotCompleteRequest, InvalidLoginData } from "./interface";
import userDb from "../testObjects/userDb";
import tokenManager from "../testObjects/tokenManager";

test("email is not correct", async () => {
  await expect(
    login({ email: "unknown@mail.com", password: "Pass123$" })
  ).rejects.toThrowError(InvalidLoginData);
});

test("email is correct but password is not", async () => {
  await expect(
    login({ email: "bob@mail.com", password: "wrong pass" })
  ).rejects.toThrowError(InvalidLoginData);
});

test("email and password are correct", async () => {
  const { token } = await login(validLoginData);
  expect(() => tokenManager.verifyToken(token)).not.toThrow();
});

test("dependencies failures", async () => {
  await checkIfItHandlesUnexpectedFailures({
    buildFunction: buildLogin,
    defaultDependencies: dependencies,
    validInputData: [validLoginData],
    dependenciesToTest: ["createToken", "getUserByEmail"],
    expectedErrorClass: CouldNotCompleteRequest,
  });
});

test("unexpected failure when comparing passwords", async () => {
  await userDb.save(
    await getFakeCustomer({
      password: {
        hashedString: () => "123",
        isEqual: rejectWith(new Error("hash err")),
      },
    })
  );

  await expectThrownErrorToMatch(() => login(validLoginData), {
    message: "could not compare passwords",
    class: CouldNotCompleteRequest,
    originalError: new Error("hash err"),
  });
});

const dependencies = {
  getUserByEmail: userDb.getByEmail,
  createToken: tokenManager.createTokenFor,
};
const buildLoginHelper = createBuildHelper(buildLogin, dependencies);
const login = buildLoginHelper({});
const validLoginData = {
  email: "bob@mail.com",
  password: "Pass123$",
};
beforeEach(async () => {
  await userDb.save(
    await getFakeCustomer({
      id: "1",
      email: validLoginData.email,
      password: await makePassword({
        password: validLoginData.password,
        isHashed: false,
      }),
    })
  );
});
