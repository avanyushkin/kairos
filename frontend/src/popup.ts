import { FocusTrap } from './a11y';

export class Popup {
  private focusTrap: FocusTrap | null = null;

  constructor(
    private readonly element:       HTMLElement,
    private readonly triggerButton: HTMLElement,
    private readonly closeButton:   HTMLElement,
    backdrop?: HTMLElement,
  ) {
    triggerButton.addEventListener('click', () => this.open());
    closeButton.addEventListener('click',   () => this.close());
    backdrop?.addEventListener('click',     () => this.close());
  }

  open(): void {
    this.element.classList.add('is-open');
    this.element.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.onOpen();
    this.focusTrap = new FocusTrap(this.element);
    this.focusTrap.activate();
    this.closeButton.focus();
  }

  close(): void {
    if (!this.element.classList.contains('is-open')) return;
    this.element.classList.remove('is-open');
    this.element.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.onClose();
    this.focusTrap?.release();
    this.focusTrap = null;
    this.triggerButton.focus();
  }

  protected onOpen(): void {}
  protected onClose(): void {}
}
