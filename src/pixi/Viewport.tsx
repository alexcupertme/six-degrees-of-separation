import { Simple } from "pixi-cull";
import { IViewportOptions, Viewport as PixiViewport } from "pixi-viewport";
import { Container, DisplayObject, Ticker } from "pixi.js";
import { Application } from "./Application";

export class Viewport {
  private static viewport: PixiViewport;
  private static cullInstance: Simple;

  private static constructionOptions: IViewportOptions = {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    ticker: Ticker.system,
    events: Application.getInstance().renderer.events,
  };

  private static options = {
    zoom: {
      maxHeight: 10000,
      minHeight: 500,
    },
    drag: {
      clampWheel: true,
      mouseButtons: "right",
    },
  };

  public static getInstance() {
    if (!this.viewport) {
      this.viewport = new PixiViewport(this.constructionOptions);

      this.viewport
        .pinch()
        .wheel()
        .decelerate()
        .clampZoom({
          maxHeight: this.options.zoom.maxHeight,
          minHeight: this.options.zoom.minHeight,
        })
        .drag({
          clampWheel: this.options.drag.clampWheel,
          mouseButtons: this.options.drag.mouseButtons,
        });

      this.cullInstance = new Simple({ dirtyTest: true });

      Ticker.system.add((dt) => this.update(dt));
    }
    return this.viewport;
  }

  public static addChildren(...children: (DisplayObject | Container)[]) {
    this.viewport.addChild(...children);
    console.log(
      children
        .map((x) => {
          if ("sortDirty" in x) {
            return x.children! as DisplayObject[];
          } else return x;
        })
        .flat()
    );
    this.cullInstance.addList(
      children
        .map((x) => {
          if ("sortDirty" in x) {
            return x.children! as DisplayObject[];
          } else return x;
        })
        .flat()
    );
    this.cull();
  }

  private static cull() {
    const bounds = this.viewport.getVisibleBounds();
    bounds.x -= 50;
    bounds.y -= 50;
    bounds.height += 100;
    bounds.width += 100;
    this.cullInstance.cull(bounds);
  }

  private static update(deltaTime: number) {
    if (this.viewport.dirty) {
      this.cull();

      this.viewport.dirty = false;
    }
  }
}
