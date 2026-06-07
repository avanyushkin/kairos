export class HeroVideo {
  private readonly video: HTMLVideoElement | null;

  constructor() {
    this.video = document.getElementById('hero-video') as HTMLVideoElement | null;
    if (!this.video) return;
    this.init();
  }

  private init(): void {
    const video = this.video!;
    video.muted      = true;
    video.autoplay   = true;
    video.loop       = true;
    video.playsInline = true;

    const tryPlay = (): void => {
      if (!video.paused) return;
      video.play().catch(() => {});
    };

    video.addEventListener('canplay',    tryPlay, { once: true });
    video.addEventListener('loadeddata', tryPlay, { once: true });
    document.addEventListener('touchstart', tryPlay, { once: true, passive: true });
    tryPlay();
  }
}
