import getFakePlainUser from "../../testObjects/FakePlainUser";
import makePassword from "../../testObjects/makePassword";
import resetPasswordTokenManager from "../../testObjects/resetPasswordTokenManager";
import userDb from "../../testObjects/userDb";
import { createBuildHelper, getThrownError } from "../../__test_helpers__";
import buildFinishChangePassword from "./imp";
import {
  CouldNotCompleteRequest,
  InvalidNewPassword,
  InvalidResetPasswordToken,
  UserNotFound,
} from "./interface";

const oldPassword = "123Aa!@#";
let validData: { token: string; newPassword: string };
beforeEach(async () => {
  userDb.TEST_ONLY_clear();
  await userDb.save(
    await getFakePlainUser({
      id: "1",
      email: "bob@mail.com",
      password: await makePassword({ password: oldPassword, isHashed: false }),
    })
  );

  validData = {
    newPassword: "Pass123$",
    token: await resetPasswordTokenManager.create({
      userId: "1",
      email: "bob@mail.com",
      expiresInMinutes: 60,
    }),
  };
});

const validateRawPassword = (password: string) => {
  password = password.trim();
  const isValid = password.length >= 8;
  const errorMessages = isValid
    ? []
    : ["password must have at least 8 characters"];
  return { isValid, errorMessages, password };
};

const dependencies = {
  verifyResetPasswordToken: resetPasswordTokenManager.verify.bind(
    resetPasswordTokenManager
  ),
  validateRawPassword,
  getUserById: userDb.getById,
  saveUser: userDb.save,
  makePassword,
};

const finishChangePassword = buildFinishChangePassword(dependencies);

test("verifyResetPasswordToken has a failure", async () => {
  const finishChangePassword = buildFinishChangePassword({
    ...dependencies,
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
      token: "blablabla",
      newPassword: validData.newPassword,
    })
  );
  expect(err).toBeInstanceOf(InvalidResetPasswordToken);
  expect(err.token).toEqual("blablabla");
});

test("token is valid but new password does not pass requirements", async () => {
  const err: InvalidNewPassword = await getThrownError(() =>
    finishChangePassword({ token: validData.token, newPassword: "12" })
  );
  expect(err).toBeInstanceOf(InvalidNewPassword);
  expect(err.password).toEqual("12");
  expect(err.errorMessages).toEqual([
    "password must have at least 8 characters",
  ]);
});

test("changing the password", async () => {
  const { userId } = await finishChangePassword(validData);
  expect(userId).toEqual("1");
  const bob = await userDb.getByEmail("bob@mail.com");
  expect(await bob?.password.isEqual(validData.newPassword)).toBe(true);
  expect(await bob?.password.isEqual(oldPassword)).toBe(false);
});

test("user does not exist, ie maybe it got deleted after calling initChangePassword", async () => {
  const token = await resetPasswordTokenManager.create({
    userId: "2",
    email: "tom@mail.com",
    expiresInMinutes: 60,
  });

  const err: UserNotFound = await getThrownError(() =>
    finishChangePassword({ token, newPassword: "Pass123$" })
  );
  expect(err).toBeInstanceOf(UserNotFound);
  expect(err.userId).toEqual("2");
});

test("saveUser has a failure", async () => {
  const finishChangePassword = buildFinishChangePassword({
    ...dependencies,
    saveUser: jest.fn().mockRejectedValue(new Error("save err")),
  });
  const err: CouldNotCompleteRequest = await getThrownError(() =>
    finishChangePassword(validData)
  );
  expect(err).toBeInstanceOf(CouldNotCompleteRequest);
  expect(err.originalError).toEqual(new Error("save err"));
});
