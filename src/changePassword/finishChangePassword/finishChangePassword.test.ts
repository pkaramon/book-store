import getFakePlainUser from "../../testObjects/FakePlainUser";
import makePassword from "../../testObjects/makePassword";
import userDb from "../../testObjects/userDb";
import { createBuildHelper, getThrownError } from "../../__test_helpers__";
import buildFinishChangePassword from "./imp";
import {
  CouldNotCompleteRequest,
  InvalidNewPassword,
  InvalidResetPasswordToken,
  UserNotFound,
} from "./interface";

// fake token format: <userId> <email>
const verifyResetPasswordToken = jest.fn(async (token: string) => {
  const [userId, email] = token.split(" ");
  if (email.includes("@")) return { isValid: true, userId };
  return { isValid: false as false };
});

const oldPassword = "123Aa!@#";
beforeEach(async () => {
  userDb.TEST_ONLY_clear();
  await userDb.save(
    await getFakePlainUser({
      id: "1",
      email: "bob@mail.com",
      password: await makePassword({ password: oldPassword, isHashed: false }),
    })
  );
});

const validateRawPassword = (password: string) => {
  password = password.trim();
  const isValid = password.length >= 8;
  const errorMessages = isValid
    ? []
    : ["password must have at least 8 characters"];
  return { isValid, errorMessages, password };
};
const buildFinishChangePasswordHelper = createBuildHelper(
  buildFinishChangePassword,
  {
    verifyResetPasswordToken,
    validateRawPassword,
    getUserById: userDb.getById,
    saveUser: userDb.save,
    makePassword,
  }
);
const finishChangePassword = buildFinishChangePasswordHelper({});

const validData = { token: "1 bob@mail.com", newPassword: "Pass123$" };
test("verifyResetPasswordToken has a failure", async () => {
  const finishChangePassword = buildFinishChangePasswordHelper({
    verifyResetPasswordToken: jest
      .fn()
      .mockRejectedValue(new Error("token err")),
  });
  const err = await getThrownError(() => finishChangePassword(validData));
  expect(err).toBeInstanceOf(CouldNotCompleteRequest);
  expect(err.originalError).toEqual(new Error("token err"));
});

test("token is invalid", async () => {
  const err: InvalidResetPasswordToken = await getThrownError(() =>
    finishChangePassword({
      token: "1 blablabla",
      newPassword: validData.newPassword,
    })
  );
  expect(err).toBeInstanceOf(InvalidResetPasswordToken);
  expect(err.token).toEqual("1 blablabla");
});

test("token is valid but new password does not pass requirements", async () => {
  const err: InvalidNewPassword = await getThrownError(() =>
    finishChangePassword({ token: "1 bob@mail.com", newPassword: "12" })
  );
  expect(err).toBeInstanceOf(InvalidNewPassword);
  expect(err.password).toEqual("12");
  expect(err.errorMessages).toEqual([
    "password must have at least 8 characters",
  ]);
});

test("saveUser has a failure", async () => {
  const finishChangePassword = buildFinishChangePasswordHelper({
    saveUser: jest.fn().mockRejectedValue(new Error("save err")),
  });
  const err: CouldNotCompleteRequest = await getThrownError(() =>
    finishChangePassword(validData)
  );
  expect(err).toBeInstanceOf(CouldNotCompleteRequest);
  expect(err.originalError).toEqual(new Error("save err"));
});

test("changing the password", async () => {
  const { userId } = await finishChangePassword(validData);
  expect(userId).toEqual("1");
  const bob = await userDb.getByEmail("bob@mail.com");
  expect(await bob?.password.isEqual(validData.newPassword)).toBe(true);
  expect(await bob?.password.isEqual(oldPassword)).toBe(false);
});

test("user does not exist, ie maybe it got deleted after calling initChangePassword", async () => {
  const err: UserNotFound = await getThrownError(() =>
    finishChangePassword({ token: "2 tom@mail.com", newPassword: "Pass123$" })
  );
  expect(err).toBeInstanceOf(UserNotFound);
  expect(err.userId).toEqual("2");
});
