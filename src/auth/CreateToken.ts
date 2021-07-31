export default interface CreateToken {
  (userId: string): Promise<string>;
}
