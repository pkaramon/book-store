import { TokenVerificationError } from "../auth/VerifyToken";
import User from "../domain/User";
import UserDataValidatorImp from "../domain/UserDataValidatorImp";
import FakeClock from "../fakes/FakeClock";
import FakeTokenManager from "../fakes/FakeTokenManager";
import InMemoryUserDb from "../fakes/InMemoryUserDb";
import { createBuildHelper, getThrownError } from "../__test__/fixtures";
import buildEditProfileDetails from "./imp";
import {
  UserNotFound,
  CouldNotCompleteRequest,
  InvalidEditProfileData,
  ToUpdate,
} from "./interface";

test("user does not exist", async () => {
  const err: UserNotFound = await getThrownError(async () =>
    editProfileDetails({
      userAuthToken: await tm.createTokenFor("123321"),
      toUpdate: { firstName: "Tom" },
    })
  );
  expect(err).toBeInstanceOf(UserNotFound);
  expect(err.userId).toEqual("123321");
});

test("user has invalid token", async () => {
  const err: TokenVerificationError = await getThrownError(() =>
    editProfileDetails({
      userAuthToken: "#invalid#",
      toUpdate: { firstName: "Tom" },
    })
  );
  expect(err).toBeInstanceOf(TokenVerificationError);
  expect(err.invalidToken).toEqual("#invalid#");
});

test("getUserById failure", async () => {
  const editProfileDetails = buildEditProfileDetailsHelper({
    getUserById: jest.fn().mockRejectedValue(new Error("could not get user")),
  });
  const fn = async () =>
    editProfileDetails({
      userAuthToken,
      toUpdate: { firstName: "Tom" },
    });
  await expect(fn).rejects.toThrowError(CouldNotCompleteRequest);
  await expect(fn).rejects.toThrowError("could not get the user from db");
});

describe("changing firstName", () => {
  test("successful change", async () => {
    await editProfileDetails({
      userAuthToken,
      toUpdate: { firstName: "Tom" },
    });
    const u = await userDb.getById(userData.id);
    expect(u?.firstName).toBe("Tom");
  });
  test("invalid firstName", async () => {
    await expectValidationToFail("firstName", "", "firstName cannot be empty");
    await expectValidationToFail("firstName", " ", "firstName cannot be empty");
  });
});

describe("changing lastName", () => {
  test("successful change", async () => {
    await editProfileDetails({
      userAuthToken,
      toUpdate: { lastName: "Johnson" },
    });
    const u = await userDb.getById(userData.id);
    expect(u?.lastName).toBe("Johnson");
  });
  test("invalid lastName", async () => {
    await expectValidationToFail("lastName", "", "lastName cannot be empty");
    await expectValidationToFail("lastName", " ", "lastName cannot be empty");
  });
});

describe("changing birthDate", () => {
  test("successful change", async () => {
    await editProfileDetails({
      userAuthToken,
      toUpdate: { birthDate: new Date(1990, 1, 3) },
    });
    const u = await userDb.getById(userData.id);
    expect(u?.birthDate).toEqual(new Date(1990, 1, 3));
  });
  test("invalid birthDate", async () => {
    await expectValidationToFail(
      "birthDate",
      new Date(2030, 1, 2),
      "birthDate cannot be in the future"
    );
  });
});

describe("changing multiple properties at at time", () => {
  test("successful change", async () => {
    await editProfileDetails({
      userAuthToken,
      toUpdate: {
        birthDate: new Date(1990, 1, 1),
        firstName: "Tom",
        lastName: "Johnson",
      },
    });
    const u = await userDb.getById(userData.id);
    expect(u?.firstName).toEqual("Tom");
    expect(u?.lastName).toEqual("Johnson");
    expect(u?.birthDate).toEqual(new Date(1990, 1, 1));
  });

  test("multiple errors", async () => {
    try {
      await editProfileDetails({
        userAuthToken,
        toUpdate: {
          birthDate: new Date(2030, 1, 1),
          firstName: "",
        },
      });
      throw "should have thrown";
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidEditProfileData);
      expect(e.errorMessages.lastName).toBeUndefined();
      expect(e.errorMessages.firstName).not.toBeUndefined();
      expect(e.errorMessages.birthDate).not.toBeUndefined();
    }
  });

  test("partially correct data", () => {});
});

test("saveUser failure", async () => {
  const editProfileDetails = buildEditProfileDetailsHelper({
    saveUser: jest.fn().mockRejectedValue(new Error("could not save the user")),
  });
  const err = await getThrownError(() =>
    editProfileDetails({ userAuthToken, toUpdate: { firstName: "Tom" } })
  );
  expect(err).toBeInstanceOf(CouldNotCompleteRequest);
  expect(err.message).toEqual("could not save the user to db");
});

const tm = new FakeTokenManager();
const userDb = new InMemoryUserDb();
const now = new FakeClock({ now: new Date(2020, 1, 1) }).now;
const userDataValidator = new UserDataValidatorImp(now);
const buildEditProfileDetailsHelper = createBuildHelper(
  buildEditProfileDetails,
  {
    getUserById: userDb.getById,
    saveUser: userDb.save,
    userDataValidator,
    verifyUserAuthToken: tm.verifyToken,
  }
);
const editProfileDetails = buildEditProfileDetailsHelper({});
const userData = {
  id: "1",
  firstName: "bob",
  lastName: "smith",
  email: "bob@mail.com",
  password: "HASHED - Pas@!#1231232",
  birthDate: new Date(2000, 1, 1),
};
let userAuthToken: string;

beforeEach(async () => {
  userAuthToken = await tm.createTokenFor(userData.id);
  userDb.clear();
  await userDb.save(new User(userData));
});

async function expectValidationToFail<K extends keyof ToUpdate>(
  key: K,
  value: ToUpdate[K],
  ...errorMessages: string[]
) {
  try {
    await editProfileDetails({
      userAuthToken: await tm.createTokenFor(userData.id),
      toUpdate: { [key]: value },
    });
    throw "should have thrown";
  } catch (e) {
    expect(e).toBeInstanceOf(InvalidEditProfileData);
    expect(e.errorMessages[key]).toEqual(errorMessages);
  }
}
