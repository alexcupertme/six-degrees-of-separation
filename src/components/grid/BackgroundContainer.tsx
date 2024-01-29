import { BackgroundGridLayer } from "./BackgroundGridLayer";

export class BackgroundContainer {
  private layers: BackgroundGridLayer[];

  constructor() {
    this.layers = [
      new BackgroundGridLayer({
        scale: 0.2,
        maxViewportVisibilityScale: 2,
        minViewportVisibilityScale: 0.8,
      }),
      new BackgroundGridLayer({
        scale: 0.4,
        maxViewportVisibilityScale: 0.8,
        minViewportVisibilityScale: 0.4,
      }),
      new BackgroundGridLayer({
        scale: 0.8,
        maxViewportVisibilityScale: 0.4,
        minViewportVisibilityScale: 0.2,
      }),
      new BackgroundGridLayer({
        scale: 1.6,
        maxViewportVisibilityScale: 0.2,
        minViewportVisibilityScale: 0.01,
      }),
    ];
  }

  public getInstance() {
    return this.layers.map((x) => x.getInstance());
  }

  public adjustPosition() {
    this.layers.forEach((x) => x.adjustGridPosition());
  }
}
