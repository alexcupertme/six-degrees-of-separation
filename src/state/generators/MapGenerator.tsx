import { Point } from "pixi.js";
import { NodeMap } from "../Map";

/**
 * @param map - Node map which will be filled with nodes & edges
 * @param repeated - If pattern is closed, repeat it until total nodes limit. If pattern is open, does not affect
 * @param totalNodes - Maximum nodes limit. Could generate less, if repeated = false;
 * @param center - Generator start position
 */
export type MapGeneratorProps = {
  /** Node map which will be filled with nodes & edges */
  map: NodeMap;
  /** If pattern is closed, repeat it until total nodes limit. If pattern is open, does not affect */
  totalNodes: number;
  /** Maximum nodes limit. Could generate less, if repeated = false; */
  repeated?: boolean;
  /** Generator start position */
  center: Point;
};

export abstract class MapGenerator {
  protected map: NodeMap;
  protected totalNodes: number;
  protected repeated: boolean;
  protected center: Point;

  protected remainingNodes: number;

  constructor({ map, totalNodes, repeated, center }: MapGeneratorProps) {
    this.map = map;
    this.totalNodes = totalNodes;
    this.repeated = repeated ?? false;
    this.center = center;

    this.remainingNodes = totalNodes;
  }
  abstract fill(): void;
}
