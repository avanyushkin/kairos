import './style.css';

import { Header }        from './header';
import { MobileNav }     from './nav';
import { Popup }         from './popup';
import { VideoPopup }    from './video-popup';
import { HeroVideo }     from './hero';
import { AuthManager }   from './auth';
import { CryptoManager } from './crypto';

const nav = new MobileNav();
new Header();
new HeroVideo();
new AuthManager();

const videoPopup = new VideoPopup(
  document.getElementById('video-popup')!,
  document.getElementById('play-video-btn')!,
  document.getElementById('video-popup-close')!,
  document.getElementById('popup-video') as HTMLVideoElement,
  document.getElementById('video-popup-backdrop')!,
);

const learnPopup = new Popup(
  document.getElementById('learn-popup')!,
  document.getElementById('learn-more-btn')!,
  document.getElementById('learn-popup-close')!,
  document.getElementById('learn-popup-backdrop')!,
);

const crypto = new CryptoManager();
crypto.start();

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return;
  nav.close();
  videoPopup.close();
  learnPopup.close();
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => crypto.dispose());
}
