
export default function nCharString(n: number) {
  const str: string[] = [];
  for (let i = 0; i < n; i++) {
    str.push("x");
  }
  return str.join("");
}
