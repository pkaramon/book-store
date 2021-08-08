import { TokenVerificationError } from "../auth/VerifyToken";
import getFakeAdmin from "../fakes/FakeAdmin";
import getFakeBookAuthor from "../fakes/FakeBookAuthor";
import getFakeCustomer from "../fakes/FakeCustomer";
import FakeTokenManager from "../fakes/FakeTokenManager";
import InMemoryUserDb from "../fakes/InMemoryUserDb";
import { expectThrownErrorToMatch, rejectWith } from "../__test_helpers__";
import buildDeleteUser from "./imp";
import { UserAlreadyDeleted, CouldNotCompleteRequest } from "./interface";

const tm = new FakeTokenManager();
const userDb = new InMemoryUserDb();
const deleteUserById = async (userId: string) => {
  const exists = (await userDb.getById(userId)) !== null;
  if (!exists) return { wasDeleted: false };
  await userDb.deleteById(userId);
  return { wasDeleted: true };
};

const deleteUser = buildDeleteUser({
  verifyUserToken: tm.verifyToken,
  deleteUserById,
});

beforeEach(async () => {
  userDb.clear();
  userDb.save(await getFakeAdmin({ id: "1" }));
  userDb.save(await getFakeCustomer({ id: "2" }));
  userDb.save(await getFakeBookAuthor({ id: "3" }));
});

test("user auth token is invalid", async () => {
  await expectThrownErrorToMatch(
    () => deleteUser({ userAuthToken: "invalid 123321" }),
    { class: TokenVerificationError, invalidToken: "invalid 123321" }
  );
});

test("user does not exist", async () => {
  await expectThrownErrorToMatch(
    async () => deleteUser({ userAuthToken: await tm.createTokenFor("100") }),
    { class: UserAlreadyDeleted, userId: "100" }
  );
});

test("deleting the user", async () => {
  for (const userId of ["1", "2", "3"]) {
    expect(await userDb.getById(userId)).not.toBeNull();
    const { userId: deletedUserId } = await deleteUser({
      userAuthToken: await tm.createTokenFor(userId),
    });
    expect(deletedUserId).toEqual(userId);
    expect(await userDb.getById(userId)).toBeNull();
  }
});

test("deleteUserById failure", async () => {
  const deleteUser = buildDeleteUser({
    verifyUserToken: tm.verifyToken,
    deleteUserById: rejectWith(new Error("db err")),
  });
  await expectThrownErrorToMatch(
    async () => deleteUser({ userAuthToken: await tm.createTokenFor("1") }),
    {
      class: CouldNotCompleteRequest,
      message: "could not delete the user",
      originalError: new Error("db err"),
    }
  );
});
