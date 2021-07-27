export async function getThrownError(fn: Function) {
  try {
    await fn();
    throw "should have thrown";
  } catch (e) {
    return e;
  }
}
