import {
  IApplicationOptions,
  ICanvas,
  Application as PixiApplication,
} from "pixi.js";

export class Application {
  private constructor() {}
  private static instance: PixiApplication<ICanvas>;

  private static options: Partial<IApplicationOptions> = {
    antialias: true,
    backgroundAlpha: 0,
    autoDensity: true,
    // resizeTo: window,
    resolution: window.devicePixelRatio,
    hello: true,
    height: window.innerHeight,
    width: window.innerWidth,
  };

  public static getInstance() {
    if (!this.instance) {
      // const canvas = document.createElement("canvas");
      // const view = canvas.transferControlToOffscreen();
      this.instance = new PixiApplication({ ...this.options });
      // document.body.appendChild(canvas);
    }
    return this.instance;
  }
}
