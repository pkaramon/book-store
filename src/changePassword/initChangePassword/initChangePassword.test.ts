import getFakePlainUser from "../../fakes/FakePlainUser";
import InMemoryUserDb from "../../fakes/InMemoryUserDb";
import makePassword from "../../fakes/makePassword";
import { createBuildHelper, getThrownError } from "../../__test_helpers__";
import buildInitChangePassword from "./imp";
import {
  CouldNotCompleteRequest,
  UnknownEmail,
  TokenCouldNotBeDeliver,
} from "./interface";

const userDb = new InMemoryUserDb();
const deliverResetPasswordTokenToUser = jest.fn().mockResolvedValue(undefined);
const createResetPasswordToken = jest.fn(
  async (userData: { email: string; userId: string }) => {
    return `${userData.userId} ${userData.email}`;
  }
);
const buildInitChangePasswordHelper = createBuildHelper(
  buildInitChangePassword,
  {
    getUserByEmail: userDb.getByEmail,
    deliverResetPasswordTokenToUser,
    createResetPasswordToken,
  }
);
const initChangePassword = buildInitChangePasswordHelper({});

beforeEach(async () => {
  deliverResetPasswordTokenToUser.mockClear();
  createResetPasswordToken.mockClear();
  userDb.clear();
  await userDb.save(
    await getFakePlainUser({
      id: "1",
      email: "bob@mail.com",
      password: await makePassword({ password: "Pass123$", isHashed: false }),
    })
  );
});

test("getUserByEmail has a failure", async () => {
  const initChangePassword = buildInitChangePasswordHelper({
    getUserByEmail: jest.fn().mockRejectedValue(new Error("db err")),
  });
  const err: CouldNotCompleteRequest = await getThrownError(() =>
    initChangePassword({ email: "bob@mail.com" })
  );
  expect(err).toBeInstanceOf(CouldNotCompleteRequest);
  expect(err.originalError).toEqual(new Error("db err"));
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
  expect(resetPasswordToken).toEqual("1 bob@mail.com");
  expect(createResetPasswordToken).toHaveBeenCalledWith(
    { email: "bob@mail.com", userId: "1" },
    5
  );
  expect(deliverResetPasswordTokenToUser).toHaveBeenCalledWith(
    await userDb.getByEmail("bob@mail.com"),
    resetPasswordToken
  );
});

test("error when creating password reset token", async () => {
  const initChangePassword = buildInitChangePasswordHelper({
    createResetPasswordToken: jest
      .fn()
      .mockRejectedValue(new Error("token err")),
  });
  const err: CouldNotCompleteRequest = await getThrownError(() =>
    initChangePassword({ email: "bob@mail.com" })
  );
  expect(err).toBeInstanceOf(CouldNotCompleteRequest);
  expect(err.originalError).toEqual(new Error("token err"));
});

test("error when trying to deliver the token", async () => {
  const initChangePassword = buildInitChangePasswordHelper({
    deliverResetPasswordTokenToUser: jest
      .fn()
      .mockRejectedValue(new Error("deliver err")),
  });
  const err: TokenCouldNotBeDeliver = await getThrownError(() =>
    initChangePassword({ email: "bob@mail.com" })
  );
  expect(err).toBeInstanceOf(TokenCouldNotBeDeliver);
});
