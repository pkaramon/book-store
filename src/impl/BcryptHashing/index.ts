import MakePassword from "../../domain/Password/MakePassword";
import bcrypt from "bcrypt";
import Password from "../../domain/Password";

export const makeBcryptPassword: MakePassword = async ({
  isHashed,
  password,
}) => {
  if (isHashed) {
    return new BcryptPassword(password);
  } else {
    const hashed = await bcrypt.hash(password, 5);
    return new BcryptPassword(hashed);
  }
};

class BcryptPassword implements Password {
  constructor(private hashed: string) {}

  hashedString(): string {
    return this.hashed;
  }

  async isEqual(notHashed: string): Promise<boolean> {
    return await bcrypt.compare(notHashed, this.hashed);
  }
}
