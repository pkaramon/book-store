import Clock from "../domain/Clock";

class TestClock implements Clock {
  private currentTime?: Date;

  now(): Date {
    return this.currentTime ?? new Date();
  }

  setCurrentTime(d: Date) {
    this.currentTime = d;
  }

  resetClock() {
    this.currentTime = undefined;
  }
}

const clock = new TestClock();
export default clock;
