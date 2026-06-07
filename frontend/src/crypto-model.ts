export interface PriceUpdate {
  symbol: string;
  price:  number;
}

export interface CryptoEntry {
  priceEl: HTMLElement;
  itemEl:  HTMLElement;
  name:    string;
}

export interface CryptoState {
  prices: ReadonlyMap<string, number>;
}

export class CryptoModel {
  private readonly prices    = new Map<string, number>();
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
