const playVideoBtn  = document.getElementById('play-video-btn')!;
const learnMoreBtn  = document.getElementById('learn-more-btn')!;

const videoPopup         = document.getElementById('video-popup')!;
const videoPopupClose    = document.getElementById('video-popup-close')!;
const videoPopupBackdrop = document.getElementById('video-popup-backdrop')!;
const popupVideo         = document.getElementById('popup-video') as HTMLVideoElement;

const learnPopup         = document.getElementById('learn-popup')!;
const learnPopupClose    = document.getElementById('learn-popup-close')!;
const learnPopupBackdrop = document.getElementById('learn-popup-backdrop')!;

// ── Video popup ───────────────────────────────────────────────

function openVideoPopup(): void {
  videoPopup.classList.add('is-open');
  videoPopup.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  popupVideo.play().catch(() => { /* user can play via controls */ });
  videoPopupClose.focus();
}

export function closeVideoPopup(): void {
  if (!videoPopup.classList.contains('is-open')) return;
  videoPopup.classList.remove('is-open');
  videoPopup.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  popupVideo.pause();
  playVideoBtn.focus();
}

// ── Learn More popup ──────────────────────────────────────────

function openLearnPopup(): void {
  learnPopup.classList.add('is-open');
  learnPopup.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  learnPopupClose.focus();
}

export function closeLearnPopup(): void {
  if (!learnPopup.classList.contains('is-open')) return;
  learnPopup.classList.remove('is-open');
  learnPopup.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  learnMoreBtn.focus();
}

// ── Init ──────────────────────────────────────────────────────

export function initPopups(): void {
  playVideoBtn.addEventListener('click', openVideoPopup);
  videoPopupClose.addEventListener('click', closeVideoPopup);
  videoPopupBackdrop.addEventListener('click', closeVideoPopup);

  learnMoreBtn.addEventListener('click', openLearnPopup);
  learnPopupClose.addEventListener('click', closeLearnPopup);
  learnPopupBackdrop.addEventListener('click', closeLearnPopup);
}
