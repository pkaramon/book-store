import BookAuthor, { BookAuthorInfo } from "../domain/BookAuthor";
import makePassword from "./makePassword";

export default async function getFakeBookAuthor(
  newInfo?: Partial<BookAuthorInfo>
) {
  return new BookAuthor({
    id: "1",
    email: "bob@mail.com",
    firstName: "bob",
    lastName: "smith",
    birthDate: new Date(2000, 1, 1),
    password: await makePassword({ password: "Pass123$", isHashed: false }),
    bio: "My story begins...",
    ...newInfo,
  });
}
