import Customer from "../domain/Customer";
import RawUserDataValidatorImp from "../domain/RawUserDataValidatorImp";
import FakeClock from "../fakes/FakeClock";
import { fakeHashPassword } from "../fakes/fakeHashing";
import InMemoryUserDb from "../fakes/InMemoryUserDb";
import makeCustomer from "../fakes/makeCustomer";
import { createBuildHelper, getThrownError } from "../__test__/fixtures";
import buildRegisterCustomer from "./imp";
import {
  CouldNotCompleteRequest,
  InputData,
  InvalidCustomerRegisterData,
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
    await expectValidationToFail("email", "bblabla@@#!#", "email is invalid");
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
    await expectValidationToFail(
      "password",
      "123",
      "password must contain at least 8 characters",
      "password must contain at least 1 uppercase character",
      "password must contain at least 1 special character"
    );
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

test("saveCustomer throws error", async () => {
  const registerCustomer = buildRegisterCustomerHelper({
    saveUser: jest
      .fn()
      .mockRejectedValue(new Error("could not save customer")),
  });
  const err: CouldNotCompleteRequest = await getThrownError(() =>
    registerCustomer({ ...validData })
  );
  expect(err).toBeInstanceOf(CouldNotCompleteRequest);
  expect(err.originalError).toEqual(new Error("could not save customer"));
});

test("saving customer to db", async () => {
  const { userId } = await registerCustomer({ ...validData });
  expect(typeof userId).toBe("string");
  const u = (await userDb.getById(userId)) as Customer;
  expect(u?.info.id).toEqual(userId);
  expect(u?.info.firstName).toEqual(validData.firstName);
  expect(u?.info.lastName).toEqual(validData.lastName);
  expect(u?.info.email).toEqual(validData.email);
  expect(u?.info.birthDate).toEqual(validData.birthDate);
});

test("email must be unique", async () => {
  await registerCustomer({ ...validData });
  const err: InvalidCustomerRegisterData = await getThrownError(() =>
    registerCustomer({
      firstName: "Tom",
      lastName: "Smith",
      email: validData.email,
      password: "Pass123$",
      birthDate: new Date(1992, 1, 3),
    })
  );
  expect(err).toBeInstanceOf(InvalidCustomerRegisterData);
  expect(err.errorMessages.email).toEqual(["email is already taken"]);
  expect(err.invalidProperties).toEqual(["email"]);
});

test("hashing passwords", async () => {
  const { userId } = await registerCustomer({ ...validData });
  const u = await userDb.getById(userId);
  expect(u?.info.password).toEqual(await hashPassword(validData.password));
});

test("customer should receive a notification when successfully registered", async () => {
  const notifyUser = jest.fn().mockResolvedValue(undefined);
  const registerCustomer = buildRegisterCustomerHelper({ notifyUser });
  const { userId } = await registerCustomer({ ...validData });
  expect(notifyUser).toHaveBeenCalledWith(await userDb.getById(userId));
});

test("errors thrown from notifyUser are silenced, they do not impact the result of the transaction", async () => {
  const registerCustomer = buildRegisterCustomerHelper({
    notifyUser: jest.fn().mockRejectedValue(new Error("email server error")),
  });
  const { userId } = await registerCustomer({ ...validData });
  expect(await userDb.getById(userId)).not.toBeNull();
});

test("hashing failure", async () => {
  const registerCustomer = buildRegisterCustomerHelper({
    hashPassword: jest.fn().mockRejectedValue(new Error("hashing failure")),
  });
  const err: CouldNotCompleteRequest = await getThrownError(() =>
    registerCustomer({ ...validData })
  );
  expect(err).toBeInstanceOf(CouldNotCompleteRequest);
  expect(err.originalError).toEqual(new Error("hashing failure"));
});

const userDb = new InMemoryUserDb();
const hashPassword = fakeHashPassword;
const fakeClock = new FakeClock({ now: new Date("2020-01-1") });
const buildRegisterCustomerHelper = createBuildHelper(buildRegisterCustomer, {
  hashPassword,
  saveUser: userDb.save,
  notifyUser: jest.fn().mockResolvedValue(undefined),
  userDataValidator: new RawUserDataValidatorImp(fakeClock.now),
  getUserByEmail: userDb.getByEmail,
  makeCustomer,
});
const registerCustomer = buildRegisterCustomerHelper({});
const validData: InputData = {
  firstName: "Bob",
  lastName: "Smith",
  email: "bob@mail.com",
  password: "Bob@1#123FA",
  birthDate: new Date(2000, 1, 1),
};

beforeEach(() => {
  userDb.clear();
});

async function expectValidationToFail<K extends keyof InputData>(
  key: K,
  value: InputData[K],
  ...errorMessages: string[]
) {
  const err: InvalidCustomerRegisterData = await getThrownError(() =>
    registerCustomer({ ...validData, [key]: value })
  );
  expect(err).toBeInstanceOf(InvalidCustomerRegisterData);
  expect(err.invalidProperties).toHaveLength(1);
  expect(err.invalidProperties).toContain(key);
  expect(err.errorMessages).toEqual({ [key]: errorMessages });
}

async function expectValidationToPass<K extends keyof InputData>(
  key: K,
  value: InputData[K]
) {
  await registerCustomer({ ...validData, [key]: value });
  userDb.clear();
}
