import FakeTokenManager from "../../fakes/FakeTokenManager";
import { getThrownError } from "../../__test__/fixtures";
import buildUserAuthDecorator from ".";
import { TokenVerificationError } from "../VerifyToken";

async function createMessage(data: { userId: string; name: string }) {
  return { message: `Hi I am ${data.name}. UserId = ${data.userId}` };
}

const tokenManager = new FakeTokenManager();
const UserAuthDecorator = buildUserAuthDecorator(tokenManager.verifyToken);
const usecase = UserAuthDecorator(createMessage);

test("authentication failed", async () => {
  const err = await getThrownError(() =>
    usecase({ token: "#&@11*31", name: "Bob" })
  );
  expect(err).toBeInstanceOf(TokenVerificationError);
});

test("authentication passed", async () => {
  const { message } = await usecase({
    token: tokenManager.createTokenFor("7"),
    name: "Bob",
  });
  expect(message).toEqual(`Hi I am Bob. UserId = 7`);
});
