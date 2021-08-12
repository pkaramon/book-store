import { BookStatus } from "../domain/Book";
import getFakeBook from "../fakes/FakeBook";
import getFakeBookAuthor from "../fakes/FakeBookAuthor";
import InMemoryBookDb from "../fakes/InMemoryBookDb";
import InMemoryUserDb from "../fakes/InMemoryUserDb";
import { expectThrownErrorToMatch, rejectWith } from "../__test_helpers__";
import buildSearch from "./imp";
import { CouldNotCompleteRequest } from "./interface";

const bookDb = new InMemoryBookDb();
const userDb = new InMemoryUserDb();
const search = buildSearch({
  getBooksAndAuthorsWithMatchingTitle: (titleRegex) =>
    bookDb.getBooksAndAuthorsWithMatchingTitle(userDb.getById, titleRegex),
});

const bookAuthorData = {
  id: "ba1",
  firstName: "Jerry",
  lastName: "Smith",
};
beforeEach(async () => {
  bookDb.clear();
  userDb.clear();
  await userDb.save(await getFakeBookAuthor({ ...bookAuthorData }));
});

test("only finds books that are published", async () => {
  await saveBook({
    published: false,
    title: "Book 1",
    id: "b1",
  });
  await saveBook({
    published: true,
    title: "Book 2",
    id: "b2",
    numberOfPages: 250,
    price: { currency: "USD", cents: 1000 },
    description: "Book 2 description",
  });
  const { books } = await search("Book");
  expect(books).toHaveLength(1);
  const bookOutput = books[0];
  expect(bookOutput.id).toEqual("b2");
  expect(bookOutput.price.currency).toEqual("USD");
  expect(bookOutput.price.cents).toEqual(1000);
  expect(bookOutput.title).toEqual("Book 2");
  expect(bookOutput.description).toEqual("Book 2 description");
  expect(bookOutput.numberOfPages).toEqual(250);
  expect(bookOutput.author.id).toEqual(bookAuthorData.id);
  expect(bookOutput.author.firstName).toEqual(bookAuthorData.firstName);
  expect(bookOutput.author.lastName).toEqual(bookAuthorData.lastName);
});

test("finds reasonable results", async () => {
  await saveBook({ published: true, id: "b1", title: "Lord Of The Rings" });
  await saveBook({ published: true, id: "b2", title: "Lord Of The Flies" });
  await saveBook({ published: true, id: "b3", title: "Lord Of Something" });
  await saveBook({ published: true, id: "b4", title: "Harry Potter" });
  await saveBook({ published: true, id: "b5", title: "Hamlet" });

  const { books } = await search("lord of");
  const bookTitles = books.map((b) => b.title);
  expect(bookTitles).toHaveLength(3);
  expect(bookTitles).toEqual(
    expect.arrayContaining([
      "Lord Of The Rings",
      "Lord Of The Flies",
      "Lord Of Something",
    ])
  );
});

test("db failure", async () => {
  const search = buildSearch({
    getBooksAndAuthorsWithMatchingTitle: rejectWith(new Error("db err")),
  });
  await expectThrownErrorToMatch(() => search("query"), {
    class: CouldNotCompleteRequest,
    originalError: new Error("db err"),
  });
});

async function saveBook(data: {
  id: string;
  published: boolean;
  title: string;
  description?: string;
  price?: { currency: string; cents: number };
  numberOfPages?: number;
}) {
  const { id, title } = data;
  const status = data.published
    ? BookStatus.published
    : BookStatus.notPublished;
  await bookDb.save(
    await getFakeBook({
      id,
      title,
      status,
      authorId: bookAuthorData.id,
      price: data.price ?? { cents: 300, currency: "USD" },
      description: data.description ?? "book desc",
      numberOfPages: data.numberOfPages ?? 100,
    })
  );
}
