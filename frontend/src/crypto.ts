const SYMBOLS = ['btcusdt', 'ethusdt', 'solusdt', 'xrpusdt', 'usdcusdt', 'bnbusdt', 'dogeusdt', 'suiusdt'];

const WS_URL =
  'wss://stream.binance.com:9443/stream?streams=' +
  SYMBOLS.map(s => `${s}@miniTicker`).join('/');

interface MiniTicker {
  c: string; // current close price
}

interface BinanceMessage {
  stream: string;
  data: MiniTicker;
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 1) return '$' + price.toFixed(3);
  if (price >= 0.01) return '$' + price.toFixed(4);
  return '$' + price.toFixed(5);
}

function buildPriceMap(): Map<string, HTMLElement> {
  const map = new Map<string, HTMLElement>();
  document.querySelectorAll<HTMLElement>('.crypto-item[data-symbol]').forEach(item => {
    const symbol = item.dataset.symbol!;
    const priceEl = item.querySelector<HTMLElement>('.crypto-item__price');
    if (priceEl) map.set(symbol, priceEl);
  });
  return map;
}

function connect(priceMap: Map<string, HTMLElement>): void {
  const ws = new WebSocket(WS_URL);

  ws.addEventListener('message', (event: MessageEvent<string>) => {
    const msg = JSON.parse(event.data) as BinanceMessage;
    const symbol = msg.stream.replace('@miniTicker', '');
    const priceEl = priceMap.get(symbol);
    if (!priceEl) return;
    const price = parseFloat(msg.data.c);
    if (!isNaN(price)) priceEl.textContent = formatPrice(price);
  });

  ws.addEventListener('error', () => ws.close());

  ws.addEventListener('close', () => {
    setTimeout(() => connect(priceMap), 5000);
  });
}

export function initCryptoPrices(): void {
  const priceMap = buildPriceMap();
  if (priceMap.size === 0) return;
  connect(priceMap);
}
