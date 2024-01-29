import { Texture, TilingSprite } from "pixi.js";
import { Assets, Colors } from "../../common";
import { Application } from "../../pixi/Application";
import { Viewport } from "../../pixi/Viewport";

export class BackgroundGridLayer {
  private tile: TilingSprite;
  private maxViewportVisibilityScale: number;
  private minViewportVisibilityScale: number;

  constructor({
    scale,
    maxViewportVisibilityScale,
    minViewportVisibilityScale,
  }: {
    scale: number;
    maxViewportVisibilityScale: number;
    minViewportVisibilityScale: number;
  }) {
    this.maxViewportVisibilityScale = maxViewportVisibilityScale;
    this.minViewportVisibilityScale = minViewportVisibilityScale;
    this.tile = new TilingSprite(Texture.from(Assets.Common.Background));

    this.tile.tint = Colors.BACKGROUND;
    this.tile.tileScale.set(scale, scale);

    this.adjustGridPosition();
  }

  public adjustGridPosition() {
    this.tile.renderable =
      Viewport.getInstance().scale.x < this.maxViewportVisibilityScale &&
      Viewport.getInstance().scale.x >= this.minViewportVisibilityScale;

    this.tile.tilePosition.y = -Viewport.getInstance().top;
    this.tile.tilePosition.x = -Viewport.getInstance().left;

    this.tile.y = Viewport.getInstance().top;
    this.tile.x = Viewport.getInstance().left;
    this.tile.width =
      Application.getInstance().screen.width / Viewport.getInstance().scale.x;
    this.tile.height =
      Application.getInstance().screen.height / Viewport.getInstance().scale.y;
  }

  public getInstance(): TilingSprite {
    return this.tile;
  }
}

/*
this.scale = 0.5;
this.min = 0.8;
this.max = 2;

====
Viewport.scaleX = 1;
tilingScale = this.scale + (Viewport.scaleX - this.min) = 0.7;





*/
