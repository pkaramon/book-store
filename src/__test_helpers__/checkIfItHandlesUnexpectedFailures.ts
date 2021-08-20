import { getThrownError, rejectWith } from ".";

export default async function checkIfItHandlesUnexpectedFailures<
  Deps,
  BuildFunction extends (deps: Deps) => (...args: any) => any
>({
  buildFunction,
  defaultDependencies,
  dependenciesToTest,
  validInputData,
  expectedErrorClass,
  beforeEach,
}: {
  buildFunction: BuildFunction;
  defaultDependencies: Deps;
  dependenciesToTest: string[];
  validInputData: Parameters<ReturnType<BuildFunction>>;
  expectedErrorClass: new (...args: any) => any;
  beforeEach?: Function;
}) {
  for (const dependencyName of dependenciesToTest) {
    beforeEach && (await beforeEach());
    const dependencies = dependencyName.includes(".")
      ? buildBadDepsForMethod(dependencyName)
      : buildBadDepsForFunction(dependencyName);
    const usecase = buildFunction(dependencies);
    const error = await getThrownError(() =>
      usecase(...(validInputData as any))
    );
    if (!(error instanceof expectedErrorClass)) {
      throw `did not handle failure at ${dependencyName}`;
    }
    expect(error.originalError).toEqual(new Error("err"));
  }

  function buildBadDepsForMethod(accessor: string) {
    const [objectName, method] = accessor.split(".");
    const obj = Object.assign({}, (defaultDependencies as any)[objectName]);
    if (typeof obj[method] !== "function")
      throw new Error(`${accessor} is not a method`);
    obj[method] = rejectWith(new Error("err"));
    const dependencies = {
      ...defaultDependencies,
      [objectName]: obj,
    };
    return dependencies;
  }

  function buildBadDepsForFunction(functionName: string) {
    const fn = (defaultDependencies as any)[functionName];
    if (typeof fn !== "function")
      throw new Error(`${functionName} is not a function`);
    return {
      ...defaultDependencies,
      [functionName]: rejectWith(new Error("err")),
    };
  }
}
