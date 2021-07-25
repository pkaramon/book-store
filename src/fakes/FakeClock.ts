import { Clock } from "../publishBook/interface";

export default class FakeClock implements Clock {
  constructor(private data: { now: Date }) {
    this.now = this.now.bind(this);
  }

  now(): Date {
    return this.data.now;
  }
}
