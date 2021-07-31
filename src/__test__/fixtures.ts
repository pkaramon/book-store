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
