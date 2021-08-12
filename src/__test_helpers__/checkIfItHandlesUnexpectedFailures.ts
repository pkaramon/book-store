import { expectThrownErrorToMatch, rejectWith } from ".";

export default async function checkIfItHandlesUnexpectedFailures<
  Deps,
  BuildFunction extends (deps: Deps) => (...args: any) => any
>(data: {
  buildFunction: BuildFunction;
  defaultDependencies: Deps;
  dependenciesToTest: (keyof Deps)[];
  validInputData: Parameters<ReturnType<BuildFunction>>;
  expectedErrorClass: new (...args: any) => any;
  beforeEach?: Function;
}) {
  for (const dependencyName of data.dependenciesToTest) {
    data.beforeEach && (await data.beforeEach());
    const usecase = data.buildFunction({
      ...data.defaultDependencies,
      [dependencyName]: rejectWith(new Error("err")),
    });
    await expectThrownErrorToMatch(
      () => usecase(...(data.validInputData as any)),
      {
        class: data.expectedErrorClass,
        originalError: new Error("err"),
      }
    );
  }
}
