import './style.css';

import { initHeader }                        from './header';
import { initMobileNav, closeMenu }           from './nav';
import { initPopups, closeVideoPopup, closeLearnPopup } from './popups';
import { initHeroVideo }                      from './hero';
import { initAuth }                           from './auth';
import { initCryptoPrices }                   from './crypto';

initHeader();
initMobileNav();
initPopups();
initHeroVideo();
initAuth();
initCryptoPrices();

// Global Escape key: close whichever layer is open
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return;
  closeMenu();
  closeVideoPopup();
  closeLearnPopup();
});
