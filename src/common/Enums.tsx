export enum Colors {
  PRIMARY = 0x2f3131,
  BLACK = 0x000000,
  WHITE = 0xffffff,
  NODE_STROKE = 0x4d5153,
  NODE_HOVER = 0x70389c,
  NODE_CLICK = 0x76aa84,
  NODE_HOVER_TRANSITION_1 = 0x683e8b,
  NODE_HOVER_TRANSITION_2 = 0x5e4577,
  NODE_HOVER_TRANSITION_3 = 0x544e63,
}

/**
 * For internal Node Sprite state
 */
export enum NodeState {
  INITIAL = "INITIAL",
  IDLE = "IDLE",
  HOVERED = "HOVERED",
  CLICKED = "CLICKED",
  DRAGGING = "DRAGGING",
}

/**
 * For PixiJS
 */
export enum MouseButton {
  LEFT = 0,
  RIGHT = 2,
}

export enum NodeEvents {
  MOUSEOVER = "MOUSEOVER",
  MOUSEOUT = "MOUSEOUT",
  DRAGEND = "DRAGEND",
  DRAGSTART = "DRAGSTART",
}
