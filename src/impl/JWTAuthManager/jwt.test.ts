import JWTAuthManager from ".";
import { TokenVerificationError } from "../../auth/VerifyToken";
import { expectThrownErrorToMatch } from "../../__test_helpers__";

const privateKey = "123321";
const manager = new JWTAuthManager(privateKey);

test("creating and verifing tokens", async () => {
  const token = await manager.createTokenFor("1");
  await manager.verifyToken(token);
});

test("verifing invalid token", async () => {
  await expectThrownErrorToMatch(
    () => manager.verifyToken("invalid blablabla"),
    {
      class: TokenVerificationError, 
      invalidToken: "invalid blablabla" 
    }
  );
});
