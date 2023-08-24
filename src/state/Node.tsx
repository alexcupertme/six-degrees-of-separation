import { Point } from "pixi.js";
import {
  calculateBezierPoints,
  getCenterPoint,
  getLongestControlPoints,
} from "../DashedCurvedArrow";

export class Node {
  private _point: Point;
  id: number;
  children: Node[] = [];
  parent: Node | null;
  pathToParent: Point[];

  constructor(id: number, point: Point, parent: Node | null) {
    this.id = id;
    this._point = point;
    this.parent = parent;

    if (this.parent === null) this.pathToParent = [];
    else {
      const centerPoint = getCenterPoint(point, parent!.getReadonlyPoint());
      const { startControlPoint, endControlPoint } = getLongestControlPoints(
        point,
        parent!.getReadonlyPoint(),
        centerPoint
      );

      this.pathToParent = calculateBezierPoints(
        point,
        startControlPoint,
        endControlPoint,
        parent!.getReadonlyPoint()
      );
    }
  }

  getReadonlyPoint(): Readonly<Point> {
    return this._point;
  }

  getPointCopy() {
    return this._point.clone();
  }

  changePoint(point: Point) {
    this._point.x = point.x;
    this._point.y = point.y;

    this.recalculatePath();
    this.children.forEach((c) => c.recalculatePath());
  }

  recalculatePath() {
    if (this.pathToParent.length) {
      const centerPoint = getCenterPoint(
        this._point,
        this.parent!.getReadonlyPoint()
      );
      const { startControlPoint, endControlPoint } = getLongestControlPoints(
        this._point,
        this.parent!._point,
        centerPoint
      );
      const newPoints = calculateBezierPoints(
        this._point,
        startControlPoint,
        endControlPoint,
        this.parent!._point
      );
      this.pathToParent.forEach((p, i) => {
        p.x = newPoints[i].x;
        p.y = newPoints[i].y;
      });
    }
  }

  addChild(child: Node) {
    this.children.push(child);
  }

  toArray(): Node[] {
    const result: Node[] = [this];
    for (const child of this.children) {
      result.push(...child.toArray());
    }
    return result;
  }

  getNodeById(id: number): Node | null {
    if (this.id === id) {
      return this;
    }
    for (const child of this.children) {
      const foundNode = child.getNodeById(id);
      if (foundNode) {
        return foundNode;
      }
    }
    return null;
  }
}
