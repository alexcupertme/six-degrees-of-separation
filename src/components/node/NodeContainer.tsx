import { gsap } from "gsap";
import { Back } from "gsap/all";
import { Viewport as PixiViewport } from "pixi-viewport";
import {
  Container,
  FederatedPointerEvent,
  Application as PixiApplication,
  Point,
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
import {
  NodeContext,
  NodeStateEvents,
  NodeTypestate,
  createStateMachine,
} from "../../state/StateMachine";
import { MouseButton, NodeEvents, NodeState } from "./../../common/Enums";
import { Application } from "./../../pixi/Application";
import { Viewport } from "./../../pixi/Viewport";
import { Node } from "./../../state/Node";
import { BackgroundNodeSprite } from "./BackgroundNodeSprite";
import { InteractiveNodeSprite } from "./InteractiveNodeSprite";

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

export class RoundedRect {
  private bounceAnimation: gsap.core.Tween;

  private stateMachine: StateMachine<
    NodeContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    NodeStateEvents,
    NodeTypestate
  >;

  // Rewrite to simple State Machine
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
  private backgroundSprite: BackgroundNodeSprite;
  private interactiveSprite: InteractiveNodeSprite;

  private viewport: PixiViewport;
  private application: PixiApplication;

  private stateValue: NodeState = NodeState.INITIAL;

  private nodeReference: Node;

  public id: string;

  constructor({ node }: { node: Node }) {
    this.nodeReference = node;
    this.id = node.id;

    this.container = new Container();
    this.backgroundSprite = new BackgroundNodeSprite();
    this.interactiveSprite = new InteractiveNodeSprite();

    // TODO: move these props to another classes
    this.container.addChild(
      this.backgroundSprite.getInstance(),
      this.interactiveSprite.getInstance()
    );

    this.container.on("pointerover", () => this.handleMouseOver());
    this.container.on("pointerout", () => this.handleMouseOut());
    this.container.on("pointerdown", (e) => this.handleMouseDown(e));
    this.container.on("pointerup", () => this.handleMouseUp());
    this.container.on("tap", () => this.handleMouseUp());
    this.container.position = node.getReadonlyPoint();
    this.container.name = `node-container-${node.id}`;

    this.container.eventMode = "static";
    this.container.zIndex = 0;
    this.container.scale = DEFAULT_SCALE;

    this.stateMachine = createStateMachine(node.id);
    this.interpreter = interpret(this.stateMachine).start();
    this.interpreter.subscribe((state) =>
      this.handleStateTransition(state.value as NodeState)
    );

    this.bounceAnimation = createBounceAnimation(this.container);

    this.application = Application.getInstance();
    this.viewport = Viewport.getInstance();

    this.application.ticker.add((dt) => this.update(dt));
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

  private update() {
    if (this.stateValue === NodeState.DRAGGING) {
      this.container.dirty = true;
      const newPosition = Viewport.localToViewportPoint(
        this.application.renderer.events.pointer.screen
      );
      this.container.position.set(newPosition.x, newPosition.y);
      this.nodeReference.changePoint(newPosition);
    }

    // if (this.viewport.scale.x < 0.3) {
    //   this.container.eventMode = "none";
    // } else {
    //   this.container.eventMode = "static";
    // }
  }

  private handleStateTransition(newValue: NodeState) {
    this.stateValue = newValue;
    switch (newValue) {
      case NodeState.IDLE:
        this.interactiveSprite.hide();
        this.bounceAnimation.reverse();
        break;
      case NodeState.HOVERED:
        this.interactiveSprite.show();
        this.interactiveSprite.setIsHovered();
        break;
      case NodeState.CLICKED:
        this.bounceAnimation.play();
        this.interactiveSprite.setIsClicked();
        break;
      case NodeState.DRAGGING:
        this.bounceAnimation.reverse();
        this.container.zIndex = 1;
        break;
    }
  }
}
