import { gsap } from "gsap";
import { Container, Sprite, Texture } from "pixi.js";
import { Assets, Colors } from "./../../common";

export class InteractiveNodeSprite {
  private sprite: Sprite;

  private showAnimation: gsap.core.Tween;

  constructor() {
    this.sprite = new Sprite(Texture.from(Assets.RoundedRect.DefaultStroke));

    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.alpha = 0;
    this.sprite.name = "Interactive";

    this.showAnimation = gsap.to(this.sprite, {
      pixi: { alpha: 1 },
      duration: 0.5,
      paused: true,
    });
  }

  public getInstance(): Container {
    return this.sprite;
  }

  public show(): void {
    this.showAnimation.restart();
  }

  public hide(): void {
    this.showAnimation.reverse();
  }

  public setIsClicked(): void {
    this.sprite.tint = Colors.NODE_CLICK;
  }

  public setIsHovered(): void {
    this.sprite.tint = Colors.NODE_HOVER;
  }
}
