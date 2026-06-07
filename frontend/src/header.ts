export function initHeader(): void {
  const header         = document.getElementById('header')!;
  const sections       = document.querySelectorAll<HTMLElement>('section[id]');
  const mobileNavItems = document.querySelectorAll<HTMLAnchorElement>('.nav-menu__item');
  const desktopNavItems = document.querySelectorAll<HTMLAnchorElement>('.header__nav-item');

  function getHeaderOffset(): number {
    return (
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '104',
        10,
      ) + 20
    );
  }

  function updateActiveNav(): void {
    const scrollY = window.scrollY + getHeaderOffset();
    let currentId = '';

    sections.forEach(section => {
      if (section.offsetTop <= scrollY) currentId = section.id;
    });

    mobileNavItems.forEach(item => {
      const href = (item.getAttribute('href') ?? '').replace('#', '');
      item.classList.toggle('nav-menu__item--active', href === currentId);
    });

    desktopNavItems.forEach(item => {
      const href = (item.getAttribute('href') ?? '').replace('#', '');
      item.classList.toggle('header__nav-item--active', href === currentId);
    });
  }

  function onScroll(): void {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
    updateActiveNav();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
