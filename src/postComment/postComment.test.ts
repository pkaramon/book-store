import { TokenVerificationError } from "../auth/VerifyToken";
import { BookStatus } from "../domain/Book";
import CommentContentValidatorImp from "../domain/CommentContentValidatorImp";
import bookDb from "../testObjects/bookDb";
import clock from "../testObjects/clock";
import commentDb from "../testObjects/commentDb";
import getFakeBook from "../testObjects/FakeBook";
import getFakeBookAuthor from "../testObjects/FakeBookAuthor";
import getFakeCustomer from "../testObjects/FakeCustomer";
import tokenManager from "../testObjects/tokenManager";
import userDb from "../testObjects/userDb";
import {
  checkIfItHandlesUnexpectedFailures,
  expectThrownErrorToMatch,
  getThrownError,
} from "../__test_helpers__";
import buildPostComment from "./imp";
import {
  BookNotFound,
  BookNotPublished,
  CouldNotCompleteRequest,
  InputData,
  InvalidCommentContent,
  InvalidUserType,
  UserNotFound,
} from "./interface";

const dependencies = {
  getBookById: bookDb.getById.bind(bookDb),
  verifyUserAuthToken: tokenManager.verifyToken,
  clock,
  getUserById: userDb.getById.bind(userDb),
  commentContentValidator: new CommentContentValidatorImp(),
  commentDb,
};
const postComment = buildPostComment(dependencies);

const posterId = "101";
const bookAuthorId = "102";
let userAuthToken: string;
const bookId = "1";
const comment = {
  bookId,
  stars: 4,
  title: "comment title",
  body: "comment body",
};

beforeEach(async () => {
  clock.resetClock();
  await bookDb.TEST_ONLY_clear();
  await userDb.TEST_ONLY_clear();
  await commentDb.TEST_ONLY_clear();
  bookDb.save(await getFakeBook({ id: bookId, authorId: bookAuthorId }));
  userDb.save(await getFakeCustomer({ id: posterId }));
  userDb.save(await getFakeBookAuthor({ id: bookAuthorId }));
  userAuthToken = await tokenManager.createTokenFor(posterId);
});

test("userAuthToken is invalid", async () => {
  const err: TokenVerificationError = await getThrownError(() =>
    postComment({ userAuthToken: "!invalid token", comment })
  );
  expect(err).toBeInstanceOf(TokenVerificationError);
  expect(err.invalidToken).toBe("!invalid token");
});

test("only customers can add comments", async () => {
  await expectThrownErrorToMatch(
    async () =>
      postComment({
        userAuthToken: await tokenManager.createTokenFor(bookAuthorId),
        comment,
      }),
    { class: InvalidUserType, userId: bookAuthorId }
  );
});

test("user does not exist", async () => {
  await expectThrownErrorToMatch(
    async () =>
      postComment({
        userAuthToken: await tokenManager.createTokenFor("123321"),
        comment,
      }),
    { class: UserNotFound, userId: "123321" }
  );
});

test("book does not exist", async () => {
  await expectThrownErrorToMatch(
    () =>
      postComment({ userAuthToken, comment: { ...comment, bookId: "123321" } }),
    { class: BookNotFound, bookId: "123321" }
  );
});

test("book is not published", async () => {
  const bookId = Math.random().toString();
  await bookDb.save(
    await getFakeBook({ id: bookId, status: BookStatus.notPublished })
  );
  await expectThrownErrorToMatch(
    () => postComment({ userAuthToken, comment: { ...comment, bookId } }),
    { class: BookNotPublished, bookId: bookId }
  );
});

describe("data validation", () => {
  test("stars must be an integer between 1 and 5", async () => {
    for (const stars of [0.5, 0, -1, 10, 6, 4.5])
      await expectValidationToFail(
        { stars },
        { stars: ["stars must be an integer between 1 and 5"] }
      );
    for (const stars of [1, 2, 3, 4, 5])
      await expectValidationToPass({ stars });
  });

  test("title cannot be empty", async () => {
    await expectValidationToFail(
      { title: "" },
      { title: ["title cannot be empty"] }
    );
    await expectValidationToFail(
      { title: " " },
      { title: ["title cannot be empty"] }
    );
  });

  test("body cannot be empty", async () => {
    for (const body of ["", " "])
      await expectValidationToFail(
        { body },
        { body: ["body cannot be empty"] }
      );
  });
});

test("creating a comment", async () => {
  clock.setCurrentTime(new Date(2020, 1, 1));
  const { createdComment } = await postComment({
    comment,
    userAuthToken,
  });
  const com = (await commentDb.getById(createdComment.id))!;
  expect(com.content.title).toEqual(comment.title);
  expect(com.content.body).toEqual(comment.body);
  expect(com.content.stars).toEqual(comment.stars);
  expect(com.metadata.bookId).toEqual(comment.bookId);
  expect(com.metadata.postedAt).toEqual(clock.now());
  expect(com.metadata.authorId).toEqual(posterId);
  expect(typeof com.metadata.id).toBe("string");
  expect(createdComment).toMatchObject({ ...com.metadata, ...com.content });
});

test("unexpected failures from dependencies", async () => {
  await checkIfItHandlesUnexpectedFailures({
    buildFunction: buildPostComment,
    dependenciesToTest: [
      "getBookById",
      "getUserById",
      "commentDb.save",
      "commentDb.generateId",
    ],
    defaultDependencies: dependencies,
    expectedErrorClass: CouldNotCompleteRequest,
    validInputData: [{ comment, userAuthToken }],
  });
});

async function expectValidationToFail(
  newData: Partial<InputData["comment"]>,
  expectedErrorMessages: Partial<Record<keyof InputData["comment"], string[]>>
) {
  const err: InvalidCommentContent = await getThrownError(() =>
    postComment({ userAuthToken, comment: { ...comment, ...newData } })
  );
  expect(err).toBeInstanceOf(InvalidCommentContent);
  expect(err.errorMessages).toMatchObject(expectedErrorMessages);
  expect(err.invalidProperties).toMatchObject(
    expect.arrayContaining(Reflect.ownKeys(expectedErrorMessages))
  );
}

async function expectValidationToPass(newData: Partial<InputData["comment"]>) {
  await postComment({ userAuthToken, comment: { ...comment, ...newData } });
}
