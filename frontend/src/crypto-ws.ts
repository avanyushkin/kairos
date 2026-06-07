import type { PriceUpdate } from './crypto-model';

const RECONNECT_DELAY_MS  = 5_000;
const WATCHDOG_TIMEOUT_MS = 15_000;

interface MiniTicker {
  c: string;
}

interface BinanceMessage {
  stream: string;
  data:   MiniTicker;
}

export class CryptoWebSocket {
  private readonly controller = new AbortController();

  constructor(
    private readonly url:     string,
    private readonly onPrice: (update: PriceUpdate) => void,
  ) {}

  start(): void {
    void this.run();
  }

  stop(): void {
    this.controller.abort();
  }

  private async run(): Promise<void> {
    for await (const ws of this.reconnect()) {
      let watchdog: ReturnType<typeof setTimeout> | null = null;

      const resetWatchdog = (): void => {
        if (watchdog !== null) clearTimeout(watchdog);
        watchdog = setTimeout(() => ws.close(), WATCHDOG_TIMEOUT_MS);
      };

      const clearWatchdog = (): void => {
        if (watchdog !== null) { clearTimeout(watchdog); watchdog = null; }
      };

      ws.addEventListener('open',  resetWatchdog, { once: true });
      ws.addEventListener('close', clearWatchdog, { once: true });
      ws.addEventListener('message', (event: MessageEvent<string>) => {
        resetWatchdog();
        if (event.data === 'ping') { ws.send('pong'); return; }
        this.handleMessage(event.data);
      });
    }
  }

  private handleMessage(data: string): void {
    const msg    = JSON.parse(data) as BinanceMessage;
    const symbol = msg.stream.replace('@miniTicker', '');
    const price  = parseFloat(msg.data.c);
    if (!isNaN(price)) this.onPrice({ symbol, price });
  }

  private async *reconnect(): AsyncGenerator<WebSocket> {
    const { signal } = this.controller;

    while (true) {
      const ws = new WebSocket(this.url);
      yield ws;

      await new Promise<void>(resolve => {
        const done = (): void => resolve();
        ws.addEventListener('close', done, { once: true });
        ws.addEventListener('error', () => { ws.close(); done(); }, { once: true });
        signal.addEventListener('abort', () => { ws.close(); done(); }, { once: true });
      });

      if (signal.aborted) return;

      await new Promise<void>(resolve => {
        const t = setTimeout(resolve, RECONNECT_DELAY_MS);
        signal.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
      });

      if (signal.aborted) return;
    }
  }
}
