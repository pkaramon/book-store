export default async function fakeHashPassword(pass: string) {
  return `###${pass}###`;
}
