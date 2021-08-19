import JWTManager from ".";
import { TokenVerificationError } from "../../auth/VerifyToken";
import { expectThrownErrorToMatch } from "../../__test_helpers__";

const privateKey = "a2826d76-8f8c-41c7-b99f-7637ad637a6d";
const manager = new JWTManager(privateKey);

test("creating and verifing tokens tokens", async () => {
  const token = await manager.createTokenFor("1");
  await manager.verifyToken(token);
});

test("verifing invalid token", async () => {
  await expectThrownErrorToMatch(
    () => manager.verifyToken("invalid blablabla"),
    { class: TokenVerificationError, invalidToken: "invalid blablabla" }
  );
});
