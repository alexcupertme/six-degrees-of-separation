import { Point } from "pixi.js";
import { Edge } from "./Edge";
import { Node } from "./Node";

type ChunkKey = string; // The key for a chunk, which can be generated based on the chunk's coordinates.
type NodeChunk = Set<Node>;
type EdgeChunk = Set<Edge>;

export class NodeMap {
  private _nodes: Set<Node>;
  private _edges: Set<Edge>;

  private _nodeChunks: Map<ChunkKey, NodeChunk> = new Map();
  private _edgeChunks: Map<ChunkKey, EdgeChunk> = new Map();

  private chunkSize: number;

  constructor({ chunkSize }: { chunkSize: number }) {
    this._nodes = new Set([]);
    this._edges = new Set([]);

    this.chunkSize = chunkSize;
  }

  nodesToArray(): Node[] {
    return Array.from(this._nodes);
  }

  edgesToArray(): Edge[] {
    return Array.from(this._edges);
  }

  getNodes() {
    return this._nodes;
  }

  getEdges() {
    return this._edges;
  }

  addEdges(...edges: Edge[]) {
    edges.forEach((e) => {
      this._edges.add(e);
    });
  }

  addNodes(...nodes: Node[]) {
    nodes.forEach((n) => {
      this._nodes.add(n);
    });
  }

  public generateChunks() {
    for (const node of this._nodes) {
      const chunkKey = this.getChunkKey(node.getReadonlyPoint());
      if (!this._nodeChunks.has(chunkKey)) {
        this._nodeChunks.set(chunkKey, new Set());
      }
      this._nodeChunks.get(chunkKey)!.add(node);
    }

    for (const edge of this._edges) {
      const chunkKey = this.getChunkKey(
        edge.getNodePair().from.getReadonlyPoint()
      );
      if (!this._edgeChunks.has(chunkKey)) {
        this._edgeChunks.set(chunkKey, new Set());
      }
      this._edgeChunks.get(chunkKey)!.add(edge);
    }
  }
  private getChunkKey(point: Point): ChunkKey {
    const x = Math.floor(point.x / this.chunkSize);
    const y = Math.floor(point.y / this.chunkSize);
    return `${x},${y}`;
  }

  private getChunkKeys(point: Point, radius: number): ChunkKey[] {
    const gridPoints = [];

    const centerX = Math.floor(point.x / this.chunkSize);
    const centerY = Math.floor(point.y / this.chunkSize);

    for (
      let x = Math.floor(centerX - radius);
      x < Math.floor(centerX + radius);
      x++
    ) {
      for (
        let y = Math.floor(centerY - radius);
        y < Math.floor(centerY + radius);
        y++
      ) {
        if (
          Math.pow(x - centerX + 0.5, 2) + Math.pow(y - centerY + 0.5, 2) <
          Math.pow(radius, 2)
        ) {
          gridPoints.push({ x, y });
        }
      }
    }

    return gridPoints
      .sort(
        (p1, p2) =>
          Math.abs(Math.abs(p1.x - centerX) + Math.abs(p1.y - centerY)) -
          Math.abs(Math.abs(p2.x - centerX) + Math.abs(p2.y - centerY))
      )
      .map((p) => `${p.x},${p.y}`);
  }

  public getChunkData(
    point: Point,
    renderDistance: number
  ): { nodes: Node[]; edges: Edge[] } {
    const chunkKeys = this.getChunkKeys(point, renderDistance);
    const nodes = chunkKeys.map((x) =>
      Array.from(this._nodeChunks.get(x) || [])
    );
    const edges = chunkKeys.map((x) =>
      Array.from(this._edgeChunks.get(x) || [])
    );

    return { nodes: nodes.flat(), edges: edges.flat() };
  }
}
