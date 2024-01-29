import { Point } from "pixi.js";
import { Edge } from "../Edge";
import { Node } from "../Node";
import { MapGenerator, MapGeneratorProps } from "./MapGenerator";

export type EdgeStrategy = "random" | "tree" | "nearest";

/**
 * @param averageDistance - Distance between parent and children
 * @param childrenCount - Children per parent
 * @param maxDepth - Maximum depth of parent-children tree
 * @param edgeStrategy - How could edges be placed
 */
export type CircleMapGeneratorProps = {
  /** Distance between parent and children */
  averageDistance: number;
  /** Children per parent */
  childrenCount: number;
  /** Maximum depth of parent-children tree */
  maxDepth: number;
  /** How could edges be placed */
  edgeStrategy: EdgeStrategy;
};

export class CircleMapGenerator extends MapGenerator {
  private averageDistance: number;
  private currentParentPosition: Point;
  private currentParentPool: { layer: number; node: Node }[] = [];
  private childrenCount: number;
  private maxDepth: number;
  private edgeStrategy: EdgeStrategy;

  constructor(props: MapGeneratorProps & CircleMapGeneratorProps) {
    super(props);

    const { averageDistance, childrenCount, maxDepth, edgeStrategy } = props;

    this.averageDistance = averageDistance;
    this.maxDepth = maxDepth;
    this.childrenCount = childrenCount;
    this.currentParentPosition = this.center;
    this.edgeStrategy = edgeStrategy;
  }
  private getNewPosition = () => {
    this.remainingNodes--;

    const angle = Math.random() * Math.PI * 2;

    const x =
      this.currentParentPosition.x + this.averageDistance * Math.cos(angle);

    const y =
      this.currentParentPosition.y + this.averageDistance * Math.sin(angle);

    return new Point(x, y);
  };

  public fill(): void {
    while (this.remainingNodes && this.repeated) {
      this.fillOnce();
      const angle = Math.random() * Math.PI * 2;
      const centerX = this.center.x + this.averageDistance * Math.cos(angle);

      const centerY =
        this.center.y +
        this.averageDistance *
          this.childrenCount *
          this.maxDepth *
          Math.sin(angle);

      this.currentParentPool = [];
      this.center = new Point(centerX, centerY);
    }
  }

  private fillOnce(): void {
    this.currentParentPool.push({
      layer: 0,
      node: new Node(new Point(this.center.x, this.center.y), []),
    });
    this.map.addNodes(this.currentParentPool[0].node);
    while (this.remainingNodes) {
      const newNodes = [];
      const currentParentItem = this.currentParentPool.shift()!;
      if (currentParentItem.layer > this.maxDepth) break;
      this.currentParentPosition = currentParentItem.node.getReadonlyPoint();

      for (
        let x = 0;
        x < Math.min(this.remainingNodes, this.childrenCount);
        x++
      ) {
        const position = this.getNewPosition();
        const childNode = new Node(position, []);
        newNodes.push(childNode);
      }
      this.map.addNodes(...newNodes);
      if (this.edgeStrategy === "tree") {
        newNodes.forEach((n) => {
          const edge = new Edge({ from: currentParentItem.node, to: n });
          currentParentItem.node.addEdgeReferences(edge);
          n.addEdgeReferences(edge);
          this.map.addEdges(edge);
        });
      }
      this.currentParentPool.push(
        ...newNodes.map((n) => ({
          layer: currentParentItem.layer + 1,
          node: n,
        }))
      );
    }

    const nodes = this.map.nodesToArray();
    if (this.edgeStrategy === "random")
      nodes.forEach((x1) => {
        nodes.forEach((x2) => {
          if (Math.random() > 0.9999) {
            const edge = new Edge({ from: x1, to: x2 });
            x1.addEdgeReferences(edge);
            x2.addEdgeReferences(edge);
            this.map.addEdges(edge);
          }
        });
      });
    else if (this.edgeStrategy === "nearest") {
      const gridSize = 300;
      const grid = new Map<string, Node[]>();
      nodes.forEach((node) => {
        const point = node.getReadonlyPoint();
        const gridX = Math.floor(point.x / gridSize);
        const gridY = Math.floor(point.y / gridSize);
        const key = `${gridX},${gridY}`;

        if (!grid.has(key)) {
          grid.set(key, []);
        }

        grid.get(key)!.push(node);
      });

      grid.forEach((nodesInCell, cellKey) => {
        const [gridX, gridY] = cellKey.split(",").map(Number);

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const neighborKey = `${gridX + dx},${gridY + dy}`;
            if (grid.has(neighborKey)) {
              const neighborNodes = grid.get(neighborKey)!;
              nodesInCell.forEach((x1) => {
                const point1 = x1.getReadonlyPoint();

                neighborNodes.forEach((x2) => {
                  if (x1 === x2) return; // Skip self

                  const point2 = x2.getReadonlyPoint();
                  if (
                    Math.abs(point1.x - point2.x) < 300 &&
                    Math.abs(point1.y - point2.y) < 300 &&
                    Math.random() > 0.98
                  ) {
                    const edge = new Edge({ from: x1, to: x2 });
                    x1.addEdgeReferences(edge);
                    x2.addEdgeReferences(edge);
                    this.map.addEdges(edge);
                  }
                });
              });
            }
          }
        }
      });
    }
  }
}
