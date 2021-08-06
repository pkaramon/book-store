import BookAuthor from "../domain/BookAuthor";
import buildBookAuthorSchema from "../domain/BookAuthorSchema";
import UserDataValidator from "../domain/UserDataValidator";
import InMemoryUserDb from "../fakes/InMemoryUserDb";
import makeBookAuthor from "../fakes/makeBookAuthor";
import makePassword from "../fakes/makePassword";
import { expectThrownErrorToMatch } from "../__test__/fixtures";
import nCharString from "../__test__/nCharString";
import buildRegisterBookAuthor from "./imp";
import {
  EmailAlreadyTaken,
  InputData,
  InvalidBookAuthorRegisterData,
} from "./interface";

const userDb = new InMemoryUserDb();
const notifyUser = jest.fn().mockResolvedValue(undefined);
const registerBookAuthor = buildRegisterBookAuthor({
  notifyUser,
  saveUser: userDb.save,
  makePassword: makePassword,
  makeBookAuthor: makeBookAuthor,
  getUserByEmail: userDb.getByEmail,
  userDataValidator: new UserDataValidator(buildBookAuthorSchema()) as any,
});
beforeEach(() => {
  userDb.clear();
  notifyUser.mockClear();
});
const validData: InputData = {
  email: "bob@mail.com",
  firstName: "bob",
  lastName: "smith",
  password: "Pass123$",
  birthDate: new Date(2000, 1, 1),
  bio: "My story begins...",
};

describe("data validation", () => {
  test("data is invalid", async () => {
    const data = {
      ...validData,
      email: "123",
      firstName: "",
      lastName: "",
    };
    await expectThrownErrorToMatch(() => registerBookAuthor(data), {
      class: InvalidBookAuthorRegisterData,
      errorMessages: {
        email: ["email is invalid"],
        firstName: ["firstName cannot be empty"],
        lastName: ["lastName cannot be empty"],
      },
      invalidProperties: expect.arrayContaining([
        "email",
        "lastName",
        "firstName",
      ]),
    });
  });

  test("bio can be empty", async () => {
    await registerBookAuthor({ ...validData, bio: "" });
  });

  test("bio can be up to 1000 characters", async () => {
    await registerBookAuthor({
      ...validData,
      bio: "  " + nCharString(1000) + " ",
    });
  });

  test("bio cannot be more than 1000 characters long", async () => {
    await expectThrownErrorToMatch(
      () => registerBookAuthor({ ...validData, bio: nCharString(1001) }),
      {
        class: InvalidBookAuthorRegisterData,
        errorMessages: {
          bio: ["bio cannot be more than 1000 characters long"],
        },
        invalidProperties: expect.arrayContaining(["bio"]),
      }
    );
  });
});

test("adding a bookAuthor to db", async () => {
  const { userId } = await registerBookAuthor(validData);
  const bookAuthor = (await userDb.getById(userId)) as BookAuthor;
  expect(bookAuthor).not.toBeNull();
  expect(await bookAuthor.password.isEqual(validData.password)).toBe(true);
  expect(bookAuthor.info.id).toEqual(userId);
  expect(bookAuthor.info.email).toEqual(validData.email);
  expect(bookAuthor.info.firstName).toEqual(validData.firstName);
  expect(bookAuthor.info.lastName).toEqual(validData.lastName);
  expect(bookAuthor.info.birthDate).toEqual(validData.birthDate);
  expect(bookAuthor.info.bio).toEqual(validData.bio);
});

test("email must be unique", async () => {
  await registerBookAuthor({ ...validData });
  await expectThrownErrorToMatch(
    () => registerBookAuthor({ ...validData, email: validData.email }),
    { class: EmailAlreadyTaken, email: validData.email }
  );
});

test("bookAuthor should receive notification when successfully registered", async () => {
  const { userId } = await registerBookAuthor({ ...validData });
  expect(notifyUser).toHaveBeenCalledWith(await userDb.getById(userId));
});
