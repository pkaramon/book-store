import User from "../domain/User";
import UserDataValidatorImp from "../domain/UserDataValidatorImp";
import FakeClock from "../fakes/FakeClock";
import InMemoryUserDb from "../fakes/InMemoryUserDb";
import buildEditProfileDetails from "./imp";
import {
  UserNotFound,
  CouldNotCompleteRequest,
  InvalidEditProfileData,
  EditProfileInputData,
} from "./interface";

test("user does not exist", async () => {
  const fn = () =>
    editProfileDetails({
      userId: "123321",
      firstName: "Tom",
    });
  await expect(fn).rejects.toThrowError(UserNotFound);
  await expect(fn).rejects.toThrowError("user with id: 123321 was not found");
});

test("getUserById failure", async () => {
  const editProfileDetails = buildEditProfileDetails({
    getUserById: jest.fn().mockRejectedValue(new Error("could not get user")),
    saveUser: userDb.save,
    userDataValidator,
  });
  const fn = () =>
    editProfileDetails({
      userId: userData.id,
      firstName: "Tom",
    });
  await expect(fn).rejects.toThrowError(CouldNotCompleteRequest);
  await expect(fn).rejects.toThrowError("could not get the user from db");
});

describe("changing firstName", () => {
  test("successful change", async () => {
    await editProfileDetails({ userId: userData.id, firstName: "Tom" });
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
    await editProfileDetails({ userId: userData.id, lastName: "Johnson" });
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
      userId: userData.id,
      birthDate: new Date(1990, 1, 3),
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
      userId: userData.id,
      birthDate: new Date(1990, 1, 1),
      firstName: "Tom",
      lastName: "Johnson",
    });
    const u = await userDb.getById(userData.id);
    expect(u?.firstName).toEqual("Tom");
    expect(u?.lastName).toEqual("Johnson");
    expect(u?.birthDate).toEqual(new Date(1990, 1, 1));
  });

  test("multiple errors", async () => {
    try {
      await editProfileDetails({
        userId: userData.id,
        birthDate: new Date(2030, 1, 1),
        firstName: "",
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
  const editProfileDetails = buildEditProfileDetails({
    getUserById: userDb.getById,
    saveUser: jest.fn().mockRejectedValue(new Error("could not save the user")),
    userDataValidator,
  });
  const fn = () =>
    editProfileDetails({
      userId: userData.id,
      firstName: "Tom",
    });
  await expect(fn).rejects.toThrowError(CouldNotCompleteRequest);
  await expect(fn).rejects.toThrowError("could not save the user to db");
});

const userDb = new InMemoryUserDb();
const now = new FakeClock({ now: new Date(2020, 1, 1) }).now;
const userDataValidator = new UserDataValidatorImp(now);
const editProfileDetails = buildEditProfileDetails({
  getUserById: userDb.getById,
  saveUser: userDb.save,
  userDataValidator,
});
const userData = {
  id: "1",
  firstName: "bob",
  lastName: "smith",
  email: "bob@mail.com",
  password: "HASHED - Pas@!#1231232",
  birthDate: new Date(2000, 1, 1),
};

beforeEach(async () => {
  userDb.clear();
  await userDb.save(new User(userData));
});

async function expectValidationToFail<K extends keyof EditProfileInputData>(
  key: K,
  value: EditProfileInputData[K],
  ...errorMessages: string[]
) {
  try {
    await editProfileDetails({ userId: userData.id, [key]: value });
    throw "should have thrown";
  } catch (e) {
    expect(e).toBeInstanceOf(InvalidEditProfileData);
    expect(e.errorMessages[key]).toEqual(errorMessages);
  }
}
