import { Graphics } from "@pixi/react";
import { Point, Graphics as TGraphics } from "pixi.js";

/**
 * DashedBezier Component
 *
 * Renders a dashed Bezier curve using PIXI.js Graphics based on an array of control points.
 *
 * @param {Object} props - The component props.
 * @param {Point[]} props.points - An array of control points for the Bezier curve.
 * @param {number} [props.dashLength=10] - The length of the dashed segments.
 * @param {number} [props.gapLength=5] - The length of the gaps between dashed segments.
 * @param {Object} [props.lineStyle] - The style object for the line.
 * @param {number} [props.lineStyle.width=2] - The width of the line.
 * @param {number} [props.lineStyle.color=0x000000] - The color of the line in hexadecimal format.
 * @param {number} [props.lineStyle.alpha=1] - The alpha (transparency) of the line (0 to 1).
 *
 * @throws {Error} Throws an error if less than 2 control points are provided.
 *
 * @returns {JSX.Element} A React component that renders the dashed Bezier curve.
 */
export const DashedBezier = ({
  points,
  dashLength = 10,
  gapLength = 5,
  lineStyle = { width: 2, color: 0x000000, alpha: 1 },
}: {
  points: Point[];
  dashLength: number;
  gapLength: number;
  lineStyle: {
    width: number;
    color: number;
    alpha: number;
  };
}) => {
  if (points.length < 2) {
    throw new Error("DashedBezier requires at least 2 points.");
  }

  /**
   * Draws a dashed Bezier curve on the PIXI Graphics object.
   *
   * @param {TGraphics} graphics - The PIXI Graphics object to draw the curve on.
   */
  const drawDashedCurve = (graphics: TGraphics) => {
    const totalLength = bezierLength(0, 1);
    const tDelta = 1 / Math.floor(totalLength);

    let t = 0;
    while (t <= 1) {
      const tEnd = Math.min(t + dashLength / totalLength, 1);

      const { x: xStart, y: yStart } = getBezierCoordinate(t);
      const { x: xEnd, y: yEnd } = getBezierCoordinate(tEnd);

      graphics.moveTo(xStart, yStart);
      graphics.lineTo(xEnd, yEnd);

      t += tDelta + (gapLength * 2) / totalLength;
    }
  };

  /**
   * Calculates the length of a Bezier curve segment using the arc length formula.
   *
   * @param {number} tStart - The starting parameter value for the segment (0 to 1).
   * @param {number} tEnd - The ending parameter value for the segment (0 to 1).
   * @returns {number} The approximate length of the Bezier curve segment.
   */
  const bezierLength = (tStart: number, tEnd: number) => {
    const n = 100; // Number of segments to approximate the curve
    let length = 0;
    const dt = (tEnd - tStart) / n;

    for (let i = 0; i < n; i++) {
      const t1 = tStart + i * dt;
      const t2 = t1 + dt;

      const { x: xStart, y: yStart } = getBezierCoordinate(t1);
      const { x: xEnd, y: yEnd } = getBezierCoordinate(t2);

      length += Math.sqrt((xEnd - xStart) ** 2 + (yEnd - yStart) ** 2);
    }

    return length;
  };

  /**
   * Calculates the Bezier curve coordinate at a given parameter t.
   *
   * @param {number} t - The parameter value (0 to 1).
   * @returns {Object} An object containing x and y coordinates of the Bezier curve at the given parameter t.
   */
  const getBezierCoordinate = (t: number) => {
    const result = { x: 0, y: 0 };
    const n = points.length - 1;

    for (let i = 0; i <= n; i++) {
      const binomialCoefficient = getBinomialCoefficient(n, i);
      const power1 = n - i;
      const power2 = i;
      const tPow1 = Math.pow(t, power1);
      const tPow2 = Math.pow(1 - t, power2);
      const factor = binomialCoefficient * tPow1 * tPow2;
      result.x += factor * points[i].x;
      result.y += factor * points[i].y;
    }

    return result;
  };

  /**
   * Calculates the binomial coefficient (n choose k).
   *
   * @param {number} n - The total number of elements.
   * @param {number} k - The number of elements to choose.
   * @returns {number} The binomial coefficient (n choose k).
   */
  const getBinomialCoefficient = (n: number, k: number) => {
    if (k === 0 || k === n) {
      return 1;
    }

    let result = 1;
    for (let i = 1; i <= k; i++) {
      result *= (n - i + 1) / i;
    }

    return result;
  };

  return (
    <Graphics
      draw={(g) => {
        g.clear();
        g.lineStyle(
          lineStyle.width,
          lineStyle.color,
          lineStyle.alpha,
          1,
          false
        );
        drawDashedCurve(g);
      }}
    />
  );
};
