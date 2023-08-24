import { SimpleRope, Texture } from "pixi.js";
import { Assets } from "./common";
import { Application } from "./pixi/Application";
import { Viewport } from "./pixi/Viewport";
import { Edge } from "./state/Edge";

export class DashedLine {
  private _instance: SimpleRope;

  constructor({ edge }: { edge: Edge }) {
    const rope = new SimpleRope(
      Texture.from(Assets.DashedLine.Line),
      edge.getPath(),
      0.2
    );
    this._instance = rope;

    rope.eventMode = "none";

    Application.getInstance().ticker.add((dt) => this.update(dt));
  }

  private update(deltaTime: number) {
    if (Viewport.getInstance().scale.x < 0.4) {
      this._instance.renderable = false;
    } else {
      this._instance.renderable = true;
    }
  }

  public getInstance(): SimpleRope {
    return this._instance;
  }
}
