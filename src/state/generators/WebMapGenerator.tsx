import { Point } from "pixi.js";
import { Edge } from "../Edge";
import { Node } from "../Node";
import { MapGenerator, MapGeneratorProps } from "./MapGenerator";

export type WebMapGeneratorProps = {
  cellMargin: number;
};

export class WebMapGenerator extends MapGenerator {
  private rows: number;
  private columns: number;
  private cellMargin: number;

  constructor(props: MapGeneratorProps & WebMapGeneratorProps) {
    super(props);
    const { cellMargin } = props;

    this.rows = Math.floor(Math.sqrt(this.totalNodes));
    this.columns = Math.floor(Math.sqrt(this.totalNodes));
    this.cellMargin = cellMargin;
    this.center = new Point(
      (this.center.x - this.columns * this.cellMargin) / 2,
      (this.center.y - this.rows * this.cellMargin) / 2
    );
  }

  public fill(): void {
    const nodes: Node[][] = [];

    for (let i = 0; i < this.rows; i++) {
      nodes[i] = [];
      for (let j = 0; j < this.columns; j++) {
        if (this.remainingNodes <= 0) {
          return;
        }

        const x =
          this.center.x +
          j * (this.cellMargin + this.cellMargin * Math.random());
        const y =
          this.center.y +
          i * (this.cellMargin + this.cellMargin * Math.random());
        const position = new Point(x, y);

        const node = new Node(position, []);
        nodes[i][j] = node;
        this.map.addNodes(node);
        this.remainingNodes--;
      }
    }

    const gridSize = 300;
    const grid = new Map<string, Node[]>();
    nodes.flat().forEach((node) => {
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
                  Math.abs(point1.x - point2.x) <
                    (1000 * this.cellMargin) / 10 &&
                  Math.abs(point1.y - point2.y) <
                    (1000 * this.cellMargin) / 10 &&
                  Math.random() > 0.5
                ) {
                  const edge = new Edge({ from: x1, to: x2 });
                  x1.addEdgeReferences(edge);
                  x2.addEdgeReferences(edge);
                  this.map.addEdges(edge);
                }
                if (
                  Math.abs(point1.x - point2.x) < 2000 + this.cellMargin * 2 &&
                  Math.abs(point1.y - point2.y) < 2000 + this.cellMargin * 2 &&
                  Math.random() > 0.9
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
