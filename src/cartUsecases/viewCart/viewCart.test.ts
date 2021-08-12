import { TokenVerificationError } from "../../auth/VerifyToken";
import { BookStatus } from "../../domain/Book";
import Price from "../../domain/Price";
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
import buildViewCart from "./imp";
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
const viewCart = buildViewCart(dependencies);

test("user auth token is invalid", async () => {
  await expectThrownErrorToMatch(
    () => viewCart({ userAuthToken: "invalid 123" }),
    { class: TokenVerificationError, invalidToken: "invalid 123" }
  );
});

test("user does not exist", async () => {
  await expectThrownErrorToMatch(
    async () => viewCart({ userAuthToken: await tm.createTokenFor("123") }),
    { class: UserNotFound, userId: "123" }
  );
});

test("user is not a customer", async () => {
  const adminId = Math.random().toString();
  await userDb.save(await getFakeAdmin({ id: adminId }));
  await expectThrownErrorToMatch(
    async () => viewCart({ userAuthToken: await tm.createTokenFor(adminId) }),
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
  await cartDb.saveCart(cart);

  const customerToken = await tm.createTokenFor(customerId);
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
    validInputData: [{ userAuthToken: await tm.createTokenFor(userId) }],
    expectedErrorClass: CouldNotCompleteRequest,
  });
});
