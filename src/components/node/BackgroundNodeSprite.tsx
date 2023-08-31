import { Container, Sprite, Texture } from "pixi.js";
import { Assets } from "../../common";

export class BackgroundNodeSprite {
  private sprite: Sprite;

  constructor() {
    const textureFile = (() => {
      const samples = [
        Assets.RoundedRect.MockBackground1,
        Assets.RoundedRect.MockBackground2,
        Assets.RoundedRect.MockBackground3,
        Assets.RoundedRect.MockBackground4,
      ];
      return samples[Math.floor(Math.random() * samples.length)];
    })();

    this.sprite = new Sprite(Texture.from(textureFile));

    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.alpha = 1;
    this.sprite.name = "Background";
  }

  public getInstance(): Container {
    return this.sprite;
  }
}
