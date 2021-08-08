export default function createBuildHelper<D, F>(
  fn: (d: D) => F,
  defaultDeps: D
) {
  return function buildHelper(newDeps: Partial<D>) {
    return fn({ ...defaultDeps, ...newDeps });
  };
}
