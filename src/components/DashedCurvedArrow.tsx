import { SimpleRope, Texture } from "pixi.js";
import { Assets } from "./../common";
import { Application } from "./../pixi/Application";
import { Viewport } from "./../pixi/Viewport";
import { Edge } from "./../state/Edge";

export class DashedLine {
  private _instance: SimpleRope;
  private _edge: Edge;

  constructor({ edge }: { edge: Edge }) {
    const rope = new SimpleRope(
      Texture.from(Assets.DashedLine.Line),
      edge.getPath(),
      0.1
    );
    this._instance = rope;
    rope.name = `edge-${edge.id}`;
    rope.eventMode = "none";
    this._edge = edge;

    Application.getInstance().ticker.add(() => this.update());
  }

  private update() {
    if (Viewport.getInstance().scale.x < 0.3) {
      this._instance.renderable = false;
    } else {
      this._instance.renderable = true;
    }
  }

  public getInstance(): SimpleRope {
    return this._instance;
  }

  public getEdge(): Readonly<Edge> {
    return this._edge;
  }
}
