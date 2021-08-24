import hbs from "handlebars";

function combine(lines: string[]) {
  return lines.join("\n");
}

test("simple templates", () => {
  const template = hbs.compile(`Name: {{name}}`);
  expect(template({ name: "Peter" })).toBe("Name: Peter");
});

test("html template", () => {
  const lines = [
    "<h1>Welcome {{firstName}} {{lastName}}</h1>",
    "<p>age: {{age}}</p>",
  ];

  const template = hbs.compile(lines.join("\n"));
  expect(template({ firstName: "Bob", lastName: "Smith", age: 42 })).toEqual(
    combine(["<h1>Welcome Bob Smith</h1>", "<p>age: 42</p>"])
  );
});

test("dealing with simple arrays", () => {
  const template = hbs.compile(`{{#each names}}{{this}} {{/each}}`);
  expect(template({ names: ["Peter", "Bob"] })).toEqual("Peter Bob ");
});

test("dealing with arrays of objects", () => {
  const template = hbs.compile(`{{#users}}{{name}} is {{age}}. {{/users}}`);
  expect(
    template({
      users: [
        { name: "Peter", age: 42 },
        { name: "Bob", age: 32 },
      ],
    })
  ).toEqual("Peter is 42. Bob is 32. ");
});

test("nested objects", () => {
  const template = hbs.compile(`{{user.name}} {{user.age}}`);
  expect(
    template({
      user: { name: "Peter", age: 42 },
    })
  ).toEqual("Peter 42");
});

test("partials", () => {
  hbs.registerPartial("carlistview", `MAKE: {{car.make}} MODEL: {{car.model}}`);
  const template = hbs.compile(`{{#cars}}{{>carlistview car=.}}\n{{/cars}}`);
  expect(
    template({
      cars: [
        { make: "Ford", model: "Model T" },
        { make: "Toyota", model: "Camry" },
      ],
    })
  ).toEqual(
    combine(["MAKE: Ford MODEL: Model T", "MAKE: Toyota MODEL: Camry", ""])
  );
});

test("reuse with partials", () => {
  hbs.registerPartial(
    "start",
    combine([
      "<!DOCTYPE html>",
      '<html lang="en">',
      "<head>",
      '<meta charset="UTF-8">',
      "<title>{{title}}</title>",
      "</head>",
      "<body>\n",
    ])
  );
  hbs.registerPartial("end", combine(["</body>"]));

  const page = hbs.compile(
    combine([
      `{{>start title="hello"}}`,
      "<h1>Hello world!!!</h1>",
      "{{> end}}",
    ])
  );
  expect(page({})).toEqual(
    combine([
      "<!DOCTYPE html>",
      '<html lang="en">',
      "<head>",
      '<meta charset="UTF-8">',
      "<title>hello</title>",
      "</head>",
      "<body>",
      "<h1>Hello world!!!</h1>",
      "</body>",
    ])
  );
});
