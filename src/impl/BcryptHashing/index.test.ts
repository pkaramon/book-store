import { makeBcryptPassword } from ".";

const makePassword = makeBcryptPassword;

test("creating and validation passwords", async () => {
  const pass = await makePassword({ isHashed: false, password: "Pass123$" });
  expect(await pass.isEqual("Pass123$")).toBe(true);
  expect(await pass.isEqual("Pass123#")).toBe(false);
  expect(pass.hashedString()).not.toBe("Pass123$");
});

test("creating password objects with isHashed set to true", async () => {
  const password = await makePassword({
    isHashed: false,
    password: "Pass123$",
  });
  const pass = await makePassword({
    isHashed: true,
    password: password.hashedString(),
  });
  expect(await pass.isEqual("Pass123$")).toBe(true);
  expect(pass.hashedString()).toEqual(password.hashedString());
});
