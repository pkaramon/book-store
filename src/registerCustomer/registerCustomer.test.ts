import Customer from "../domain/Customer";
import buildPlainUserSchema from "../domain/PlainUserSchema";
import SchemaValidator from "../domain/SchemaValidator";
import clock from "../testObjects/clock";
import makePassword from "../testObjects/makePassword";
import userDb from "../testObjects/userDb";
import userNotifier from "../testObjects/userNotifier";
import {
  checkIfItHandlesUnexpectedFailures,
  expectThrownErrorToMatch,
  getThrownError,
  rejectWith,
} from "../__test_helpers__";
import buildRegisterCustomer from "./imp";
import {
  CouldNotCompleteRequest,
  EmailAlreadyTaken,
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
    for (const pass of goodPasswords) {
      await userDb.TEST_ONLY_clear();
      await expectValidationToPass("password", pass);
    }
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
    clock.setCurrentTime(new Date(2020, 1, 1));
    await expectValidationToPass("birthDate", clock.now());
    await expectValidationToFail(
      "birthDate",
      new Date(2020, 1, 2),
      "birthDate cannot be in the future"
    );
  });
});

test("saving customer to db", async () => {
  const { userId } = await registerCustomer({ ...validData });
  expect(typeof userId).toBe("string");
  const u = (await userDb.getById(userId)) as Customer;
  expect(u.info.id).toEqual(userId);
  expect(u.info.firstName).toEqual(validData.firstName);
  expect(u.info.lastName).toEqual(validData.lastName);
  expect(u.info.email).toEqual(validData.email);
  expect(u.info.birthDate).toEqual(validData.birthDate);
});

test("email must be unique", async () => {
  await registerCustomer({ ...validData });
  await expectThrownErrorToMatch(
    () =>
      registerCustomer({
        firstName: "Tom",
        lastName: "Smith",
        email: validData.email,
        password: "Pass123$",
        birthDate: new Date(1992, 1, 3),
      }),
    { class: EmailAlreadyTaken, email: validData.email }
  );
});

test("hashing passwords", async () => {
  const { userId } = await registerCustomer({ ...validData });
  const u = (await userDb.getById(userId))!;
  const pass = u.password;
  expect(await pass.isEqual(validData.password)).toBe(true);
});

test("customer should receive a notification when successfully registered", async () => {
  userNotifier.clearNotifications();
  const { userId } = await registerCustomer({ ...validData });

  const customer = (await userDb.getById(userId)) as Customer;
  expect(userNotifier.wasUserNotified(customer)).toBe(true);
});

test("errors when notifying user are silenced, they do not impact the result of the transaction", async () => {
  const registerCustomer = buildRegisterCustomer({
    ...dependencies,
    userNotifier: userNotifier.createFaultyNotifier(),
  });
  const { userId } = await registerCustomer({ ...validData });
  expect(await userDb.getById(userId)).not.toBeNull();
});

test("hashing failure", async () => {
  const registerCustomer = buildRegisterCustomer({
    ...dependencies,
    makePassword: rejectWith(new Error("hashing failure")),
  });

  await expectThrownErrorToMatch(() => registerCustomer({ ...validData }), {
    class: CouldNotCompleteRequest,
    originalError: new Error("hashing failure"),
  });
});

test("dependency failures", async () => {
  await checkIfItHandlesUnexpectedFailures({
    buildFunction: buildRegisterCustomer,
    validInputData: [validData],
    dependenciesToTest: [
      "userDb.save",
      "userDb.getByEmail",
      "userDb.generateId",
    ],
    expectedErrorClass: CouldNotCompleteRequest,
    defaultDependencies: dependencies,
  });
});

const dependencies = {
  userDb,
  userNotifier,
  userDataValidator: new SchemaValidator(buildPlainUserSchema(clock)),
  makePassword,
};
const registerCustomer = buildRegisterCustomer(dependencies);
const validData: InputData = {
  firstName: "Bob",
  lastName: "Smith",
  email: "bob@mail.com",
  password: "Bob@1#123FA",
  birthDate: new Date(2000, 1, 1),
};

beforeEach(() => {
  clock.resetClock();
  userDb.TEST_ONLY_clear();
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
  userDb.TEST_ONLY_clear();
}
