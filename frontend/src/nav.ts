import { trapFocus } from './a11y';

const burgerBtn   = document.getElementById('burger-btn')!;
const navMenu     = document.getElementById('nav-menu')!;
const navOverlay  = document.getElementById('nav-overlay')!;
const navCloseBtn = document.getElementById('nav-close-btn')!;
const navItems    = navMenu.querySelectorAll<HTMLAnchorElement>('.nav-menu__item');

let releaseTrap: (() => void) | null = null;

function openMenu(): void {
  navMenu.classList.add('is-open');
  navOverlay.classList.add('is-visible');
  navMenu.setAttribute('aria-hidden', 'false');
  burgerBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  releaseTrap = trapFocus(navMenu);
  navCloseBtn.focus();
}

export function closeMenu(): void {
  if (!navMenu.classList.contains('is-open')) return;
  navMenu.classList.remove('is-open');
  navOverlay.classList.remove('is-visible');
  navMenu.setAttribute('aria-hidden', 'true');
  burgerBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  releaseTrap?.();
  releaseTrap = null;
  burgerBtn.focus();
}

export function initMobileNav(): void {
  burgerBtn.addEventListener('click', openMenu);
  navCloseBtn.addEventListener('click', closeMenu);
  navOverlay.addEventListener('click', closeMenu);

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth < 1024) closeMenu();
    });
  });
}
