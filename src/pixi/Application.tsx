import * as PIXI from "pixi.js";

export class Application {
  private constructor() {}
  private static instance: PIXI.Application<PIXI.ICanvas>;

  private static options: Partial<PIXI.IApplicationOptions> = {
    antialias: true,
    backgroundAlpha: 0,
    autoDensity: true,
    resizeTo: window,
    resolution: window.devicePixelRatio,
    hello: true,
    height: window.innerHeight,
    width: window.innerWidth,
  };

  public static getInstance() {
    if (!this.instance) {
      this.instance = new PIXI.Application({ ...this.options });
    }
    return this.instance;
  }
}
