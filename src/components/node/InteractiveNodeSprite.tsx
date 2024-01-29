import { gsap } from "gsap";
import { Sprite, Texture } from "pixi.js";
import { Assets, Colors } from "./../../common";

export class InteractiveNodeSprite extends Sprite {
  private showAnimation: gsap.core.Tween;

  constructor() {
    super(Texture.from(Assets.RoundedRect.DefaultStroke));

    this.anchor.set(0.5, 0.5);
    this.alpha = 0;
    this.name = "Interactive";

    this.showAnimation = gsap.to(this, {
      pixi: { alpha: 1 },
      duration: 0.5,
      paused: true,
    });
  }

  public show(): void {
    this.showAnimation.restart();
  }

  public hide(): void {
    this.showAnimation.reverse();
  }

  public setIsClicked(): void {
    this.tint = Colors.NODE_CLICK;
  }

  public setIsHovered(): void {
    this.tint = Colors.NODE_HOVER;
  }
}
