export class EventBatcher<T> {
  private buffer: T[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly onFlush: (batch: T[]) => void,
    private readonly interval = 50,
  ) {}

  push(event: T): void {
    this.buffer.push(event);
  }

  start(): void {
    if (this.timer !== null) return;
    this.timer = setInterval(() => this.flush(), this.interval);
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
  }

  private flush(): void {
    if (this.buffer.length === 0) return;
    const batch = this.buffer;
    this.buffer = [];
    this.onFlush(batch);
  }
}
