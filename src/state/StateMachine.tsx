import { ServiceMap, TypegenDisabled, createMachine } from "xstate";
import { NodeEvents, NodeState } from "../common";

export type NodeContext = Record<string, never>;

export type NodeStateEvents =
  | {
      type: NodeEvents.DRAGEND;
    }
  | {
      type: NodeEvents.DRAGSTART;
    }
  | {
      type: NodeEvents.MOUSEOUT;
    }
  | {
      type: NodeEvents.MOUSEOVER;
    };

export type NodeTypestate =
  | {
      value: NodeState.CLICKED;
      context: NodeContext;
    }
  | {
      value: NodeState.DRAGGING;
      context: NodeContext;
    }
  | {
      value: NodeState.HOVERED;
      context: NodeContext;
    }
  | {
      value: NodeState.IDLE;
      context: NodeContext;
    }
  | {
      value: NodeState.INITIAL;
      context: NodeContext;
    };

export const createStateMachine = (nodeId: number) =>
  createMachine<
    NodeContext,
    NodeStateEvents,
    NodeTypestate,
    ServiceMap,
    TypegenDisabled
  >({
    id: `node-${nodeId}`,
    initial: NodeState.INITIAL,
    states: {
      [NodeState.INITIAL]: {
        on: {
          [NodeEvents.MOUSEOVER]: NodeState.HOVERED,
        },
      },
      [NodeState.IDLE]: {
        on: {
          [NodeEvents.MOUSEOVER]: NodeState.HOVERED,
        },
      },
      [NodeState.HOVERED]: {
        on: {
          [NodeEvents.MOUSEOUT]: NodeState.IDLE,
          [NodeEvents.DRAGSTART]: NodeState.DRAGGING,
        },
      },
      [NodeState.DRAGGING]: {
        on: {
          [NodeEvents.DRAGEND]: NodeState.CLICKED,
        },
      },
      [NodeState.CLICKED]: {
        on: {
          [NodeEvents.DRAGSTART]: NodeState.DRAGGING,
          [NodeEvents.MOUSEOUT]: NodeState.IDLE,
        },
      },
    },
  });
