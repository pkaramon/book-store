import getFakePlainUser from "../../testObjects/FakePlainUser";
import makePassword from "../../testObjects/makePassword";
import resetPasswordTokenManager from "../../testObjects/resetPasswordTokenManager";
import userDb from "../../testObjects/userDb";
import {
  checkIfItHandlesUnexpectedFailures,
  getThrownError,
  rejectWith,
} from "../../__test_helpers__";
import buildInitChangePassword from "./imp";
import {
  CouldNotCompleteRequest,
  UnknownEmail,
  TokenCouldNotBeDeliver,
} from "./interface";

const deliverResetPasswordTokenToUser = jest.fn().mockResolvedValue(undefined);
const dependencies = {
  getUserByEmail: userDb.getByEmail.bind(userDb),
  deliverResetPasswordTokenToUser,
  createResetPasswordToken: resetPasswordTokenManager.create.bind(
    resetPasswordTokenManager
  ),
};
const initChangePassword = buildInitChangePassword(dependencies);

beforeEach(async () => {
  deliverResetPasswordTokenToUser.mockClear();
  userDb.TEST_ONLY_clear();
  await userDb.save(
    await getFakePlainUser({
      id: "1",
      email: "bob@mail.com",
      password: await makePassword({ password: "Pass123$", isHashed: false }),
    })
  );
});

test("passed email does not exist in our db", async () => {
  const err: UnknownEmail = await getThrownError(() =>
    initChangePassword({ email: "unknown@mail.com" })
  );
  expect(err).toBeInstanceOf(UnknownEmail);
  expect(err.email).toEqual("unknown@mail.com");
});

test("passed email does exist in our db", async () => {
  const { resetPasswordToken } = await initChangePassword({
    email: "bob@mail.com",
  });
  expect(await resetPasswordTokenManager.verify(resetPasswordToken)).toEqual({
    userId: "1",
    isValid: true,
  });
  expect(deliverResetPasswordTokenToUser).toHaveBeenCalledWith(
    await userDb.getByEmail("bob@mail.com"),
    resetPasswordToken
  );
});

test("error when trying to deliver the token", async () => {
  const initChangePassword = buildInitChangePassword({
    ...dependencies,
    deliverResetPasswordTokenToUser: rejectWith(new Error("deliver err")),
  });
  const err: TokenCouldNotBeDeliver = await getThrownError(() =>
    initChangePassword({ email: "bob@mail.com" })
  );
  expect(err).toBeInstanceOf(TokenCouldNotBeDeliver);
});

test("dependency failures", async () => {
  await checkIfItHandlesUnexpectedFailures({
    buildFunction: buildInitChangePassword,
    validInputData: [{ email: "bob@mail.com" }],
    dependenciesToTest: ["getUserByEmail", "createResetPasswordToken"],
    expectedErrorClass: CouldNotCompleteRequest,
    defaultDependencies: dependencies,
  });
});
