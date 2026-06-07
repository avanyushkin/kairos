// ── Constants ─────────────────────────────────────────────────

const SYMBOLS = ['btcusdt', 'ethusdt', 'solusdt', 'xrpusdt', 'usdcusdt', 'bnbusdt', 'dogeusdt', 'suiusdt'];

const WS_URL =
  'wss://stream.binance.com:9443/stream?streams=' +
  SYMBOLS.map(s => `${s}@miniTicker`).join('/');

const BATCH_INTERVAL_MS = 50;

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
//
// Accumulates events and flushes them as a single batch every
// BATCH_INTERVAL_MS milliseconds.
//
// Buffer swap before flush is the key invariant: any event that
// arrives while flush() is executing goes into the *next* batch,
// never into the one currently being processed.

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
    this.flush(); // drain any remaining events before teardown
  }

  private flush(): void {
    if (this.buffer.length === 0) return;
    const batch = this.buffer;
    this.buffer = []; // atomic swap — new events go to fresh buffer
    this.onFlush(batch);
  }
}

// ── CryptoModel (ModelFactory) ────────────────────────────────
//
// Holds the canonical price state. setState merges a batch of
// updates in a single pass, then notifies all subscribers once.

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
    for (const listener of this.listeners) {
      listener(state);
    }
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

function connectWebSocket(
  onMessage: (update: PriceUpdate) => void,
  onClose: () => void,
): WebSocket {
  const ws = new WebSocket(WS_URL);

  ws.addEventListener('message', (event: MessageEvent<string>) => {
    const msg = JSON.parse(event.data) as BinanceMessage;
    const symbol = msg.stream.replace('@miniTicker', '');
    const price = parseFloat(msg.data.c);
    if (!isNaN(price)) onMessage({ symbol, price });
  });

  ws.addEventListener('error', () => ws.close());
  ws.addEventListener('close', onClose);

  return ws;
}

// ── Public API ────────────────────────────────────────────────
//
// Returns a dispose function — call it to stop the WebSocket,
// flush the batcher, and unsubscribe from the model (unmount).

export function initCryptoPrices(): () => void {
  const domMap  = buildPriceMap();
  const model   = new CryptoModel();
  const batcher = new EventBatcher<PriceUpdate>(
    batch => model.setState(batch),
  );

  // Model → DOM: one render per batch
  const unsubscribe = model.subscribe(({ prices }) => {
    prices.forEach((price, symbol) => {
      const el = domMap.get(symbol);
      if (el) el.textContent = formatPrice(price);
    });
  });

  batcher.start();

  let ws: WebSocket;

  const reconnect = (): void => {
    ws = connectWebSocket(
      update => batcher.push(update),
      ()     => setTimeout(reconnect, 5000),
    );
  };

  reconnect();

  return () => {
    ws.removeEventListener('close', reconnect);
    ws.close();
    batcher.stop();
    unsubscribe();
  };
}
