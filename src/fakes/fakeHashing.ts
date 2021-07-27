export async function fakeHashPassword(pass: string) {
  return `###${pass}###`;
}

export async function fakeComparePasswords({
  hashed,
  notHashed,
}: {
  hashed: string;
  notHashed: string;
}) {
  return (await fakeHashPassword(notHashed)) === hashed;
}
