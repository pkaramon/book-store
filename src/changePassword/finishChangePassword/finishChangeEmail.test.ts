import User from "../../domain/User";
import InMemoryUserDb from "../../fakes/InMemoryUserDb";
import { createBuildHelper, getThrownError } from "../../__test__/fixtures";
import buildFinishChangePassword from "./imp";
import {
  CouldNotCompleteRequest,
  InvalidResetPasswordToken,
  InvalidNewPassword,
  UserNotFound,
} from "./interface";

// fake token format: <userId> <email>
const verifyResetPasswordToken = jest.fn(async (token: string) => {
  const [userId, email] = token.split(" ");
  if (email.includes("@")) return { isValid: true, userId };
  return { isValid: false as false };
});

const userDb = new InMemoryUserDb();
beforeEach(async () => {
  userDb.clear();
  await userDb.save(
    new User({
      password: "!#vdkajfa!@",
      email: "bob@mail.com",
      id: "1",
      firstName: "bob",
      lastName: "smith",
      birthDate: new Date(2000, 1, 1),
    })
  );
});

const validatePassword = (password: string) => {
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
    validatePassword,
    getUserById: userDb.getById,
    saveUser: userDb.save,
  }
);
const finishChangePassword = buildFinishChangePasswordHelper({});

const validData = {
  token: "1 bob@mail.com",
  newPassword: "Pass123$",
};

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
  expect(bob?.password).toEqual(validData.newPassword);
});

test("user does not exist, ie maybe it got deleted after calling initChangePassword", async () => {
  const err: UserNotFound = await getThrownError(() =>
    finishChangePassword({ token: "2 tom@mail.com", newPassword: "Pass123$" })
  );
  expect(err).toBeInstanceOf(UserNotFound);
  expect(err.userId).toEqual("2");
});
