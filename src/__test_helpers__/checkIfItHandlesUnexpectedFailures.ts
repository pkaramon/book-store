import { expectThrownErrorToMatch, rejectWith } from ".";

export default async function checkIfItHandlesUnexpectedFailures<Deps>(data: {
  buildFunction: (deps: Deps) => (...args: any) => any;
  defaultDependencies: Deps;
  dependenciesToTest: (keyof Deps)[];
  validInputData: Parameters<ReturnType<typeof data.buildFunction>>;
  expectedErrorClass: new (...args: any) => any;
  beforeEach?: Function;
}) {
  for (const dependencyName of data.dependenciesToTest) {
    data.beforeEach && (await data.beforeEach());
    const usecase = data.buildFunction({
      ...data.defaultDependencies,
      [dependencyName]: rejectWith(new Error("err")),
    });

    await expectThrownErrorToMatch(() => usecase(...data.validInputData), {
      class: data.expectedErrorClass,
      originalError: new Error("err"),
    });
  }
}
