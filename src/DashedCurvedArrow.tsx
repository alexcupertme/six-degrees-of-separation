import { Point, SimpleRope, Texture } from "pixi.js";
import { Assets } from "./common";
import { Application } from "./pixi/Application";
import { Viewport } from "./pixi/Viewport";

export const calculateBezierPoints = (...controlPoints: Point[]) => {
  const points = [];
  const segmentCount = 30;
  const tDelta = 1 / segmentCount;

  for (let i = 0; i <= segmentCount; i++) {
    const t = i * tDelta;
    const { x, y } = getBezierCoordinate(controlPoints, t);
    points.push(new Point(x, y));
  }

  return points;
};

/**
 * Calculates the Bezier curve coordinate at a given parameter t.
 *
 * @param {Point[]} controlPoints - An array of control points.
 * @param {number} t - The parameter value (0 to 1).
 * @returns {Point} The coordinates of the Bezier curve at the given parameter t.
 */
export const getBezierCoordinate = (
  controlPoints: Point[],
  t: number
): Point => {
  if (controlPoints.length === 1) {
    return controlPoints[0];
  }

  const nextLevelPoints = [];
  for (let i = 0; i < controlPoints.length - 1; i++) {
    const p0 = controlPoints[i];
    const p1 = controlPoints[i + 1];
    const x = (1 - t) * p0.x + t * p1.x;
    const y = (1 - t) * p0.y + t * p1.y;
    nextLevelPoints.push(new Point(x, y));
  }

  return getBezierCoordinate(nextLevelPoints, t);
};

/**
 * Get center point of line from given coordinates
 */
export const getCenterPoint = (pos1: Point, pos2: Point) => {
  const centerPosX = (pos1.x + pos2.x) / 2;
  const centerPosY = (pos1.y + pos2.y) / 2;

  return new Point(centerPosX, centerPosY);
};
/**
 * Returns two control points which is directing to longest axis of current line
 * @example pos1 = (0, 0) pos2 = (2, 100) => startControlPoint = (0, 50) endControlPoint = (2, 50)
 *
 * @param point1 start point
 * @param point2 end point
 * @param centerPoint center point
 * @returns
 */
export const getLongestControlPoints = (
  point1: Point,
  point2: Point,
  centerPoint: Point
): {
  startControlPoint: Point;
  endControlPoint: Point;
} => {
  const isLineLongerOnXAxis =
    Math.abs(point1.x - centerPoint.x) > Math.abs(point1.y - centerPoint.y);

  if (isLineLongerOnXAxis) {
    return {
      startControlPoint: new Point(centerPoint.x, point1.y),
      endControlPoint: new Point(centerPoint.x, point2.y),
    };
  } else
    return {
      startControlPoint: new Point(point1.x, centerPoint.y),
      endControlPoint: new Point(point2.x, centerPoint.y),
    };
};

export class DashedLine {
  private _instance: SimpleRope;

  constructor({ points }: { points: Point[] }) {
    const rope = new SimpleRope(
      Texture.from(Assets.DashedLine.Line),
      points,
      0.2
    );
    this._instance = rope;

    rope.eventMode = "none";

    Application.getInstance().ticker.add((dt) => this.update(dt));
  }

  private update(deltaTime: number) {
    this.updateVisibility(deltaTime);
  }

  private updateVisibility(deltaTime: number) {
    if (Viewport.getInstance().scale.x < 0.4) {
      this._instance.renderable = false;
    } else {
      this._instance.renderable = true;
    }
  }

  public getInstance(): SimpleRope {
    return this._instance;
  }
}
