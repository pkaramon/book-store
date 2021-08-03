import Password from ".";

export default interface MakePassword {
  (data: { password: string; isHashed: boolean }): Promise<Password> | Password;
}
