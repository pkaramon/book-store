import { TokenVerificationError } from "../../auth/VerifyToken";
import { BookStatus } from "../../domain/Book";
import Price from "../../domain/Price";
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
import buildViewCart from "./imp";
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
const viewCart = buildViewCart(dependencies);

test("user auth token is invalid", async () => {
  await expectThrownErrorToMatch(
    () => viewCart({ userAuthToken: "invalid 123" }),
    { class: TokenVerificationError, invalidToken: "invalid 123" }
  );
});

test("user does not exist", async () => {
  await expectThrownErrorToMatch(
    async () =>
      viewCart({ userAuthToken: await tokenManager.createTokenFor("123") }),
    { class: UserNotFound, userId: "123" }
  );
});

test("user is not a customer", async () => {
  const adminId = Math.random().toString();
  await userDb.save(await getFakeAdmin({ id: adminId }));
  await expectThrownErrorToMatch(
    async () =>
      viewCart({ userAuthToken: await tokenManager.createTokenFor(adminId) }),
    { class: InvalidUserType, wanted: "Customer", received: "Admin" }
  );
});

test("viewing the cart", async () => {
  const customerId = Math.random().toString();
  await userDb.save(await getFakeCustomer({ id: customerId }));
  await userDb.save(
    await getFakeBookAuthor({
      id: "ba1",
      firstName: "Jerry",
      lastName: "Smith",
    })
  );
  await bookDb.save(await getFakeBook({ id: "b1", authorId: "ba1" }));
  await bookDb.save(
    await getFakeBook({
      id: "b2",
      authorId: "ba1",
      price: new Price("USD", 300),
      title: "book title",
      status: BookStatus.published,
    })
  );

  const cart = await cartDb.getCartFor(customerId);
  cart.add("b1");
  cart.add("b2");
  await cartDb.save(cart);

  const customerToken = await tokenManager.createTokenFor(customerId);
  const { cartItems } = await viewCart({ userAuthToken: customerToken });
  expect(cartItems).toHaveLength(2);
  const cartItem = cartItems[1];
  expect(cartItem.title).toEqual("book title");
  expect(cartItem.price.currency).toEqual("USD");
  expect(cartItem.price.cents).toEqual(300);
  expect(cartItem.author.firstName).toEqual("Jerry");
  expect(cartItem.author.lastName).toEqual("Smith");
  expect(cartItem.bookId).toEqual("b2");
});

test("dependency failures", async () => {
  const userId = Math.random().toString();
  await userDb.save(await getFakeCustomer({ id: userId }));
  await checkIfItHandlesUnexpectedFailures({
    buildFunction: buildViewCart,
    defaultDependencies: dependencies,
    dependenciesToTest: [
      "getUserById",
      "saveCart",
      "getBooksWithAuthors",
      "getCartFor",
    ],
    validInputData: [
      { userAuthToken: await tokenManager.createTokenFor(userId) },
    ],
    expectedErrorClass: CouldNotCompleteRequest,
  });
});
