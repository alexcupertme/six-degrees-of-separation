import { BackgroundGridLayer } from "./BackgroundGridLayer";

export class BackgroundContainer {
  private layers: BackgroundGridLayer[];

  constructor() {
    this.layers = [
      new BackgroundGridLayer({
        scale: 0.3,
        maxViewportVisibilityScale: 2,
        minViewportVisibilityScale: 1,
      }),
      new BackgroundGridLayer({
        scale: 0.6,
        maxViewportVisibilityScale: 1,
        minViewportVisibilityScale: 0.5,
      }),
      new BackgroundGridLayer({
        scale: 0.9,
        maxViewportVisibilityScale: 0.5,
        minViewportVisibilityScale: 0.2,
      }),
      new BackgroundGridLayer({
        scale: 1.5,
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
