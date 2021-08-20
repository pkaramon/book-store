import { TokenVerificationError } from "../auth/VerifyToken";
import { createBuildHelper, getThrownError } from "../__test_helpers__";
import buildEditProfileDetails from "./imp";
import {
  UserNotFound,
  CouldNotCompleteRequest,
  InvalidEditProfileData,
  ToUpdate,
  InvalidUserType,
} from "./interface";
import getFakePlainUser from "../testObjects/FakePlainUser";
import SchemaValidator from "../domain/SchemaValidator";
import buildPlainUserSchema from "../domain/PlainUserSchema";
import clock from "../testObjects/clock";
import userDb from "../testObjects/userDb";
import tokenManager from "../testObjects/tokenManager";
import getFakeCustomer from "../testObjects/FakeCustomer";

test("user does not exist", async () => {
  const err: UserNotFound = await getThrownError(async () =>
    editProfileDetails({
      userAuthToken: await tokenManager.createTokenFor("123321"),
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

test("user returned from db is not a CustomUser", async () => {
  const editProfileDetails = buildEditProfileDetailsHelper({
    getUserById: jest.fn().mockResolvedValue(await getFakePlainUser()),
  });
  const fn = async () =>
    editProfileDetails({
      userAuthToken,
      toUpdate: { firstName: "Tom" },
    });
  await expect(fn).rejects.toThrowError(InvalidUserType);
});

describe("changing firstName", () => {
  test("successful change", async () => {
    await editProfileDetails({
      userAuthToken,
      toUpdate: { firstName: "Tom" },
    });
    const u = await userDb.getById(userDetails.id);
    expect(u?.info.firstName).toBe("Tom");
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
    const u = await userDb.getById(userDetails.id);
    expect(u?.info.lastName).toBe("Johnson");
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
    const u = await userDb.getById(userDetails.id);
    expect(u?.info.birthDate).toEqual(new Date(1990, 1, 3));
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
    const u = await userDb.getById(userDetails.id);
    expect(u?.info.firstName).toEqual("Tom");
    expect(u?.info.lastName).toEqual("Johnson");
    expect(u?.info.birthDate).toEqual(new Date(1990, 1, 1));
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

const userDataValidator = new SchemaValidator(buildPlainUserSchema(clock));
const buildEditProfileDetailsHelper = createBuildHelper(
  buildEditProfileDetails,
  {
    getUserById: userDb.getById,
    saveUser: userDb.save,
    userDataValidator,
    verifyUserAuthToken: tokenManager.verifyToken,
  }
);
const editProfileDetails = buildEditProfileDetailsHelper({});
let userAuthToken: string;
const userDetails = {
  id: "1",
  firstName: "bob",
  lastName: "smith",
  email: "bob@mail.com",
  birthDate: new Date(2000, 1, 1),
};

beforeEach(async () => {
  userAuthToken = await tokenManager.createTokenFor(userDetails.id);
  userDb.TEST_ONLY_clear();
  await userDb.save(await getFakeCustomer(userDetails));
});

async function expectValidationToFail<K extends keyof ToUpdate>(
  key: K,
  value: ToUpdate[K],
  ...errorMessages: string[]
) {
  try {
    await editProfileDetails({
      userAuthToken: await tokenManager.createTokenFor(userDetails.id),
      toUpdate: { [key]: value },
    });
    throw "should have thrown";
  } catch (e) {
    expect(e).toBeInstanceOf(InvalidEditProfileData);
    expect(e.errorMessages[key]).toEqual(errorMessages);
  }
}
