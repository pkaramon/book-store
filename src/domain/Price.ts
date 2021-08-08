export default class Price {
  constructor(
    public readonly currency: string,
    public readonly cents: number
  ) {}
}
