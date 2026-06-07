// ── Constants ─────────────────────────────────────────────────

const SYMBOLS = ['btcusdt', 'ethusdt', 'solusdt', 'xrpusdt', 'usdcusdt', 'bnbusdt', 'dogeusdt', 'suiusdt'];

const WS_URL =
  'wss://stream.binance.com:9443/stream?streams=' +
  SYMBOLS.map(s => `${s}@miniTicker`).join('/');

const BATCH_INTERVAL_MS = 50;
const RECONNECT_DELAY_MS = 5000;

// ── Types ─────────────────────────────────────────────────────

interface PriceUpdate {
  symbol: string;
  price: number;
}

interface CryptoState {
  prices: ReadonlyMap<string, number>;
}

interface MiniTicker {
  c: string; // current close price
}

interface BinanceMessage {
  stream: string;
  data: MiniTicker;
}

// ── EventBatcher ──────────────────────────────────────────────

class EventBatcher<T> {
  private buffer: T[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly onFlush: (batch: T[]) => void,
    private readonly interval = BATCH_INTERVAL_MS,
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
    this.buffer = []; // atomic swap — events during flush go to next batch
    this.onFlush(batch);
  }
}

// ── CryptoModel (ModelFactory) ────────────────────────────────

class CryptoModel {
  private readonly prices = new Map<string, number>();
  private readonly listeners = new Set<(state: CryptoState) => void>();

  setState(updates: PriceUpdate[]): void {
    for (const { symbol, price } of updates) {
      this.prices.set(symbol, price);
    }
    this.notify();
  }

  subscribe(listener: (state: CryptoState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const state: CryptoState = { prices: this.prices };
    for (const listener of this.listeners) listener(state);
  }
}

// ── WebSocket reconnect generator ─────────────────────────────
//
// while (true) loop: yield a fresh WebSocket each iteration.
// After each yield, await its close event (or abort signal),
// then await a delay before the next connection attempt.
// AbortSignal cuts both awaits short — no dangling timers or sockets.

async function* wsReconnect(
  url: string,
  signal: AbortSignal,
): AsyncGenerator<WebSocket> {
  while (true) {
    const ws = new WebSocket(url);
    yield ws;

    // Wait for socket to close (error also closes it)
    await new Promise<void>(resolve => {
      const done = (): void => resolve();
      ws.addEventListener('close', done, { once: true });
      ws.addEventListener('error', () => { ws.close(); done(); }, { once: true });
      signal.addEventListener('abort', () => { ws.close(); done(); }, { once: true });
    });

    if (signal.aborted) return;

    // Wait before reconnecting; abort cuts the delay short
    await new Promise<void>(resolve => {
      const t = setTimeout(resolve, RECONNECT_DELAY_MS);
      signal.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
    });

    if (signal.aborted) return;
  }
}

// ── WebSocket consumer ────────────────────────────────────────

async function runWebSocket(
  onMessage: (update: PriceUpdate) => void,
  signal: AbortSignal,
): Promise<void> {
  for await (const ws of wsReconnect(WS_URL, signal)) {
    ws.addEventListener('message', (event: MessageEvent<string>) => {
      const msg = JSON.parse(event.data) as BinanceMessage;
      const symbol = msg.stream.replace('@miniTicker', '');
      const price = parseFloat(msg.data.c);
      if (!isNaN(price)) onMessage({ symbol, price });
    });
  }
}

// ── Helpers ───────────────────────────────────────────────────

function formatPrice(price: number): string {
  if (price >= 1000) {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 1)    return '$' + price.toFixed(3);
  if (price >= 0.01) return '$' + price.toFixed(4);
  return '$' + price.toFixed(5);
}

function buildPriceMap(): Map<string, HTMLElement> {
  const map = new Map<string, HTMLElement>();
  document.querySelectorAll<HTMLElement>('.crypto-item[data-symbol]').forEach(item => {
    const symbol = item.dataset.symbol!;
    const el = item.querySelector<HTMLElement>('.crypto-item__price');
    if (el) map.set(symbol, el);
  });
  return map;
}

// ── Public API ────────────────────────────────────────────────

export function initCryptoPrices(): () => void {
  const domMap  = buildPriceMap();
  const model   = new CryptoModel();
  const batcher = new EventBatcher<PriceUpdate>(
    batch => model.setState(batch),
  );

  const unsubscribe = model.subscribe(({ prices }) => {
    prices.forEach((price, symbol) => {
      const el = domMap.get(symbol);
      if (el) el.textContent = formatPrice(price);
    });
  });

  batcher.start();

  const controller = new AbortController();

  void runWebSocket(
    update => batcher.push(update),
    controller.signal,
  );

  return () => {
    controller.abort(); // exits the while(true) loop and both awaits
    batcher.stop();     // flushes remaining buffer, clears interval
    unsubscribe();
  };
}
