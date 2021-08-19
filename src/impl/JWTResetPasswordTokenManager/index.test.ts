import JWTResetPasswordTokenManager from ".";

const tokenManager = new JWTResetPasswordTokenManager("123321");
test("creating and validating a token", async () => {
  const token = await tokenManager.create({
    userId: "1",
    email: "bob@mail.com",
    expiresInMinutes: 1,
  });

  const { isValid, userId } = await tokenManager.verify(token);
  expect(isValid).toBe(true);
  expect(userId).toBe("1");
});

function wait(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

test("trying to verify a token after expiration", async () => {
  const seconds = 1;
  const token = await tokenManager.create({
    userId: "1",
    email: "bob@mail.com",
    expiresInMinutes: seconds / 60,
  });
  expect(await tokenManager.verify(token)).toEqual({
    isValid: true,
    userId: "1",
  });
  await wait(seconds);
  expect(await tokenManager.verify(token)).toEqual({ isValid: false });
});

test("trying to verify invalid token", async () => {
  expect(await tokenManager.verify("garbage token")).toEqual({
    isValid: false,
  });
});
