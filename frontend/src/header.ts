export class Header {
  private readonly element      = document.getElementById('header')!;
  private readonly sections     = document.querySelectorAll<HTMLElement>('section[id]');
  private readonly mobileItems  = document.querySelectorAll<HTMLAnchorElement>('.nav-menu__item');
  private readonly desktopItems = document.querySelectorAll<HTMLAnchorElement>('.header__nav-item');

  constructor() {
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.onScroll();
  }

  private headerOffset(): number {
    return (
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '104',
        10,
      ) + 20
    );
  }

  private updateActiveNav(): void {
    const scrollY = window.scrollY + this.headerOffset();
    let currentId = '';

    this.sections.forEach(section => {
      if (section.offsetTop <= scrollY) currentId = section.id;
    });

    this.mobileItems.forEach(item => {
      const href = (item.getAttribute('href') ?? '').replace('#', '');
      item.classList.toggle('nav-menu__item--active', href === currentId);
    });

    this.desktopItems.forEach(item => {
      const href = (item.getAttribute('href') ?? '').replace('#', '');
      item.classList.toggle('header__nav-item--active', href === currentId);
    });
  }

  private onScroll(): void {
    this.element.classList.toggle('is-scrolled', window.scrollY > 10);
    this.updateActiveNav();
  }
}
