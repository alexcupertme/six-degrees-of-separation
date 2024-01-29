import { NodeEvents, NodeState } from "../common";

export class StateMachine {
  private currentState: NodeState;

  private subscribers: ((currentState: NodeState) => void)[] = [];

  private started: boolean = false;

  constructor(initialState: NodeState.INITIAL) {
    this.currentState = initialState;
  }

  public send(event: NodeEvents): void {
    const oldState = this.currentState;

    switch (this.currentState) {
      case NodeState.CLICKED:
        if (event === NodeEvents.DRAGSTART) {
          this.currentState = NodeState.DRAGGING;
        }
        if (event === NodeEvents.MOUSEOUT) {
          this.currentState = NodeState.IDLE;
        }
        break;
      case NodeState.DRAGGING:
        if (event === NodeEvents.DRAGEND) {
          this.currentState = NodeState.CLICKED;
        }
        break;
      case NodeState.HOVERED:
        if (event === NodeEvents.MOUSEOUT) {
          this.currentState = NodeState.IDLE;
        }
        if (event === NodeEvents.DRAGSTART) {
          this.currentState = NodeState.DRAGGING;
        }
        break;
      case NodeState.IDLE:
        if (event === NodeEvents.MOUSEOVER) {
          this.currentState = NodeState.HOVERED;
        }
        break;
      case NodeState.INITIAL:
        if (event === NodeEvents.MOUSEOVER) {
          this.currentState = NodeState.HOVERED;
        }
        break;
      default:
    }
    if (oldState !== this.currentState && this.started === true)
      this.subscribers.forEach((x) => x(this.currentState));
  }

  public subscribe(handler: (currentState: NodeState) => void) {
    this.subscribers.push(handler);
  }

  public start(): void {
    this.started = true;
    this.subscribers.forEach((x) => x(this.currentState));
  }

  public getCurrentState(): NodeState {
    return this.currentState;
  }
}

// Refactor to this:
// const a = {
//   initial: NodeState.INITIAL,
//   states: {
//     [NodeState.INITIAL]: {
//       on: {
//         [NodeEvents.MOUSEOVER]: NodeState.HOVERED,
//       },
//     },
//     [NodeState.IDLE]: {
//       on: {
//         [NodeEvents.MOUSEOVER]: NodeState.HOVERED,
//       },
//     },
//     [NodeState.HOVERED]: {
//       on: {
//         [NodeEvents.MOUSEOUT]: NodeState.IDLE,
//         [NodeEvents.DRAGSTART]: NodeState.DRAGGING,
//       },
//     },
//     [NodeState.DRAGGING]: {
//       on: {
//         [NodeEvents.DRAGEND]: NodeState.CLICKED,
//       },
//     },
//     [NodeState.CLICKED]: {
//       on: {
//         [NodeEvents.DRAGSTART]: NodeState.DRAGGING,
//         [NodeEvents.MOUSEOUT]: NodeState.IDLE,
//       },
//     },
//   },
// };
