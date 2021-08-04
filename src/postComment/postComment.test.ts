import { TokenVerificationError } from "../auth/VerifyToken";
import getFakeBook from "../fakes/FakeBook";
import FakeClock from "../fakes/FakeClock";
import FakeTokenManager from "../fakes/FakeTokenManager";
import InMemoryBookDb from "../fakes/InMemoryBookDb";
import makeComment from "../fakes/makeComment";
import {
  createBuildHelper,
  expectThrownErrorToMatch,
  getThrownError,
} from "../__test__/fixtures";
import buildPostComment from "./imp";
import {
  BookNotFound,
  CouldNotCompleteRequest,
  InputData,
  InvalidCommentData,
} from "./interface";

const tm = new FakeTokenManager();
const clock = new FakeClock({ now: new Date(2020, 1, 1) });
const bookDb = new InMemoryBookDb();
const buildPostCommentHelper = createBuildHelper(buildPostComment, {
  getBookById: bookDb.getById,
  verifyUserAuthToken: tm.verifyToken,
  now: clock.now,
  makeComment,
  saveBook: bookDb.save,
});
const postComment = buildPostCommentHelper({});

const userId = "101";
let userAuthToken: string;
const bookId = "1";
const comment = {
  bookId,
  stars: 4,
  title: "comment title",
  body: "comment body",
};

beforeEach(async () => {
  bookDb.clear();
  bookDb.save(await getFakeBook({ id: bookId }));
  userAuthToken = await tm.createTokenFor(userId);
});

test("userAuthToken is invalid", async () => {
  const err: TokenVerificationError = await getThrownError(() =>
    postComment({ userAuthToken: "!invalid token", comment })
  );
  expect(err).toBeInstanceOf(TokenVerificationError);
  expect(err.invalidToken).toBe("!invalid token");
});

test("book does not exist", async () => {
  const err: BookNotFound = await getThrownError(() =>
    postComment({ userAuthToken, comment: { ...comment, bookId: "123321" } })
  );
  expect(err).toBeInstanceOf(BookNotFound);
  expect(err.bookId).toBe("123321");
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
    await expectValidationToFail(
      { body: "" },
      { body: ["body cannot be empty"] }
    );
    await expectValidationToFail(
      { body: " " },
      { body: ["body cannot be empty"] }
    );
  });
});

test("creating a comment", async () => {
  const { createdComment } = await postComment({
    comment,
    userAuthToken,
  });
  const book = (await bookDb.getById(bookId))!;
  const comments = await book.getAllComments();
  expect(comments).toHaveLength(1);
  const com = comments[0];
  expect(com.info.bookId).toEqual(comment.bookId);
  expect(com.info.title).toEqual(comment.title);
  expect(com.info.body).toEqual(comment.body);
  expect(com.info.stars).toEqual(comment.stars);
  expect(com.info.createdAt).toEqual(clock.now());
  expect(com.info.authorId).toEqual(userId);
  expect(typeof com.info.id).toBe("string");
  expect(createdComment).toMatchObject({ ...com.info });
});

test("makeComment has unexpected failure", async () => {
  const commentError = new Error("comment err");
  const postComment = buildPostCommentHelper({
    makeComment: jest.fn().mockRejectedValue(commentError),
  });
  await expectThrownErrorToMatch(
    () => postComment({ comment, userAuthToken }),
    {
      class: CouldNotCompleteRequest,
      message: "could not create comment",
      originalError: commentError,
    }
  );
});

test("getBookById failure", async () => {
  const postComment = buildPostCommentHelper({
    getBookById: jest.fn().mockRejectedValue(new Error("db err")),
  });
  await expectThrownErrorToMatch(
    () => postComment({ comment, userAuthToken }),
    {
      class: CouldNotCompleteRequest,
      message: "could not get book from db",
      originalError: new Error("db err"),
    }
  );
});

test("saveBook failure", async () => {
  const postComment = buildPostCommentHelper({
    saveBook: jest.fn().mockRejectedValue(new Error("save err")),
  });
  await expectThrownErrorToMatch(
    () => postComment({ comment, userAuthToken }),
    {
      class: CouldNotCompleteRequest,
      message: "could not save book to db",
      originalError: new Error("save err"),
    }
  );
});

async function expectValidationToFail(
  newData: Partial<InputData["comment"]>,
  expectedErrorMessages: Partial<Record<keyof InputData["comment"], string[]>>
) {
  const err: InvalidCommentData = await getThrownError(() =>
    postComment({ userAuthToken, comment: { ...comment, ...newData } })
  );
  expect(err).toBeInstanceOf(InvalidCommentData);
  expect(err.errorMessages).toMatchObject(expectedErrorMessages);
  expect(err.invalidProperties).toMatchObject(
    expect.arrayContaining(Reflect.ownKeys(expectedErrorMessages))
  );
}

async function expectValidationToPass(newData: Partial<InputData["comment"]>) {
  await postComment({ userAuthToken, comment: { ...comment, ...newData } });
}
