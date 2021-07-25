import FakeClock from "../fakes/FakeClock";
import fakeHashPassword from "../fakes/fakeHashPassword";
import InMemoryUserDb from "../fakes/InMemoryUserDb";
import NumberIdCreator from "../fakes/NumberIdCreator";
import buildRegisterUser from "./imp";
import {
  CouldNotCompleteRequest,
  InputData,
  Dependencies,
  InvalidUserRegisterData,
} from "./interface";

describe("validation", () => {
  test("firstName cannot be empty", async () => {
    const errorMessage = "firstName cannot be empty";
    await expectValidationToFail("firstName", "", errorMessage);
    await expectValidationToFail("firstName", " ", errorMessage);
  });
  test("lastName cannot be empty", async () => {
    const errorMessage = "lastName cannot be empty";
    await expectValidationToFail("lastName", "", errorMessage);
    await expectValidationToFail("lastName", " ", errorMessage);
  });
  test("email is not an email", async () => {
    validateEmail.mockReturnValueOnce(false);
    await expectValidationToFail("email", "bblabla@@#!#", "email is invalid");
    expect(validateEmail).toHaveBeenCalledWith("bblabla@@#!#");
  });
  test("password contains less than 8 characters", async () => {
    await expectValidationToFail(
      "password",
      "A23456@",
      "password must contain at least 8 characters"
    );
  });

  test("password must contain at least 1 special character", async () => {
    await expectValidationToFail(
      "password",
      "A2345678",
      "password must contain at least 1 special character"
    );
    const goodPasswords = [
      "A234567!",
      "A234567@",
      "A234567#",
      "A234567$",
      "A234567%",
      "A234567^",
      "A234567&",
      "A234567*",
      "A234567(",
      "A234567)",
      "A234567[",
      "A234567]",
      "A234567{",
      "A234567}",
      "A234567;",
      "A234567:",
      "A234567'",
      'A234567"',
      "A234567'",
      "A234567\\",
      "A234567|",
      "A234567<",
      "A234567>",
      "A234567,",
      "A234567.",
      "A234567/",
      "A234567?",
      "A234567`",
      "A234567~",
      "A234567-",
      "A234567=",
      "A234567+",
      "A234567_",
    ];
    for (const pass of goodPasswords)
      await expectValidationToPass("password", pass);
  });

  test("password must contain at least 1 uppercase character", async () => {
    await expectValidationToFail(
      "password",
      "a234567!",
      "password must contain at least 1 uppercase character"
    );
    await expectValidationToPass("password", "A234567!");
    await expectValidationToPass("password", "12B4A67!");
    await expectValidationToPass("password", "a2B4A67!");
  });

  test("accumulation of password errors", async () => {
    await expectValidationToFail("password", "123", [
      "password must contain at least 8 characters",
      "password must contain at least 1 uppercase character",
      "password must contain at least 1 special character",
    ]);
  });

  test("birthDate cannot be in the future", async () => {
    await expectValidationToPass("birthDate", fakeClock.now());
    await expectValidationToFail(
      "birthDate",
      new Date("2020-01-02"),
      "birthDate cannot be in the future"
    );
  });
});

test("saveUser throws error", async () => {
  const registerUser = buildRegisterUserHelper({
    saveUser: jest.fn().mockRejectedValue(new Error("could not save user")),
  });
  const fn = () => registerUser({ ...validData });
  await expect(fn).rejects.toThrowError(CouldNotCompleteRequest);
  await expect(fn).rejects.toThrowError("could not save the user");
});

test("saving user to db", async () => {
  const { userId } = await registerUser({ ...validData });
  expect(userId).toEqual(idCreator.lastCreated());
  const u = await userDb.getById(userId);
  expect(u?.id).toEqual(userId);
  expect(u?.firstName).toEqual(validData.firstName);
  expect(u?.lastName).toEqual(validData.lastName);
  expect(u?.email).toEqual(validData.email);
  expect(u?.birthDate).toEqual(validData.birthDate);
});

test("hashing passwords", async () => {
  const { userId } = await registerUser({ ...validData });
  const u = await userDb.getById(userId);
  expect(u?.password).toEqual(await hashPassword(validData.password));
});

test("hashing failure", async () => {
  const registerUser = buildRegisterUserHelper({
    hashPassword: jest.fn().mockRejectedValue(new Error("hashing failure")),
  });
  const fn = () => registerUser({ ...validData });
  await expect(fn).rejects.toThrowError(CouldNotCompleteRequest);
  await expect(fn).rejects.toThrowError("hashing failure");
});

const validateEmail = jest.fn().mockReturnValue(true);
const userDb = new InMemoryUserDb();
const hashPassword = fakeHashPassword;
const idCreator = new NumberIdCreator();
const fakeClock = new FakeClock({ now: new Date("2020-01-1") });
const registerUser = buildRegisterUserHelper({});
const validData: InputData = {
  firstName: "Bob",
  lastName: "Smith",
  email: "bob@mail.com",
  password: "Bob@1#123FA",
  birthDate: new Date(2000, 1, 1),
};

beforeEach(() => {
  userDb.clear();
  idCreator.reset();
  validateEmail.mockClear();
});

function buildRegisterUserHelper(newDeps: Partial<Dependencies>) {
  return buildRegisterUser({
    hashPassword,
    saveUser: userDb.save,
    now: fakeClock.now,
    validateEmail,
    createId: idCreator.create,
    ...newDeps,
  });
}

async function expectValidationToFail<K extends keyof InputData>(
  key: K,
  value: InputData[K],
  errorMessage: string | string[]
) {
  try {
    await registerUser({ ...validData, [key]: value });
    throw "should have thrown";
  } catch (e) {
    expect(e).toBeInstanceOf(InvalidUserRegisterData);
    expect(e.invalidProperties).toHaveLength(1);
    expect(e.invalidProperties).toContain(key);
    expect(e.errors).toEqual({ [key]: errorMessage });
  }
}

async function expectValidationToPass<K extends keyof InputData>(
  key: K,
  value: InputData[K]
) {
  await registerUser({ ...validData, [key]: value });
}
