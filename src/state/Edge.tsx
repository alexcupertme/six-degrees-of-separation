import { Point } from "pixi.js";
import { v4 } from "uuid";
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
  private _id: string;

  public isHovered: boolean = false;
  public isAvailableForRender: boolean = true;

  constructor({ from, to }: { from: Node; to: Node }) {
    this.from = from;
    this.to = to;
    this.pointsPath = this.calculatePointsPath();
    this._id = v4();
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

  public getNodePair(): { from: Node; to: Node } {
    return {
      from: this.from,
      to: this.to,
    };
  }

  public get id() {
    return this._id;
  }
}
