import { Point } from "pixi.js";
import { DashedLine } from "../components/DashedCurvedArrow";
import { RoundedRect } from "../components/node/NodeContainer";
import { Edge } from "./Edge";
import { Node } from "./Node";

export class NodeState {
  private _nodes: Set<Node>;
  private _edges: Set<Edge>;

  // TODO: refactor this dirty shit
  public spriteNodes: RoundedRect[] = [];
  public spriteEdges: DashedLine[] = [];

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

  getNodes() {
    return this._nodes;
  }

  getEdges() {
    return this._edges;
  }

  addEdges(...edges: Edge[]) {
    edges.forEach((e) => {
      this._edges.add(e);
      // this.spriteEdges.push(new DashedLine({ edge: e }));
    });
  }

  addNodes(...nodes: Node[]) {
    nodes.forEach((n) => {
      this._nodes.add(n);
      // this.spriteNodes.push(new RoundedRect({ node: n }));
    });
  }

  static generate({
    center,
    totalNodes,
    nodesPerLevel,
    averageDistance = 0,
  }: {
    center: Point;
    totalNodes: number;
    nodesPerLevel: number;
    minDistance?: number;
    averageDistance?: number;
  }): NodeState {
    const state = new NodeState([], []);

    const getRandomPosition = (parentPosition: Point) => {
      const angle = Math.random() * Math.PI * 2;
      // More random
      const x =
        parentPosition.x +
        (averageDistance + Math.random() * (averageDistance / 3)) *
          Math.cos(angle);

      const y =
        parentPosition.y +
        (averageDistance + Math.random() * (averageDistance / 3)) *
          Math.sin(angle);

      // const x = parentPosition.x + averageDistance * Math.cos(angle);

      // const y = parentPosition.y + averageDistance * Math.sin(angle);
      return new Point(x, y);
    };

    const generateChildren = (root: Node, count: number) => {
      const stack = [{ node: root, remaining: count }];
      state.addNodes(root);
      while (stack.length > 0) {
        const { node, remaining } = stack.pop();

        const points = new Array(remaining)
          .fill({})
          .map(() => getRandomPosition(node.getReadonlyPoint()));

        const childrenPair = points.map((p) => {
          const childNode = new Node(p, []);
          const edge = new Edge({ from: node, to: childNode });

          childNode.addEdgeReferences(edge);
          return { node: childNode, edge };
        });

        state.addEdges(...childrenPair.map((c) => c.edge));
        state.addNodes(...childrenPair.map((c) => c.node));

        node.addEdgeReferences(...childrenPair.map((c) => c.edge));

        for (const child of childrenPair) {
          const nodesPerLevel = Math.min(
            remaining,
            totalNodes -
              (state.getNodes().size +
                stack.map((x) => x.remaining).reduce((a, b) => a + b, 0))
          );
          if (nodesPerLevel > 0) {
            stack.push({ node: child.node, remaining: nodesPerLevel });
          }
        }
      }
    };

    generateChildren(new Node(center, []), nodesPerLevel);
    return state;
  }
}
