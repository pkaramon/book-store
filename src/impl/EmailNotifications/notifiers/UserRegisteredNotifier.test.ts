import getFakeCustomer from "../../../testObjects/FakeCustomer";
import UserRegisteredNotifier from "./UserRegisteredNotifier";

test("sends email with right data", async () => {
  const gateway = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };
  const template = jest.fn().mockReturnValue("template content");
  const notifier = new UserRegisteredNotifier(gateway, template, "new subject");
  const user = await getFakeCustomer({ email: "bob@mail.com" });
  await notifier.notify(user);
  expect(gateway.sendEmail).toHaveBeenCalledWith({
    to: "bob@mail.com",
    content: "template content",
    subject: "new subject",
  });
  expect(template).toHaveBeenCalledWith({ userInfo: user.info });
});
