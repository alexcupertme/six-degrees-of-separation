import { Point } from "pixi.js";
import { DashedBezier } from "./DashedBezier";

/**
 * Get center point of line from given coordinates
 */
const getCenterPoint = (pos1: Point, pos2: Point) => {
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
const getLongestControlPoints = (
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

/**
 * Draws smooth curved arrow with two points
 * @param param0
 * @returns
 */
export const DashedCurvedArrow = ({
  pos1,
  pos2,
}: {
  pos1: Point;
  pos2: Point;
}) => {
  const centerPoint = getCenterPoint(pos1, pos2);

  const { startControlPoint, endControlPoint } = getLongestControlPoints(
    pos1,
    pos2,
    centerPoint
  );

  return (
    <DashedBezier
      key={`${pos1.x}-${pos1.y}-${pos2.x}-${pos2.y}`}
      points={[pos1, startControlPoint, endControlPoint, pos2]}
      dashLength={8}
      gapLength={8}
      lineStyle={{ width: 0.5, color: 0xaba59d, alpha: 0.5 }}
    />
  );
};
