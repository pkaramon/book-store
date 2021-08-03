import { TokenVerificationError } from "../auth/VerifyToken";
import FakeTokenManager from "../fakes/FakeTokenManager";
import { createBuildHelper, getThrownError } from "../__test__/fixtures";
import buildPostComment, {
  BookNotFound,
  InputData,
  InvalidCommentData,
} from "./imp";
import FakeClock from "../fakes/FakeClock";
import InMemoryCommentDb from "../fakes/InMemoryCommentDb";
import makeComment from "../fakes/makeComment";

const doesBookExist = async (bookId: string) => bookId === "1";
const commentDb = new InMemoryCommentDb();
const tm = new FakeTokenManager();
const clock = new FakeClock({ now: new Date(2020, 1, 1) });
const buildPostCommentHelper = createBuildHelper(buildPostComment, {
  doesBookExist,
  saveComment: commentDb.save,
  verifyUserAuthToken: tm.verifyToken,
  now: clock.now,
  makeComment,
});
const postComment = buildPostCommentHelper({});

const userId = "1";
let userAuthToken: string;
const comment = {
  bookId: "1",
  stars: 4,
  title: "comment title",
  body: "comment body",
};

beforeEach(async () => {
  commentDb.clear();
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
    postComment({ userAuthToken, comment: { ...comment, bookId: "123" } })
  );
  expect(err).toBeInstanceOf(BookNotFound);
  expect(err.bookId).toBe("123");
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
  const { commentId } = await postComment({
    comment,
    userAuthToken,
  });
  const com = await commentDb.getById(commentId);
  expect(com?.info.title).toEqual(comment.title);
  expect(com?.info.body).toEqual(comment.body);
  expect(com?.info.createdAt).toEqual(clock.now());
  expect(com?.info.stars).toEqual(comment.stars);
  expect(com?.info.authorId).toEqual(userId);
  expect(com?.info.bookId).toEqual(comment.bookId);
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
