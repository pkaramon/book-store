export default class FakeClock {
  constructor(private data: { now: Date }) {
    this.now = this.now.bind(this);
  }

  now(): Date {
    return this.data.now;
  }
}
