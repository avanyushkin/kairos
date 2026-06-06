export function initHeroVideo(): void {
  const heroVideo = document.getElementById('hero-video') as HTMLVideoElement | null;
  if (!heroVideo) return;

  heroVideo.muted      = true;
  heroVideo.autoplay   = true;
  heroVideo.loop       = true;
  heroVideo.playsInline = true;

  const tryPlay = (): void => {
    if (!heroVideo.paused) return;
    heroVideo.play().catch(() => { /* poster shown as fallback */ });
  };

  heroVideo.addEventListener('canplay',    tryPlay, { once: true });
  heroVideo.addEventListener('loadeddata', tryPlay, { once: true });
  // iOS Safari requires a user gesture — attach to first touchstart
  document.addEventListener('touchstart',  tryPlay, { once: true, passive: true });
  tryPlay();
}
