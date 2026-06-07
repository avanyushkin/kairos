const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export class FocusTrap {
  private readonly handler: (e: KeyboardEvent) => void;

  constructor(private readonly container: HTMLElement) {
    this.handler = this.onKeyDown.bind(this);
  }

  activate(): void {
    this.container.addEventListener('keydown', this.handler);
  }

  release(): void {
    this.container.removeEventListener('keydown', this.handler);
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(
      this.container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }
}
