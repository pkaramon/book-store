import getFakeCustomer from "../fakes/FakeCustomer";
import FakeTokenManager from "../fakes/FakeTokenManager";
import InMemoryUserDb from "../fakes/InMemoryUserDb";
import makeCustomer from "../fakes/makeCustomer";
import makePassword from "../fakes/makePassword";
import { getThrownError } from "../__test__/fixtures";
import buildLogin from "./imp";
import {
  CouldNotCompleteRequest,
  Dependencies,
  InvalidLoginData,
} from "./interface";

test("getUserByEmail unexpected failure", async () => {
  const login = buildLoginHelper({
    getUserByEmail: jest.fn().mockRejectedValue(new Error("userDb err")),
  });
  await expectToThrowCouldNotCompleteRequest(() => login(validLoginData), {
    message: "could not talk to db",
    originalError: new Error("userDb err"),
  });
});

test("unexpected failure when comparing passwords", async () => {
  await userDb.save(
    await getFakeCustomer({
      password: {
        hashedString: () => "123",
        isEqual: async () => {
          throw new Error("hash err");
        },
      },
    })
  );

  await expectToThrowCouldNotCompleteRequest(() => login(validLoginData), {
    message: "could not compare passwords",
    originalError: new Error("hash err"),
  });
});

test("email is not correct", async () => {
  await expect(
    login({
      email: "unknown@mail.com",
      password: "Pass123$",
    })
  ).rejects.toThrowError(InvalidLoginData);
});

test("email is correct but password is not", async () => {
  await expect(
    login({
      email: "bob@mail.com",
      password: "wrong pass",
    })
  ).rejects.toThrowError(InvalidLoginData);
});

test("email and password are correct", async () => {
  const { token } = await login(validLoginData);
  expect(() => tokenManager.verifyToken(token)).not.toThrow();
});

test("createToken failure", async () => {
  const login = buildLoginHelper({
    createToken: jest.fn(() => {
      throw new Error("token err");
    }),
  });
  await expectToThrowCouldNotCompleteRequest(() => login(validLoginData), {
    message: "could not create token",
    originalError: new Error("token err"),
  });
});

const userDb = new InMemoryUserDb();
const tokenManager = new FakeTokenManager();
const login = buildLoginHelper();
const validLoginData = {
  email: "bob@mail.com",
  password: "Pass123$",
};
beforeEach(async () => {
  await userDb.save(
    await getFakeCustomer({
      id: "1",
      email: validLoginData.email,
      password: await makePassword({
        password: validLoginData.password,
        isHashed: false,
      }),
    })
  );
});

function buildLoginHelper(newDeps?: Partial<Dependencies>) {
  return buildLogin({
    getUserByEmail: userDb.getByEmail,
    createToken: tokenManager.createTokenFor,
    ...newDeps,
  });
}

async function expectToThrowCouldNotCompleteRequest(
  fn: Function,
  expectedData: { message: string; originalError: any }
) {
  const err: CouldNotCompleteRequest = await getThrownError(fn);
  expect(err).toBeInstanceOf(CouldNotCompleteRequest);
  expect(err.originalError).toEqual(expectedData.originalError);
  expect(err.message).toEqual(expectedData.message);
}
