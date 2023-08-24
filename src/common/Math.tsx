import { Point } from "pixi.js";

export const isTooClose = (pos1: Point, pos2: Point, minDistance: number) =>
  Math.abs(pos2.x - pos1.x) < minDistance &&
  Math.abs(pos2.y - pos1.y) < minDistance;
