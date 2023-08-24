import { Point } from "pixi.js";
import { v4 } from "uuid";
import { Edge } from "./Edge";

export class Node {
  private _point: Point;
  private _edges: Set<Edge>;
  id: string;

  constructor(point: Point, edges: Edge[]) {
    this.id = v4();
    this._point = point;
    this._edges = new Set(edges);
  }

  getReadonlyPoint(): Readonly<Point> {
    return this._point;
  }

  getPointCopy() {
    return this._point.clone();
  }

  addEdgeReferences(...edges: Edge[]) {
    edges.forEach((e) => this._edges.add(e));
  }

  removeEdge(edge: Edge) {
    this._edges.delete(edge);
  }

  changePoint(point: Point) {
    this._point.x = point.x;
    this._point.y = point.y;

    this._edges.forEach((e) => e.recalculatePath());
  }

  // getNodeById(id: number): Node | null {
  //   if (this.id === id) {
  //     return this;
  //   }
  //   for (const child of this.children) {
  //     const foundNode = child.getNodeById(id);
  //     if (foundNode) {
  //       return foundNode;
  //     }
  //   }
  //   return null;
  // }
}
