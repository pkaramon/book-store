import { TokenVerificationError } from "../auth/VerifyToken";
import { CommentContent } from "../domain/Comment";
import CommentContentValidatorImp from "../domain/CommentContentValidatorImp";
import getFakeComment from "../fakes/FakeComment";
import getFakeCustomer from "../fakes/FakeCustomer";
import FakeTokenManager from "../fakes/FakeTokenManager";
import InMemoryCommentDb from "../fakes/InMemoryCommentDb";
import InMemoryUserDb from "../fakes/InMemoryUserDb";
import {
  createBuildHelper,
  expectThrownErrorToMatch,
  rejectWith,
} from "../__test__/fixtures";
import buildEditComment from "./imp";
import {
  CommentNotFound,
  CouldNotCompleteRequest,
  Dependencies,
  InvalidNewCommentContent,
  NotCommentAuthor,
} from "./interface";

const userDb = new InMemoryUserDb();
const commentDb = new InMemoryCommentDb();
const tm = new FakeTokenManager();
const buildEditCommentHelper = createBuildHelper(buildEditComment, {
  verifyUserAuthToken: tm.verifyToken,
  commentContentValidator: new CommentContentValidatorImp(),
  getCommentById: commentDb.getById,
  saveComment: commentDb.save,
});
const editComment = buildEditCommentHelper({});

const authorId = "101";
const ordinaryUserId = "2";
const commentId = "10001";
let userAuthToken: string;
beforeEach(async () => {
  userDb.clear();
  commentDb.clear();
  await userDb.save(await getFakeCustomer({ id: authorId }));
  await userDb.save(await getFakeCustomer({ id: ordinaryUserId }));
  await commentDb.save(await getFakeComment({ id: commentId, authorId }));
  userAuthToken = await tm.createTokenFor(authorId);
});

test("userAuthToken is invalid", async () => {
  await expectThrownErrorToMatch(
    () =>
      editComment({
        userAuthToken: "#invalid#",
        commentId: "1",
        commentContent: {},
      }),
    { class: TokenVerificationError, invalidToken: "#invalid#" }
  );
});

test("comment does not exist", async () => {
  await expectThrownErrorToMatch(
    () =>
      editComment({
        userAuthToken,
        commentId: "123321",
        commentContent: {},
      }),
    { class: CommentNotFound, commentId: "123321" }
  );
});

test("user exists but is not the author of the comment", async () => {
  await expectThrownErrorToMatch(
    async () =>
      editComment({
        userAuthToken: await tm.createTokenFor(ordinaryUserId),
        commentId,
        commentContent: {},
      }),
    {
      class: NotCommentAuthor,
      userId: ordinaryUserId,
      commentId: commentId,
    }
  );
});

describe("data validation", () => {
  test("title if passed cannot be empty", async () => {
    const errorMessages = { title: ["title cannot be empty"] };
    await expectValidationToFail({ title: "" }, errorMessages);
    await expectValidationToFail({ title: "  " }, errorMessages);
    await expectValidationToPass({ title: "new title" });
    await expectValidationToPass({ title: undefined });
  });

  test("body if passed cannot be empty", async () => {
    const errorMessages = { body: ["body cannot be empty"] };
    await expectValidationToFail({ body: "" }, errorMessages);
    await expectValidationToFail({ body: "  " }, errorMessages);
    await expectValidationToPass({ body: "new title" });
    await expectValidationToPass({ body: undefined });
  });

  test("stars if passed must be an integer between 1 and 5", async () => {
    const errorMessages = {
      stars: ["stars must be an integer between 1 and 5"],
    };
    await expectValidationToFail({ stars: -1 }, errorMessages);
    await expectValidationToFail({ stars: 0 }, errorMessages);
    await expectValidationToFail({ stars: 2.5 }, errorMessages);
    await expectValidationToFail({ stars: 6 }, errorMessages);
    await expectValidationToPass({ stars: 1 });
    await expectValidationToPass({ stars: 3 });
  });

  test("multiple invalid properties", async () => {
    await expectValidationToFail(
      { title: "", body: "", stars: 42 },
      {
        title: ["title cannot be empty"],
        body: ["body cannot be empty"],
        stars: ["stars must be an integer between 1 and 5"],
      }
    );
    const comment = await commentDb.getById(commentId);
    expect(comment!.content.title).not.toBe("");
    expect(comment!.content.body).not.toBe("  ");
    expect(comment!.content.stars).not.toBe(42);
  });
});

test("updating title", async () => {
  const title = " new title 123  ";
  await editComment({ userAuthToken, commentId, commentContent: { title } });
  const comment = await commentDb.getById(commentId);
  expect(comment!.content.title).toBe("new title 123");
});

test("updating body", async () => {
  const body = " new body";
  await editComment({ userAuthToken, commentId, commentContent: { body } });
  const comment = await commentDb.getById(commentId);
  expect(comment!.content.body).toBe("new body");
});

test("updating stars", async () => {
  const stars = 1;
  await editComment({ userAuthToken, commentId, commentContent: { stars } });
  const comment = await commentDb.getById(commentId);
  expect(comment!.content.stars).toBe(stars);
});

test("updating multiple properties at a time", async () => {
  const content = {
    title: "new title",
    body: "new body",
    stars: 5,
  };
  const { modifiedComment } = await editComment({
    userAuthToken,
    commentId,
    commentContent: content,
  });
  const comment = (await commentDb.getById(commentId))!;
  expect(comment.content).toMatchObject(content);
  expect(modifiedComment).toMatchObject({
    ...comment.metadata,
    ...content,
  });
});

test("getCommentById failure", async () => {
  await expectToThrowCouldNotCompleteRequestGivenDeps(
    { getCommentById: rejectWith(new Error("db err")) },
    {
      message: "could not get comment from db",
      originalError: new Error("db err"),
    }
  );
});

test("saveComment failure", async () => {
  await expectToThrowCouldNotCompleteRequestGivenDeps(
    { saveComment: rejectWith(new Error("db err")) },
    {
      message: "could not save comment to db",
      originalError: new Error("db err"),
    }
  );
});

async function expectValidationToPass(data: Partial<CommentContent>) {
  await editComment({ userAuthToken, commentId, commentContent: data });
}

async function expectValidationToFail(
  data: Partial<CommentContent>,
  expectedErrorMessages: Partial<Record<keyof CommentContent, string[]>>
) {
  await expectThrownErrorToMatch(
    () =>
      editComment({
        userAuthToken,
        commentId,
        commentContent: data,
      }),
    {
      class: InvalidNewCommentContent,
      errorMessages: expectedErrorMessages,
      invalidProperties: Reflect.ownKeys(expectedErrorMessages) as any,
    }
  );
}

async function expectToThrowCouldNotCompleteRequestGivenDeps(
  deps: Partial<Dependencies>,
  errorData: { message: string; originalError: any }
) {
  const editComment = buildEditCommentHelper({
    ...deps,
  });
  await expectThrownErrorToMatch(
    () => editComment({ userAuthToken, commentId, commentContent: {} }),
    {
      class: CouldNotCompleteRequest,
      originalError: errorData.originalError,
      message: errorData.message,
    }
  );
}
