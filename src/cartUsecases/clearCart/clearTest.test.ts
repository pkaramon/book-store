import { TokenVerificationError } from "../../auth/VerifyToken";
import bookDb from "../../testObjects/bookDb";
import cartDb from "../../testObjects/cartDb";
import getFakeAdmin from "../../testObjects/FakeAdmin";
import getFakeBook from "../../testObjects/FakeBook";
import getFakeBookAuthor from "../../testObjects/FakeBookAuthor";
import getFakeCustomer from "../../testObjects/FakeCustomer";
import tokenManager from "../../testObjects/tokenManager";
import userDb from "../../testObjects/userDb";
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

const dependencies = {
  saveCart: cartDb.save,
  getCartFor: cartDb.getCartFor,
  getUserById: userDb.getById,
  verifyUserToken: tokenManager.verifyToken,
  getBooksWithAuthors: bookDb.getBooksWithAuthors.bind(bookDb),
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
    async () => clearCart({ userAuthToken: await tokenManager.createTokenFor("123") }),
    { class: UserNotFound, userId: "123" }
  );
});

test("user is not a customer", async () => {
  const adminId = Math.random().toString();
  await userDb.save(await getFakeAdmin({ id: adminId }));
  await expectThrownErrorToMatch(
    async () => clearCart({ userAuthToken: await tokenManager.createTokenFor(adminId) }),
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
  await cartDb.save(cart);

  const customerToken = await tokenManager.createTokenFor(customerId);
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
    validInputData: [{ userAuthToken: await tokenManager.createTokenFor(userId) }],
    expectedErrorClass: CouldNotCompleteRequest,
  });
});
