import FakeTokenManager from "../../fakes/FakeTokenManager";
import { getThrownError } from "../../__test_helpers__";
import { TokenVerificationError } from "../VerifyToken";
import userAuthDecorator from ".";

async function createMessage(data: { clientId: string; name: string }) {
  return { message: `Hi I am ${data.name}. Id = ${data.clientId}` };
}

const tokenManager = new FakeTokenManager();
const usecase = userAuthDecorator(createMessage, {
  verifyToken: tokenManager.verifyToken,
  idPropertyName: "clientId",
  tokenPropertyName: "clientToken",
});

test("authentication failed", async () => {
  const err = await getThrownError(() =>
    usecase({ clientToken: "#&@11*31", name: "Bob" })
  );
  expect(err).toBeInstanceOf(TokenVerificationError);
});

test("authentication passed", async () => {
  const { message } = await usecase({
    clientToken: await tokenManager.createTokenFor("7"),
    name: "Bob",
  });
  expect(message).toEqual(`Hi I am Bob. Id = 7`);
});
