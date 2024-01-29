import { Emitter } from "@pixi/particle-emitter";
import * as PIXI from "pixi.js";
import { Assets, Colors } from "../../common";
import { Application } from "../../pixi/Application";

export class ClickParticles {
  private static instance: ClickParticles;
  private emitter: Emitter;
  public particleContainer: PIXI.ParticleContainer;

  private constructor() {
    this.particleContainer = new PIXI.ParticleContainer();
    this.particleContainer.setProperties({
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true,
    });

    this.emitter = new Emitter(this.particleContainer, {
      particlesPerWave: 10,
      maxParticles: 50,
      frequency: 0.01,
      autoUpdate: true,
      emit: false,
      // emitterLifetime: -1,
      pos: {
        x: 0,
        y: 0,
      },
      lifetime: {
        min: 0.2,
        max: 0.5,
      },
      addAtBack: false,
      behaviors: [
        {
          type: "scale",
          config: {
            scale: {
              list: [
                {
                  value: 0.05,
                  time: 0,
                },
                {
                  value: 0.15,
                  time: 1,
                },
              ],
            },
          },
        },
        {
          type: "color",
          config: {
            color: {
              list: [
                {
                  value: (Colors.CLICK_PARTICLE + 1).toString(16),
                  time: 0,
                },
                {
                  value: Colors.CLICK_PARTICLE.toString(16),
                  time: 1,
                },
              ],
            },
          },
        },
        {
          type: "moveSpeed",
          config: {
            speed: {
              list: [
                {
                  value: 200,
                  time: 0,
                },
                {
                  value: 50,
                  time: 1,
                },
              ],
              isStepped: false,
            },
          },
        },
        {
          type: "rotationStatic",
          config: {
            min: 0,
            max: 360,
          },
        },
        {
          type: "spawnShape",
          config: {
            type: "circle",
            data: {
              x: 0,
              y: 0,
              radius: 10,
            },
          },
        },
        {
          type: "textureSingle",
          config: {
            texture: PIXI.Texture.from(Assets.DashedLine.Line),
          },
        },
      ],
    });

    PIXI.Ticker.shared.add(() => {
      if (this.emitter.emit)
        this.particleContainer.position =
          Application.getInstance().renderer.events.pointer;

      this.emitter.emit = false;
    });
  }

  public pop(): void {
    this.emitter.emit = true;
  }

  public static getInstance(): ClickParticles {
    if (!this.instance) {
      const instance = new ClickParticles();
      ClickParticles.instance = instance;

      return instance;
    }
    return this.instance;
  }
}
