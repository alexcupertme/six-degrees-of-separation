import { Point } from "pixi.js";
import { Node } from "./Node";

export class NodeState {
  private _rootNode: Node;
  private static _nextNodeId = 0;

  constructor(rootNode: Node) {
    this._rootNode = rootNode;
  }

  toArray(): Node[] {
    return this._rootNode.toArray();
  }

  getNodeById(id: number): Node | null {
    return this._rootNode.getNodeById(id);
  }

  getRootNode(): Node {
    return this._rootNode;
  }

  private static generateUniqueNodeId(): number {
    return this._nextNodeId++;
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
    const rootNode = new Node(NodeState.generateUniqueNodeId(), center, null);
    const nodeState = new NodeState(rootNode);
    const newPositions: Point[] = [];

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

    const generateChildren = (parent: Node, depth: number) => {
      if (depth === 0) {
        return;
      }

      for (let i = 0; i < nodesPerLevel; i++) {
        const uniquePosition = generateUniquePosition(
          parent.getReadonlyPoint()
        );
        const childNode = new Node(
          NodeState.generateUniqueNodeId(),
          uniquePosition,
          parent
        );
        parent.addChild(childNode);
        generateChildren(childNode, depth - 1);
      }
    };

    generateChildren(rootNode, Math.ceil(Math.log(totalNodes / nodesPerLevel)));

    return nodeState;
  }
}
