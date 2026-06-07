import { Popup } from './popup';

export class VideoPopup extends Popup {
  constructor(
    element:       HTMLElement,
    triggerButton: HTMLElement,
    closeButton:   HTMLElement,
    private readonly video: HTMLVideoElement,
    backdrop?: HTMLElement,
  ) {
    super(element, triggerButton, closeButton, backdrop);
  }

  protected onOpen(): void {
    this.video.play().catch(() => {});
  }

  protected onClose(): void {
    this.video.pause();
  }
}
