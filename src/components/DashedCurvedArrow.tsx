import { SimpleRope, Texture, Ticker } from "pixi.js";
import { Assets, Colors } from "./../common";
import { Viewport } from "./../pixi/Viewport";
import { Edge } from "./../state/Edge";

export class DashedLine extends SimpleRope {
  private _edge: Edge;
  public id: string;

  constructor({ edge }: { edge: Edge }) {
    super(Texture.from(Assets.DashedLine.Line), edge.getPath(), 0.1);
    this.name = `edge-${edge.id}`;
    this.eventMode = "none";
    this.tint = Colors.DASHED_LINE_STROKE;
    this._edge = edge;
    this.id = edge.id;
    Ticker.shared.add(() => this.update());
  }

  private update() {
    if (Viewport.getInstance().scale.x < 0.3) {
      this.renderable = false;
    } else {
      this.renderable = true;
    }
    if (this.getEdge().isHovered) {
      this.tint = Colors.DASHED_LINE_HOVER;
    } else {
      this.tint = Colors.DASHED_LINE_STROKE;
    }
  }

  public getEdge(): Edge {
    return this._edge;
  }
}
