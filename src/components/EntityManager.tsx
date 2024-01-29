import { Container, Point, Ticker } from "pixi.js";
import { Viewport } from "../pixi/Viewport";
import { Edge } from "../state/Edge";
import { NodeMap } from "../state/Map";
import { Node } from "../state/Node";
import { DashedLine } from "./DashedCurvedArrow";
import { Queue } from "./Queue";
import { RoundedRect } from "./node/NodeContainer";

// Responses for garbage collection, adding new nodes, add to culling / remove from culling / maximum nodes on display
export class NodesEntityManager {
  private frameCounter: number = 0;
  private batchSize: number = 100;
  private renderDistance: number = 24;

  private maxDistance: () => number = () =>
    Math.floor(
      (10000 * (this.renderDistance / 8)) /
        ((this.nodesContainer.children.length +
          this.edgesContainer.children.length) /
          1600)
    );

  private map: NodeMap;

  private nodesQueue: Queue<Node> = new Queue();
  private edgesQueue: Queue<Edge> = new Queue();

  private nodesContainer: Container<RoundedRect>;
  private edgesContainer: Container<DashedLine>;

  constructor({
    map,
    edgesContainer,
    nodesContainer,
  }: {
    map: NodeMap;
    edgesContainer: Container<DashedLine>;
    nodesContainer: Container<RoundedRect>;
  }) {
    this.map = map;
    this.nodesContainer = nodesContainer;
    this.edgesContainer = edgesContainer;

    this.manageQueue();

    Ticker.shared.add(() => this.update());
    Viewport.getInstance().on("moved", () => {
      this.collectGarbage();
      this.manageQueue();
    });
  }

  public update() {
    this.chunkLoad();
    this.frameCounter++;
  }
  public isTooFar = (point: Point) => {
    const viewport = Viewport.getInstance();
    return (
      Math.abs(viewport.center.x - point.x) > this.maxDistance() &&
      Math.abs(viewport.center.y - point.y) > this.maxDistance()
    );
  };

  public collectGarbage() {
    if (this.frameCounter % 120 === 0) {
      this.nodesQueue.reset();
      this.edgesQueue.reset();

      const unrelevantNodes = this.nodesContainer.children.filter((rect) =>
        this.isTooFar(rect.position)
      );
      const unrelevantEdges = this.edgesContainer.children.filter((line) =>
        line
          .getEdge()
          ?.getPath()
          .every((point) => this.isTooFar(point))
      );

      unrelevantNodes.forEach((node) => {
        node.getNode().isAvailableForRender = true;
      });
      unrelevantEdges.forEach((edge) => {
        edge.getEdge().isAvailableForRender = true;
      });

      // console.log(Viewport.getInstance().center);

      this.edgesContainer.removeChild(...unrelevantEdges);
      this.nodesContainer.removeChild(...unrelevantNodes);

      Viewport.removeChildrenFromCulling(
        ...unrelevantEdges,
        ...unrelevantNodes
      );
    }
  }

  public manageQueue() {
    if (this.frameCounter % 60 === 0) {
      const viewport = Viewport.getInstance();

      const { nodes, edges } = this.map.getChunkData(
        viewport.center,
        this.renderDistance
      );

      this.nodesQueue.enqueue(nodes.filter((x) => x.isAvailableForRender));
      this.edgesQueue.enqueue(edges.filter((x) => x.isAvailableForRender));
    }
  }
  public chunkLoad() {
    if (this.frameCounter % 20 === 0) {
      const nodes = this.nodesQueue.dequeue(this.batchSize);
      const edges = this.edgesQueue.dequeue(this.batchSize);

      if (nodes.length || edges.length) {
        const rects = nodes.map((node) => {
          node.isAvailableForRender = false;
          return new RoundedRect({ node });
        });
        const lines = edges.map((edge) => {
          edge.isAvailableForRender = false;
          return new DashedLine({ edge });
        });

        nodes.length && this.nodesContainer.addChild(...rects);
        edges.length && this.edgesContainer.addChild(...lines);

        Viewport.addChildrenToCulling(...rects, ...lines);

        console.log(
          `Nodes in container: ${this.nodesContainer.children.length} Nodes in queue: ${this.nodesQueue.length}`
        );
      }
    }
  }
}
