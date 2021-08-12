import { TokenVerificationError } from "../../auth/VerifyToken";
import getFakeAdmin from "../../fakes/FakeAdmin";
import getFakeBook from "../../fakes/FakeBook";
import getFakeBookAuthor from "../../fakes/FakeBookAuthor";
import getFakeCustomer from "../../fakes/FakeCustomer";
import FakeTokenManager from "../../fakes/FakeTokenManager";
import InMemoryBookDb from "../../fakes/InMemoryBookDb";
import InMemoryCartDb from "../../fakes/InMemoryCartDb";
import InMemoryUserDb from "../../fakes/InMemoryUserDb";
import {
  checkIfItHandlesUnexpectedFailures,
  expectThrownErrorToMatch,
} from "../../__test_helpers__";
import buildClearCart from "./imp";
import {
  CouldNotCompleteRequest,
  InvalidUserType,
  UserNotFound,
} from "./interface";

const tm = new FakeTokenManager();
const userDb = new InMemoryUserDb();
const bookDb = new InMemoryBookDb();
const cartDb = new InMemoryCartDb();
const dependencies = {
  saveCart: cartDb.saveCart,
  getCartFor: cartDb.getCartFor,
  getUserById: userDb.getById,
  verifyUserToken: tm.verifyToken,
  getBooksWithAuthors: (bookIds: string[]) =>
    bookDb.getBooksWithAuthors(userDb.getById, bookIds),
};
const clearCart = buildClearCart(dependencies);

test("user auth token is invalid", async () => {
  await expectThrownErrorToMatch(
    () => clearCart({ userAuthToken: "invalid 123" }),
    { class: TokenVerificationError, invalidToken: "invalid 123" }
  );
});

test("user does not exist", async () => {
  await expectThrownErrorToMatch(
    async () => clearCart({ userAuthToken: await tm.createTokenFor("123") }),
    { class: UserNotFound, userId: "123" }
  );
});

test("user is not a customer", async () => {
  const adminId = Math.random().toString();
  await userDb.save(await getFakeAdmin({ id: adminId }));
  await expectThrownErrorToMatch(
    async () => clearCart({ userAuthToken: await tm.createTokenFor(adminId) }),
    { class: InvalidUserType, wanted: "Customer", received: "Admin" }
  );
});

test("clearing out the cart", async () => {
  const customerId = Math.random().toString();
  await userDb.save(await getFakeCustomer({ id: customerId }));
  await userDb.save(await getFakeBookAuthor({ id: "ba1" }));
  await bookDb.save(await getFakeBook({ id: "b1", authorId: "ba1" }));
  await bookDb.save(await getFakeBook({ id: "b2", authorId: "ba1" }));

  let cart = await cartDb.getCartFor(customerId);
  cart.add("b1");
  cart.add("b2");
  await cartDb.saveCart(cart);

  const customerToken = await tm.createTokenFor(customerId);
  const { cartItems } = await clearCart({ userAuthToken: customerToken });
  expect(cartItems).toEqual([]);

  cart = await cartDb.getCartFor(customerId);
  expect(cart.getAll()).toEqual([]);
});

test("dependency failures", async () => {
  const userId = Math.random().toString();
  await userDb.save(await getFakeCustomer({ id: userId }));
  await checkIfItHandlesUnexpectedFailures({
    buildFunction: buildClearCart,
    defaultDependencies: dependencies,
    dependenciesToTest: [
      "getUserById",
      "saveCart",
      "getBooksWithAuthors",
      "getCartFor",
    ],
    validInputData: [{ userAuthToken: await tm.createTokenFor(userId) }],
    expectedErrorClass: CouldNotCompleteRequest,
  });
});
