import DidNotThrowError from "./DidNotThrowError";

export default async function expectThrownErrorToMatch<E extends Error>(
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

