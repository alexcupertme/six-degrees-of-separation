import { gsap } from "gsap";
import { Back } from "gsap/all";
import {
  Container,
  FederatedPointerEvent,
  Point,
  Sprite,
  Texture,
} from "pixi.js";
import {
  BaseActionObject,
  Interpreter,
  ResolveTypegenMeta,
  ServiceMap,
  StateMachine,
  TypegenDisabled,
  interpret,
} from "xstate";
import { Assets } from "./common";
import { Colors, MouseButton, NodeEvents, NodeState } from "./common/Enums";
import { Application } from "./pixi/Application";
import { Viewport } from "./pixi/Viewport";
import { Node } from "./state/Node";
import {
  NodeContext,
  NodeStateEvents,
  NodeTypestate,
  createStateMachine,
} from "./state/StateMachine";

const DEFAULT_SCALE = new Point(0.25, 0.25);
const SELECTED_SCALE = new Point(0.3, 0.3);

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

const createShowAnimation = (to: gsap.TweenTarget) => {
  return gsap.to(to, {
    pixi: { alpha: 1 },
    duration: 0.5,
    paused: true,
  });
};

export class RoundedRect {
  private bounceAnimation: gsap.core.Tween;
  private showAnimation: gsap.core.Tween;

  private stateMachine: StateMachine<
    NodeContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    NodeStateEvents,
    NodeTypestate
  >;

  private interpreter: Interpreter<
    NodeContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    NodeStateEvents,
    NodeTypestate,
    ResolveTypegenMeta<
      TypegenDisabled,
      NodeStateEvents,
      BaseActionObject,
      ServiceMap
    >
  >;

  private container: Container;
  private backgroundSprite: Sprite;
  private interactiveSprite: Sprite;

  private nodeReference: Node;

  constructor({
    position,
    id,
    node,
  }: {
    position: Point;
    id: number;
    node: Node;
  }) {
    const textureFile = (() => {
      const samples = [
        Assets.RoundedRect.MockBackground1,
        Assets.RoundedRect.MockBackground2,
        Assets.RoundedRect.MockBackground3,
        Assets.RoundedRect.MockBackground4,
      ];
      return samples[Math.floor(Math.random() * samples.length)];
    })();

    this.nodeReference = node;

    this.container = new Container();
    this.backgroundSprite = new Sprite(Texture.from(textureFile));
    this.interactiveSprite = new Sprite(
      Texture.from(Assets.RoundedRect.DefaultStroke)
    );

    // TODO: move these props to another classes
    this.container.addChild(this.backgroundSprite, this.interactiveSprite);

    this.container.on("pointerover", () => this.handleMouseOver());
    this.container.on("pointerout", () => this.handleMouseOut());
    this.container.on("pointerdown", (e) => this.handleMouseDown(e));
    this.container.on("pointerup", () => this.handleMouseUp());
    this.container.on("tap", () => this.handleMouseUp());
    this.container.eventMode = "static";
    this.container.position = position;
    this.container.zIndex = 0;
    this.container.scale = DEFAULT_SCALE;

    this.interactiveSprite.anchor.set(0.5, 0.5);
    this.interactiveSprite.alpha = 0;
    this.interactiveSprite.name = "Interactive";

    this.backgroundSprite.anchor.set(0.5, 0.5);
    this.backgroundSprite.alpha = 1;
    this.backgroundSprite.name = "Background";

    this.stateMachine = createStateMachine(id);
    this.interpreter = interpret(this.stateMachine).start();
    this.interpreter.subscribe((state) =>
      this.handleStateTransition(state.value as NodeState)
    );

    this.bounceAnimation = createBounceAnimation(this.container);
    this.showAnimation = createShowAnimation(this.interactiveSprite);

    Application.getInstance().ticker.add((dt) => this.update(dt));
  }

  public getInstance(): Container {
    return this.container;
  }

  private handleMouseOver() {
    this.interpreter.send({ type: NodeEvents.MOUSEOVER });
  }

  private handleMouseOut() {
    this.interpreter.send({ type: NodeEvents.MOUSEOUT });
  }

  private handleMouseDown(e: FederatedPointerEvent) {
    if (e.button === MouseButton.LEFT) {
      this.interpreter.send({ type: NodeEvents.DRAGSTART });
    }
  }

  private handleMouseUp() {
    this.interpreter.send({ type: NodeEvents.DRAGEND });
  }

  private update(deltaTime: number) {
    this.updateHittest(deltaTime);
    this.updatePosition(deltaTime);
  }

  private updateHittest(deltaTime: number) {
    if (
      Viewport.getInstance().scale.x < 0.4 ||
      !Viewport.getInstance().hitArea?.contains(
        this.container.position.x,
        this.container.position.y
      )
    ) {
      this.container.eventMode = "none";
    } else {
      this.container.eventMode = "static";
    }
  }

  private updatePosition(deltaTime: number) {
    const viewport = Viewport.getInstance();
    const app = Application.getInstance();
    if (this.interpreter.getSnapshot().value === NodeState.DRAGGING) {
      const newPosition = new Point(
        (app.renderer.events.pointer.screenX - viewport.lastViewport!.x) /
          viewport.lastViewport!.scaleX,
        (app.renderer.events.pointer.screenY - viewport.lastViewport!.y) /
          viewport.lastViewport!.scaleY
      );
      this.nodeReference.changePoint(newPosition);
      this.container.position = newPosition;
    }
  }

  private handleStateTransition(newValue: NodeState) {
    switch (newValue) {
      case NodeState.IDLE:
        this.showAnimation.reverse();
        this.bounceAnimation.reverse();
        break;
      case NodeState.HOVERED:
        this.showAnimation.restart();
        this.interactiveSprite.tint = Colors.NODE_HOVER;
        break;
      case NodeState.CLICKED:
        this.bounceAnimation.play();
        this.interactiveSprite.tint = Colors.NODE_CLICK;
        break;
      case NodeState.DRAGGING:
        this.bounceAnimation.reverse();
        this.container.zIndex = 1;
        break;
    }
  }
}
