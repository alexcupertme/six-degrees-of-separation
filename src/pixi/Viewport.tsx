import { Simple } from "pixi-cull";
import { IViewportOptions, Viewport as PixiViewport } from "pixi-viewport";
import { Container, DisplayObject, Point, Rectangle, Ticker } from "pixi.js";
import { BackgroundContainer } from "../components/grid/BackgroundContainer";
import { Application } from "./Application";

export class Viewport {
  private static viewport: PixiViewport;
  private static cullInstance: Simple;
  private static frameCounter: number = 0;

  private static constructionOptions: IViewportOptions = {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldHeight: Infinity,
    worldWidth: Infinity,
    ticker: Ticker.system,
    events: Application.getInstance().renderer.events,
  };

  private static options = {
    zoom: {
      maxHeight: 20000,
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
        .decelerate({ friction: 0.99 })
        .clampZoom({
          maxHeight: this.options.zoom.maxHeight,
          minHeight: this.options.zoom.minHeight,
        })
        .drag({
          clampWheel: this.options.drag.clampWheel,
          mouseButtons: this.options.drag.mouseButtons,
        })
        .moveCenter(0, 0);

      this.cullInstance = new Simple({ dirtyTest: true });

      const background = new BackgroundContainer();
      this.viewport.addChild(...background.getInstance());
      this.viewport.on("moved", () => background.adjustPosition());

      Ticker.system.add(() => this.update());
    }
    return this.viewport;
  }

  public static addChildren(...children: (DisplayObject | Container)[]) {
    this.viewport.addChild(...children);
  }

  public static removeChildrenFromCulling(
    ...children: (DisplayObject | Container)[]
  ) {
    children.forEach((c) => this.cullInstance.remove(c));
  }
  public static addChildrenToCulling(
    ...children: (DisplayObject | Container)[]
  ) {
    children.forEach((c) => this.cullInstance.add(c));
  }

  public static localToViewportPoint(point: Point): Point {
    return new Point(
      Viewport.localToViewportCoordinate(point.x, "x"),
      Viewport.localToViewportCoordinate(point.y, "y")
    );
  }

  public static localToViewportRect(rect: Rectangle): Rectangle {
    return new Rectangle(
      Viewport.localToViewportCoordinate(rect.x, "x"),
      Viewport.localToViewportCoordinate(rect.y, "y"),
      rect.width,
      rect.height
    );
  }

  private static localToViewportCoordinate(
    unit: number,
    type: "x" | "y"
  ): number {
    if (type === "x") {
      return (
        (unit - this.viewport.lastViewport!.x) /
        this.viewport.lastViewport!.scaleX
      );
    } else
      return (
        (unit - this.viewport.lastViewport!.y) /
        this.viewport.lastViewport!.scaleY
      );
  }

  private static cull() {
    const bounds = this.viewport.getVisibleBounds();
    bounds.x -= 50;
    bounds.y -= 50;
    bounds.height += 100;
    bounds.width += 100;
    this.cullInstance.cull(bounds);
  }

  private static update() {
    this.frameCounter++;
    if (this.frameCounter % 20) {
      this.viewport.screenHeight = window.innerHeight;
      this.viewport.screenWidth = window.innerWidth;
    }
    if (this.viewport.dirty) {
      this.cull();

      this.viewport.dirty = false;
    }
  }
}
