export default interface Password {
  hashedString(): string;
  isEqual(notHashed: string): Promise<boolean>;
}
