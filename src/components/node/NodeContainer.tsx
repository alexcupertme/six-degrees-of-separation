import { gsap } from "gsap";
import { Back } from "gsap/all";
import {
  FederatedPointerEvent,
  Application as PixiApplication,
  Point,
  Sprite,
  Texture,
} from "pixi.js";
import { Assets } from "../../common";
import { StateMachine } from "../../state/StateMachine";
import { ClickParticles } from "../effects/ClickParticles";
import { MouseButton, NodeEvents, NodeState } from "./../../common/Enums";
import { Application } from "./../../pixi/Application";
import { Viewport } from "./../../pixi/Viewport";
import { Node } from "./../../state/Node";
import { InteractiveNodeSprite } from "./InteractiveNodeSprite";

const INITIAL_SCALE = new Point(0.01, 0.01);
const DEFAULT_SCALE = new Point(0.25, 0.25);
const SELECTED_SCALE = new Point(0.3, 0.3);

const createInitialAnimation = (to: gsap.TweenTarget) => {
  return gsap.to(to, {
    pixi: {
      scale: DEFAULT_SCALE.x,
    },
    duration: 1,
    ease: Back.easeIn.config(2),
    paused: true,
  });
};

const createBounceAnimation = (to: gsap.TweenTarget) => {
  return gsap.to(to, {
    pixi: {
      scale: SELECTED_SCALE.x,
    },
    duration: 0.5,
    ease: Back.easeOut.config(2),
    paused: true,
  });
};

export class RoundedRect extends Sprite {
  private bounceAnimation: gsap.core.Tween;
  private initialAnimation: gsap.core.Tween;

  private stateMachine: StateMachine;

  private interactiveSprite: InteractiveNodeSprite;

  private application: PixiApplication;

  private nodeReference: Node;

  public id: string;
  public dirty: boolean = false;

  constructor({ node }: { node: Node }) {
    const textureFile = (() => {
      const samples = [
        Assets.RoundedRect.MockBackground1,
        Assets.RoundedRect.MockBackground2,
        Assets.RoundedRect.MockBackground3,
        Assets.RoundedRect.MockBackground4,
      ];
      return samples[Math.floor(Math.random() * samples.length)];
    })();
    super(Texture.from(textureFile));
    this.nodeReference = node;
    this.id = node.id;

    this.interactiveSprite = new InteractiveNodeSprite();

    this.addChild(this.interactiveSprite);

    this.on("pointerover", () => this.handleMouseOver());
    this.on("pointerout", () => this.handleMouseOut());
    this.on("pointerdown", (e) => this.handleMouseDown(e));
    this.on("pointerup", () => this.handleMouseUp());
    this.on("tap", () => this.handleMouseUp());
    this.position = node.getReadonlyPoint();
    this.anchor.set(0.5, 0.5);

    this.eventMode = "static";
    this.zIndex = 0;
    this.scale = INITIAL_SCALE;

    this.bounceAnimation = createBounceAnimation(this);
    this.initialAnimation = createInitialAnimation(this);

    this.stateMachine = new StateMachine(NodeState.INITIAL);
    this.stateMachine.subscribe((state: NodeState) => {
      this.handleStateTransition(state);
    });
    this.stateMachine.start();

    this.application = Application.getInstance();
    this.application.ticker.add(() => this.update());
  }

  public getNode(): Node {
    return this.nodeReference;
  }

  private handleMouseOver() {
    this.stateMachine.send(NodeEvents.MOUSEOVER);
  }

  private handleMouseOut() {
    this.stateMachine.send(NodeEvents.MOUSEOUT);
  }

  private handleMouseDown(e: FederatedPointerEvent) {
    if (e.button === MouseButton.LEFT) {
      this.stateMachine.send(NodeEvents.DRAGSTART);
    }
  }

  private handleMouseUp() {
    this.stateMachine.send(NodeEvents.DRAGEND);
  }

  private update() {
    if (this.stateMachine.getCurrentState() === NodeState.DRAGGING) {
      Viewport.getInstance().eventMode = "auto";
      this.dirty = true;
      const newPosition = Viewport.localToViewportPoint(
        this.application.renderer.events.pointer.screen
      );
      this.position.set(newPosition.x, newPosition.y);
      this.nodeReference.changePoint(newPosition);
    }
  }

  private handleStateTransition(newValue: NodeState) {
    switch (newValue) {
      case NodeState.INITIAL:
        this.initialAnimation.play();
        break;
      case NodeState.IDLE:
        this.interactiveSprite.hide();
        this.bounceAnimation.reverse();
        this.getNode()
          .getEdges()
          .forEach((e) => (e.isHovered = false));
        break;
      case NodeState.HOVERED:
        this.interactiveSprite.show();
        this.interactiveSprite.setIsHovered();
        this.getNode()
          .getEdges()
          .forEach((e) => (e.isHovered = true));
        break;
      case NodeState.CLICKED:
        ClickParticles.getInstance().pop();
        Viewport.getInstance().eventMode = "dynamic";
        this.bounceAnimation.play();
        this.interactiveSprite.setIsClicked();
        break;
      case NodeState.DRAGGING:
        this.bounceAnimation.reverse();
        this.zIndex = 1;
        break;
    }
  }
}
