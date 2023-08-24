import { Point } from "pixi.js";
import { Edge } from "./Edge";
import { Node } from "./Node";

export class NodeState {
  private _nodes: Set<Node>;
  private _edges: Set<Edge>;

  constructor(nodes: Node[], edges: Edge[]) {
    this._nodes = new Set(nodes);
    this._edges = new Set(edges);
  }

  nodesToArray(): Node[] {
    return Array.from(this._nodes);
  }

  edgesToArray(): Edge[] {
    return Array.from(this._edges);
  }

  addEdges(...edges: Edge[]) {
    edges.forEach((e) => this._edges.add(e));
  }

  addNodes(...nodes: Node[]) {
    nodes.forEach((n) => this._nodes.add(n));
  }

  static generate({
    center,
    totalNodes,
    nodesPerLevel,
    minDistance = 0,
    averageDistance = 0,
  }: {
    center: Point;
    totalNodes: number;
    nodesPerLevel: number;
    minDistance?: number;
    averageDistance?: number;
  }): NodeState {
    const newPositions: Point[] = [];
    const state = new NodeState([], []);

    const getRandomPosition = (parentPosition: Point) => {
      const angle = Math.random() * Math.PI * 2;
      const x = parentPosition.x + averageDistance * Math.cos(angle);
      const y = parentPosition.y + averageDistance * Math.sin(angle);
      return new Point(x, y);
    };

    const generateUniquePosition = (parentPosition: Point) => {
      const newPosition = getRandomPosition(parentPosition);
      // if (isTooClose(newPosition, parentPosition, minDistance)) {
      //   newPosition = getRandomPosition(parentPosition);
      // }
      newPositions.push(newPosition);
      return newPosition;
    };

    const generateChildren = (parent: Node, count: number) => {
      const points = new Array(count)
        .fill("")
        .map(() => generateUniquePosition(parent.getReadonlyPoint()));

      const childrenPair = points.map((p) => {
        const node = new Node(p, []);
        const edge = new Edge({ from: parent, to: node });
        node.addEdgeReferences(edge);
        return { node, edge };
      });

      state.addEdges(...childrenPair.map((c) => c.edge));
      state.addNodes(...childrenPair.map((c) => c.node));

      parent.addEdgeReferences(...childrenPair.map((c) => c.edge));

      childrenPair.forEach((child) => {
        if (newPositions.length < totalNodes) {
          if (newPositions.length + nodesPerLevel < totalNodes) {
            generateChildren(child.node, nodesPerLevel);
          } else generateChildren(child.node, totalNodes - newPositions.length);
        }
      });
    };

    generateChildren(new Node(center, []), nodesPerLevel);
    return state;
  }
}
