import Admin from "../../domain/Admin";
import BookAuthor from "../../domain/BookAuthor";
import Customer from "../../domain/Customer";
import User from "../../domain/User";
import getFakeAdmin from "../../testObjects/FakeAdmin";
import getFakeBookAuthor from "../../testObjects/FakeBookAuthor";
import getFakeCustomer from "../../testObjects/FakeCustomer";
import makeAdmin from "../../testObjects/makeAdmin";
import makeBookAuthor from "../../testObjects/makeBookAuthor";
import makeCustomer from "../../testObjects/makeCustomer";
import makePassword from "../../testObjects/makePassword";
import MongoUserDb from "./MongoUserDb";
import UserToDocumentGatewayImp from "./UserToDocumentGatewayImp";

const userDb = new MongoUserDb(
  {
    uri: "mongodb://localhost:27017",
    databaseName: "TEST_DB",
    collectionName: "USERS_TEST",
  },
  new UserToDocumentGatewayImp({
    makePassword,
    makeCustomer,
    makeBookAuthor,
    makeAdmin,
  })
);

beforeEach(async () => {
  await userDb.TEST_ONLY_clear();
});

afterAll(async () => {
  await userDb.closeCollection();
});

test("user does not exist", async () => {
  expect(await userDb.getById("1")).toBe(null);
});

async function expectUserInfoToBeCorrectlyCopied(fromDb: User, original: User) {
  const info = original.info;
  const dbInfo = fromDb.info;
  expect(dbInfo.id).toEqual(info.id);
  expect(dbInfo.email).toEqual(info.email);
  expect(dbInfo.firstName).toEqual(info.firstName);
  expect(dbInfo.lastName).toEqual(info.lastName);
  expect(await dbInfo.password.isEqual("Pass123$")).toBe(true);
  expect(await dbInfo.password.isEqual("Pass123#1")).toBe(false);
  expect(dbInfo.birthDate).toEqual(info.birthDate);
}

test("saving and retrieving Customer", async () => {
  const id = Math.random().toString();
  const customer = await getFakeCustomer({
    id,
    password: await makePassword({ password: "Pass123$", isHashed: false }),
  });
  await userDb.save(customer);
  const customerFromDb = (await userDb.getById(id)) as Customer;
  expect(customerFromDb).toBeInstanceOf(Customer);
  await expectUserInfoToBeCorrectlyCopied(customerFromDb, customer);
});

test("saving and retrieving BookAuthor", async () => {
  const id = Math.random().toString();
  const bookAuthor = await getFakeBookAuthor({
    id,
    password: await makePassword({ password: "Pass123$", isHashed: false }),
  });
  await userDb.save(bookAuthor);
  const bookAuthorFromDb = (await userDb.getById(id)) as BookAuthor;
  expect(bookAuthorFromDb).toBeInstanceOf(BookAuthor);
  await expectUserInfoToBeCorrectlyCopied(bookAuthorFromDb, bookAuthor);
  expect(bookAuthor.info.bio).toEqual(bookAuthor.info.bio);
});

test("saving and retrieving Admin", async () => {
  const admin = await getFakeAdmin({
    password: await makePassword({ password: "Pass123$", isHashed: false }),
  });
  await userDb.save(admin);
  const adminFromDb = (await userDb.getById(admin.info.id)) as Admin;
  expect(adminFromDb).toBeInstanceOf(Admin);
  await expectUserInfoToBeCorrectlyCopied(adminFromDb, admin);
});

test("deleting a user", async () => {
  const customer = await getFakeCustomer();
  const { id } = customer.info;
  await userDb.save(customer);
  expect(await userDb.getById(id)).not.toBeNull();
  const { wasDeleted } = await userDb.deleteById(id);
  expect(await userDb.getById(id)).toBeNull();
  expect(wasDeleted).toBe(true);
});

test("trying to delete a user that does not exist", async () => {
  const id = "123321";
  expect(await userDb.getById(id)).toBeNull();
  const { wasDeleted } = await userDb.deleteById(id);
  expect(wasDeleted).toBe(false);
});

test("getByEmail", async () => {
  expect(await userDb.getByEmail("bob@mail.com")).toBeNull();
  const customer = await getFakeCustomer({ email: "bob@mail.com" });
  await userDb.save(customer);
  const customerFromDb = (await userDb.getByEmail("bob@mail.com"))!;
  expect(customerFromDb).toBeInstanceOf(Customer);
  expect(customerFromDb.info.id).toEqual(customer.info.id);
});
