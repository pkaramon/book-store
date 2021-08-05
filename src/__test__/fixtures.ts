export async function getThrownError(fn: Function) {
  try {
    await fn();
    throw "should have thrown";
  } catch (e) {
    return e;
  }
}

export function createBuildHelper<D, F>(fn: (d: D) => F, defaultDeps: D) {
  return function buildHelper(newDeps: Partial<D>) {
    return fn({ ...defaultDeps, ...newDeps });
  };
}

export async function expectThrownErrorToMatch<E extends Error>(
  fn: Function,
  errorData: { class: new (...args: any) => E } & Partial<E>
) {
  try {
    await fn();
    throw new DidNotThrowError();
  } catch (e) {
    expect(e).toBeInstanceOf(errorData.class);
    for (const key in errorData) {
      if (key === "class") continue;
      if (key === undefined) continue;
      expect(e[key]).toEqual(errorData[key as keyof typeof errorData]);
    }
  }
}

export class DidNotThrowError extends Error {
  constructor() {
    super();
    this.name = DidNotThrowError.name;
  }
}

export function rejectWith(error: any) {
  return jest.fn().mockRejectedValue(error);
}

export function throws(error: any) {
  throw error;
}
