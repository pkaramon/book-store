import fs from "fs/promises";
import path from "path";
import initTemplatingEngine from ".";
import hbs from "handlebars";

const templatesDirPath = path.join(__dirname, "TEST_TEMPLATES_DIR");
const partialsDirPath = path.join(templatesDirPath, "partials/");

beforeAll(async () => {
  await fs.rm(templatesDirPath, { recursive: true, force: true });
  await fs.mkdir(templatesDirPath);
  await fs.mkdir(partialsDirPath);
  await fs.mkdir(path.join(templatesDirPath, "inner"));
  await fs.writeFile(path.join(templatesDirPath, "registered.hbs"), "{{name}}");
  await fs.writeFile(path.join(templatesDirPath, "another.hbs"), "{{age}}");
  await fs.writeFile(
    path.join(templatesDirPath, "inner/", "innertemplate.hbs"),
    "{{age}}"
  );
  await fs.writeFile(
    path.join(partialsDirPath, "user.hbs"),
    "NAME: {{name}} AGE: {{age}}"
  );
});
afterAll(async () => {
  await fs.rm(templatesDirPath, { recursive: true, force: true });
});

it("finds and initializes all the templates", async () => {
  const { templates } = await initTemplatingEngine(templatesDirPath);

  expect(templates.has("registered")).toBe(true);
  expect(templates.has("another")).toBe(true);
  expect(templates.has("inner/innertemplate")).toBe(true);

  const user = { name: "Peter", age: 42 };
  expect(templates.get("registered")!(user)).toEqual("Peter");
  expect(templates.get("another")!(user)).toEqual("42");
  expect(templates.get("inner/innertemplate")!(user)).toEqual("42");
});

it("finds and initializes partials", async () => {
  await initTemplatingEngine(templatesDirPath);
  const template = hbs.compile(`{{> user name=user.name age=user.age }}`);
  expect(template({ user: { name: "Peter", age: 42 } })).toEqual(
    "NAME: Peter AGE: 42"
  );
});

it("finds partials in nested directories", async () => {
  await fs.mkdir(path.join(partialsDirPath, "nested"), { recursive: true });
  await fs.writeFile(
    path.join(partialsDirPath, "nested", "nested-partial.hbs"),
    "{{age}}"
  );
  await initTemplatingEngine(templatesDirPath);

  const template = hbs.compile(`{{> nested/nested-partial age=user.age }}`);
  expect(template({ user: { name: "Peter", age: 42 } })).toEqual("42");
});
