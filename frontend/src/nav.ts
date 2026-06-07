import { FocusTrap } from './a11y';

export class MobileNav {
  private readonly burgerBtn   = document.getElementById('burger-btn')!;
  private readonly navMenu     = document.getElementById('nav-menu')!;
  private readonly navOverlay  = document.getElementById('nav-overlay')!;
  private readonly navCloseBtn = document.getElementById('nav-close-btn')!;
  private focusTrap: FocusTrap | null = null;

  constructor() {
    this.burgerBtn.addEventListener('click',   () => this.open());
    this.navCloseBtn.addEventListener('click', () => this.close());
    this.navOverlay.addEventListener('click',  () => this.close());

    this.navMenu.querySelectorAll<HTMLAnchorElement>('.nav-menu__item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth < 1024) this.close();
      });
    });
  }

  open(): void {
    this.navMenu.classList.add('is-open');
    this.navOverlay.classList.add('is-visible');
    this.navMenu.setAttribute('aria-hidden', 'false');
    this.burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    this.focusTrap = new FocusTrap(this.navMenu);
    this.focusTrap.activate();
    this.navCloseBtn.focus();
  }

  close(): void {
    if (!this.navMenu.classList.contains('is-open')) return;
    this.navMenu.classList.remove('is-open');
    this.navOverlay.classList.remove('is-visible');
    this.navMenu.setAttribute('aria-hidden', 'true');
    this.burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    this.focusTrap?.release();
    this.focusTrap = null;
    this.burgerBtn.focus();
  }
}
