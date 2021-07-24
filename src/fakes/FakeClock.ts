import { Clock } from "../publishBook/interface";

export default class FakeClock implements Clock {
  constructor(private data: { now: Date }) {}
  now(): Date {
    return this.data.now;
  }
}
