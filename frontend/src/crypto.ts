import { EventBatcher }                              from './event-batcher';
import { CryptoModel, CryptoEntry, CryptoState, PriceUpdate } from './crypto-model';
import { CryptoWebSocket }                           from './crypto-ws';

const SYMBOLS = ['btcusdt', 'ethusdt', 'solusdt', 'xrpusdt', 'usdcusdt', 'bnbusdt', 'dogeusdt', 'suiusdt'];
const WS_URL  = 'wss://stream.binance.com:9443/stream?streams=' + SYMBOLS.map(s => `${s}@miniTicker`).join('/');
const BATCH_INTERVAL_MS = 50;

export class CryptoManager {
  private readonly model:       CryptoModel;
  private readonly batcher:     EventBatcher<PriceUpdate>;
  private readonly domMap:      Map<string, CryptoEntry>;
  private readonly unsubscribe: () => void;
  private ws: CryptoWebSocket | null = null;

  constructor() {
    this.model  = new CryptoModel();
    this.domMap = this.buildPriceMap();
    this.batcher = new EventBatcher<PriceUpdate>(
      batch => this.model.setState(batch),
      BATCH_INTERVAL_MS,
    );
    this.unsubscribe = this.model.subscribe(state => this.render(state));
  }

  start(): void {
    this.batcher.start();
    this.ws = new CryptoWebSocket(WS_URL, update => this.batcher.push(update));
    this.ws.start();
  }

  dispose(): void {
    this.ws?.stop();
    this.batcher.stop();
    this.unsubscribe();
  }

  private render({ prices }: CryptoState): void {
    prices.forEach((price, symbol) => {
      const entry = this.domMap.get(symbol);
      if (!entry) return;
      const formatted = CryptoManager.formatPrice(price);
      entry.priceEl.textContent = formatted;
      entry.itemEl.setAttribute('aria-label', `${entry.name}: ${formatted}`);
    });
  }

  private buildPriceMap(): Map<string, CryptoEntry> {
    const map = new Map<string, CryptoEntry>();
    document.querySelectorAll<HTMLElement>('.crypto-item[data-symbol]').forEach(item => {
      const symbol  = item.dataset.symbol!;
      const priceEl = item.querySelector<HTMLElement>('.crypto-item__price');
      const nameEl  = item.querySelector<HTMLElement>('.crypto-item__name');
      if (priceEl && nameEl) {
        map.set(symbol, { priceEl, itemEl: item, name: nameEl.textContent ?? symbol });
      }
    });
    return map;
  }

  private static formatPrice(price: number): string {
    if (price >= 1000) return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1)    return '$' + price.toFixed(3);
    if (price >= 0.01) return '$' + price.toFixed(4);
    return '$' + price.toFixed(5);
  }
}
