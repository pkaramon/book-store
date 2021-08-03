import Password from "../domain/Password";
import MakePassword from "../domain/Password/MakePassword";

export async function fakeHashPassword(pass: string) {
  return `###${pass}###`;
}

const makePassword: MakePassword = async ({ isHashed, password }) => {
  if (isHashed) {
    return new PasswordImp(password);
  } else {
    return new PasswordImp(await PasswordImp.hash(password));
  }
};

export default makePassword;

class PasswordImp implements Password {
  public static async hash(pass: string) {
    return `###${pass}###`;
  }

  constructor(private hashed: string) {}

  hashedString(): string {
    return this.hashed;
  }

  async isEqual(notHashed: string): Promise<boolean> {
    return (await PasswordImp.hash(notHashed)) === this.hashedString();
  }
}
