import DidNotThrowError from "./DidNotThrowError";

export default async function getThrownError(fn: Function) {
  try {
    await fn();
    throw new DidNotThrowError();
  } catch (e) {
    return e;
  }
}
