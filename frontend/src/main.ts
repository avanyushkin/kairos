import './style.css';

// ─── CONFIG ──────────────────────────────────────────────────
// Replace with your Google Cloud OAuth2 Client ID
// https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// ─── DOM REFS ────────────────────────────────────────────────
const header        = document.getElementById('header')!;
const burgerBtn     = document.getElementById('burger-btn')!;
const navMenu       = document.getElementById('nav-menu')!;
const navOverlay    = document.getElementById('nav-overlay')!;
const navCloseBtn   = document.getElementById('nav-close-btn')!;
const navItems      = navMenu.querySelectorAll<HTMLAnchorElement>('.nav-menu__item');
const headerNavItems = document.querySelectorAll<HTMLAnchorElement>('.header__nav-item');

const playVideoBtn  = document.getElementById('play-video-btn')!;
const learnMoreBtn  = document.getElementById('learn-more-btn')!;

const videoPopup         = document.getElementById('video-popup')!;
const videoPopupClose    = document.getElementById('video-popup-close')!;
const videoPopupBackdrop = document.getElementById('video-popup-backdrop')!;
const popupVideo         = document.getElementById('popup-video') as HTMLVideoElement;

const learnPopup         = document.getElementById('learn-popup')!;
const learnPopupClose    = document.getElementById('learn-popup-close')!;
const learnPopupBackdrop = document.getElementById('learn-popup-backdrop')!;

const googleSignInBtn    = document.getElementById('google-sign-in-btn')!;
const createAccountBtn   = document.getElementById('create-account-btn')!;
const tabButtons         = document.querySelectorAll<HTMLButtonElement>('.auth-card__tab');

// ─── HEADER SCROLL ───────────────────────────────────────────
function handleHeaderScroll(): void {
  header.classList.toggle('is-scrolled', window.scrollY > 10);
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();

// ─── MOBILE MENU ─────────────────────────────────────────────
function openMenu(): void {
  navMenu.classList.add('is-open');
  navOverlay.classList.add('is-visible');
  navMenu.setAttribute('aria-hidden', 'false');
  burgerBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  navCloseBtn.focus();
}

function closeMenu(): void {
  navMenu.classList.remove('is-open');
  navOverlay.classList.remove('is-visible');
  navMenu.setAttribute('aria-hidden', 'true');
  burgerBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  burgerBtn.focus();
}

burgerBtn.addEventListener('click', openMenu);
navCloseBtn.addEventListener('click', closeMenu);
navOverlay.addEventListener('click', closeMenu);

navItems.forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth < 1024) closeMenu();
  });
});

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return;
  if (navMenu.classList.contains('is-open'))   closeMenu();
  if (videoPopup.classList.contains('is-open')) closeVideoPopup();
  if (learnPopup.classList.contains('is-open')) closeLearnPopup();
});

// ─── VIDEO POPUP ─────────────────────────────────────────────
function openVideoPopup(): void {
  videoPopup.classList.add('is-open');
  videoPopup.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (popupVideo.src && popupVideo.paused) {
    popupVideo.play().catch(() => { /* autoplay blocked */ });
  }
  videoPopupClose.focus();
}

function closeVideoPopup(): void {
  videoPopup.classList.remove('is-open');
  videoPopup.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  popupVideo.pause();
  playVideoBtn.focus();
}

playVideoBtn.addEventListener('click', openVideoPopup);
videoPopupClose.addEventListener('click', closeVideoPopup);
videoPopupBackdrop.addEventListener('click', closeVideoPopup);

// ─── LEARN MORE POPUP ────────────────────────────────────────
function openLearnPopup(): void {
  learnPopup.classList.add('is-open');
  learnPopup.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  learnPopupClose.focus();
}

function closeLearnPopup(): void {
  learnPopup.classList.remove('is-open');
  learnPopup.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  learnMoreBtn.focus();
}

learnMoreBtn.addEventListener('click', openLearnPopup);
learnPopupClose.addEventListener('click', closeLearnPopup);
learnPopupBackdrop.addEventListener('click', closeLearnPopup);

// ─── HERO VIDEO AUTOPLAY ──────────────────────────────────────
const heroVideo = document.getElementById('hero-video') as HTMLVideoElement;

if (heroVideo) {
  heroVideo.muted     = true;
  heroVideo.autoplay  = true;
  heroVideo.loop      = true;
  heroVideo.playsInline = true;

  const tryPlay = (): void => {
    if (!heroVideo.paused) return;
    heroVideo.play().catch(() => { /* poster shown as fallback */ });
  };

  heroVideo.addEventListener('canplay',    tryPlay, { once: true });
  heroVideo.addEventListener('loadeddata', tryPlay, { once: true });
  // iOS Safari requires user gesture before play
  document.addEventListener('touchstart',  tryPlay, { once: true, passive: true });
  tryPlay();
}

// ─── AUTH TABS ────────────────────────────────────────────────
tabButtons.forEach(tab => {
  tab.addEventListener('click', () => {
    tabButtons.forEach(t => {
      t.classList.remove('auth-card__tab--active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('auth-card__tab--active');
    tab.setAttribute('aria-selected', 'true');
  });
});

// ─── GOOGLE OAuth2 ────────────────────────────────────────────
function handleGoogleCredential(response: CredentialResponse): void {
  // response.credential is a signed JWT ID token.
  // Send it to your backend for verification before trusting any data.
  // POST /api/auth/google  { token: response.credential }
  console.info('[Kairos] Google Sign-In successful.');

  try {
    const payloadB64 = response.credential.split('.')[1];
    const payload = JSON.parse(atob(payloadB64)) as { name?: string; email?: string };
    console.info('[Kairos] User:', payload.name, payload.email);
  } catch { /* ignore */ }

  // TODO: redirect or update UI
}

function initGoogleSignIn(): void {
  if (!window.google?.accounts?.id) return;

  if (GOOGLE_CLIENT_ID.startsWith('YOUR_')) {
    console.warn(
      '[Kairos] Google Sign-In: set GOOGLE_CLIENT_ID in src/main.ts\n' +
      'Get it at https://console.cloud.google.com/apis/credentials'
    );
    return;
  }

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback:  handleGoogleCredential,
    cancel_on_tap_outside: false,
    context:   'signin',
  });
}

const gsiReady = (): void => {
  if (window.google) initGoogleSignIn();
  else window.addEventListener('load', initGoogleSignIn, { once: true });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', gsiReady, { once: true });
} else {
  gsiReady();
}

googleSignInBtn.addEventListener('click', () => {
  if (!window.google?.accounts?.id) {
    console.warn('[Kairos] Google Identity Services not available.');
    return;
  }
  window.google.accounts.id.prompt();
});

createAccountBtn.addEventListener('click', () => {
  googleSignInBtn.click();
});

// ─── ACTIVE NAV HIGHLIGHT ON SCROLL ──────────────────────────
const sections = document.querySelectorAll<HTMLElement>('section[id]');

function updateActiveNav(): void {
  const scrollY = window.scrollY + var_headerHeight();
  let currentId = '';

  sections.forEach(section => {
    if (section.offsetTop <= scrollY) currentId = section.id;
  });

  navItems.forEach(item => {
    const href = (item.getAttribute('href') ?? '').replace('#', '');
    item.classList.toggle('nav-menu__item--active', href === currentId);
  });

  headerNavItems.forEach(item => {
    const href = (item.getAttribute('href') ?? '').replace('#', '');
    item.classList.toggle('header__nav-item--active', href === currentId);
  });
}

function var_headerHeight(): number {
  return parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '104',
    10
  ) + 20;
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();
