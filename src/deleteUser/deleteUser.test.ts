import { TokenVerificationError } from "../auth/VerifyToken";
import getFakeAdmin from "../testObjects/FakeAdmin";
import getFakeBookAuthor from "../testObjects/FakeBookAuthor";
import getFakeCustomer from "../testObjects/FakeCustomer";
import tokenManager from "../testObjects/tokenManager";
import userDb from "../testObjects/userDb";
import { expectThrownErrorToMatch, rejectWith } from "../__test_helpers__";
import buildDeleteUser from "./imp";
import { UserAlreadyDeleted, CouldNotCompleteRequest } from "./interface";

const deleteUserById = async (userId: string) => {
  const exists = (await userDb.getById(userId)) !== null;
  if (!exists) return { wasDeleted: false };
  await userDb.deleteById(userId);
  return { wasDeleted: true };
};

const deleteUser = buildDeleteUser({
  verifyUserToken: tokenManager.verifyToken,
  deleteUserById,
});

beforeEach(async () => {
  userDb.TEST_ONLY_clear();
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
    async () => deleteUser({ userAuthToken: await tokenManager.createTokenFor("100") }),
    { class: UserAlreadyDeleted, userId: "100" }
  );
});

test("deleting the user", async () => {
  for (const userId of ["1", "2", "3"]) {
    expect(await userDb.getById(userId)).not.toBeNull();
    const { userId: deletedUserId } = await deleteUser({
      userAuthToken: await tokenManager.createTokenFor(userId),
    });
    expect(deletedUserId).toEqual(userId);
    expect(await userDb.getById(userId)).toBeNull();
  }
});

test("deleteUserById failure", async () => {
  const deleteUser = buildDeleteUser({
    verifyUserToken: tokenManager.verifyToken,
    deleteUserById: rejectWith(new Error("db err")),
  });
  await expectThrownErrorToMatch(
    async () => deleteUser({ userAuthToken: await tokenManager.createTokenFor("1") }),
    {
      class: CouldNotCompleteRequest,
      message: "could not delete the user",
      originalError: new Error("db err"),
    }
  );
});
