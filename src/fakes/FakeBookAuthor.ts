import { BookAuthorData } from "../domain/BookAuthor/MakeBookAuthor";
import makeBookAuthor from "./makeBookAuthor";
import makePassword from "./makePassword";

export default async function getFakeBookAuthor(
  newData?: Partial<BookAuthorData>
) {
  return makeBookAuthor({
    id: "1",
    email: "bob@mail.com",
    firstName: "bob",
    lastName: "smith",
    birthDate: new Date(2000, 1, 1),
    password: await makePassword({ password: "Pass123$", isHashed: false }),
    bio: "My story begins...",
    ...newData,
  });
}
