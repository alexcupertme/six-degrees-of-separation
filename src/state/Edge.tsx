import { Point } from "pixi.js";
import {
  calculateBezierPoints,
  getCenterPoint,
  getLongestControlPoints,
} from "../common";
import { Node } from "./Node";

export class Edge {
  private pointsPath: Point[];
  private from: Node;
  private to: Node;

  constructor({ from, to }: { from: Node; to: Node }) {
    this.from = from;
    this.to = to;
    this.pointsPath = this.calculatePointsPath();
  }

  calculatePointsPath() {
    const centerPoint = getCenterPoint(
      this.from.getReadonlyPoint(),
      this.to.getReadonlyPoint()
    );
    const { startControlPoint, endControlPoint } = getLongestControlPoints(
      this.from.getReadonlyPoint(),
      this.to.getReadonlyPoint(),
      centerPoint
    );
    return calculateBezierPoints(
      this.from.getReadonlyPoint(),
      startControlPoint,
      endControlPoint,
      this.to.getReadonlyPoint()
    );
  }

  recalculatePath() {
    const newPoints = this.calculatePointsPath();

    this.pointsPath.forEach((p, i) => {
      p.x = newPoints[i].x;
      p.y = newPoints[i].y;
    });
  }

  public getPath() {
    return this.pointsPath;
  }
}
