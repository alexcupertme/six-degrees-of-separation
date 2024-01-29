import { Point } from "pixi.js";
import { Edge } from "../Edge";
import { Node } from "../Node";
import { MapGenerator, MapGeneratorProps } from "./MapGenerator";

export type EdgeStrategy = "chain" | "tree" | "nearest";

export type SpiralMapGeneratorProps = {
  averageDistance: number;
  childrenCount: number;
  angleIncrement: number;
  edgeStrategy: EdgeStrategy;
};

export class SpiralMapGenerator extends MapGenerator {
  private averageDistance: number;
  private currentAngle: number;
  private currentRadius: number;
  private childrenCount: number;
  private angleIncrement: number;
  private edgeStrategy: EdgeStrategy;

  constructor(props: MapGeneratorProps & SpiralMapGeneratorProps) {
    super(props);
    const { averageDistance, childrenCount, angleIncrement, edgeStrategy } =
      props;

    this.averageDistance = averageDistance;
    this.childrenCount = childrenCount;
    this.currentAngle = 0;
    this.currentRadius = this.averageDistance; // Or any starting radius
    this.angleIncrement = angleIncrement;
    this.edgeStrategy = edgeStrategy;
  }

  private getNewPosition = () => {
    this.remainingNodes--;

    const x = this.center.x + this.currentRadius * Math.cos(this.currentAngle);
    const y = this.center.y + this.currentRadius * Math.sin(this.currentAngle);

    this.currentAngle += this.angleIncrement;
    this.currentRadius += this.averageDistance / this.childrenCount;

    return new Point(x, y);
  };

  public fill(): void {
    while (this.remainingNodes) {
      this.fillOnce();
      this.currentRadius += this.averageDistance;
      this.currentAngle += (2 * Math.PI) / this.childrenCount;
    }
  }

  private fillOnce(): void {
    if (this.remainingNodes <= 0) {
      return;
    }

    const position = this.getNewPosition();
    const parentNode = new Node(position, []);
    this.map.addNodes(parentNode);
    this.remainingNodes--; // Decrement here for parent node

    let previousNode: Node | null = null;

    for (let i = 0; i < this.childrenCount; i++) {
      if (this.remainingNodes <= 0) {
        break;
      }

      const childPosition = this.getNewPosition();
      const childNode = new Node(childPosition, []);
      this.remainingNodes--; // Decrement here for each child node

      // Adding parent to child edge for "tree" or "chain" strategy
      if (this.edgeStrategy === "tree" || this.edgeStrategy === "chain") {
        const edgeToParent = new Edge({ from: parentNode, to: childNode });
        parentNode.addEdgeReferences(edgeToParent);
        childNode.addEdgeReferences(edgeToParent);
        this.map.addEdges(edgeToParent);
      }

      // Adding child to previous child edge for "chain" strategy
      if (this.edgeStrategy === "chain" && previousNode !== null) {
        const edgeToPrevious = new Edge({ from: previousNode, to: childNode });
        previousNode.addEdgeReferences(edgeToPrevious);
        childNode.addEdgeReferences(edgeToPrevious);

        this.map.addEdges(edgeToPrevious);
      }

      // Update previous node for the next iteration
      previousNode = childNode;

      this.map.addNodes(childNode);
    }
  }
}
