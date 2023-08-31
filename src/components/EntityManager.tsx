import { Container, Point, SimpleRope, Ticker } from "pixi.js";
import { Viewport } from "../pixi/Viewport";
import { NodeState } from "../state/State";
import { DashedLine } from "./DashedCurvedArrow";
import { RoundedRect } from "./node/NodeContainer";

// Responses for garbage collection, adding new nodes, add to culling / remove from culling / maximum nodes on display
export class NodesEntityManager {
  private frameCounter: number = 0;
  private maxEntityCount: number = 3000;
  private maxQueueSize: number = 1000;
  private chunkSize: number = 10;

  private maxDistance: number = 5000;

  private state: NodeState;

  private nodesQueue: {
    remaining: RoundedRect[];
    counter: number;
  } = { remaining: [], counter: 0 };

  private edgesQueue: {
    remaining: DashedLine[];
    counter: number;
  } = { remaining: [], counter: 0 };

  private nodesPool: RoundedRect[] = [];
  private edgesPool: DashedLine[] = [];

  private nodesContainer: Container<Container>;
  private edgesContainer: Container<SimpleRope>;

  constructor({
    state,
    edgesContainer,
    nodesContainer,
  }: {
    state: NodeState;
    edgesContainer: Container<SimpleRope>;
    nodesContainer: Container<Container>;
  }) {
    this.state = state;
    this.nodesContainer = nodesContainer;
    this.edgesContainer = edgesContainer;

    Ticker.shared.add(() => this.update());
  }

  public update() {
    this.collectGarbage();
    this.manageQueue();
    this.chunkLoad();
    this.frameCounter++;
  }
  public isTooFar = (point: Point) => {
    const viewport = Viewport.getInstance();
    return (
      Math.abs(viewport.center.x - point.x) > this.maxDistance &&
      Math.abs(viewport.center.y - point.y) > this.maxDistance
    );
  };

  public collectGarbage() {
    if (this.frameCounter % (120 * 5) === 0) {
      this.nodesQueue = { remaining: [], counter: 0 };
      this.edgesQueue = { remaining: [], counter: 0 };
      const unrelevantNodes = this.nodesPool.filter((x) =>
        this.isTooFar(x.getInstance().position)
      );
      const unrelevantEdges = this.edgesPool.filter((line) =>
        line
          .getEdge()
          ?.getPath()
          .every((point) => this.isTooFar(point))
      );
      if (!unrelevantEdges) return;

      this.nodesPool = this.nodesPool.filter(
        (x) => !unrelevantNodes.find((y) => y.id === x.id)
      );
      this.edgesPool = this.edgesPool.filter(
        (x) => !unrelevantEdges.find((y) => y.getEdge().id === x.getEdge().id)
      );
      this.edgesContainer.removeChild(
        ...unrelevantEdges.map((x) => x.getInstance())
      );
      this.nodesContainer.removeChild(
        ...unrelevantNodes.map((x) => x.getInstance())
      );

      Viewport.removeChildrenFromCulling(
        ...unrelevantEdges.map((x) => x.getInstance()),
        ...unrelevantNodes.map((x) => x.getInstance())
      );
    }
  }

  public manageQueue() {
    if (
      this.frameCounter % (120 * 10) === 0 &&
      this.nodesPool.length < this.maxEntityCount &&
      this.edgesQueue.remaining.length < this.maxQueueSize &&
      this.nodesQueue.remaining.length < this.maxQueueSize
    ) {
      const relevantEdges = this.state
        .nodesToArray()
        .filter((x) => !this.isTooFar(x.getReadonlyPoint()))
        .map((x) => x.getEdges())
        .flat()
        .filter((x) => {
          return !this.edgesPool.find((y) => y.getEdge().id === x.id);
        })
        .slice(0, this.maxQueueSize);

      const newEdges = relevantEdges.map((x) => new DashedLine({ edge: x }));
      const newNodes = relevantEdges
        .map((x) => [x.getNodePair().from, x.getNodePair().to])
        .flat()
        .map((x) => new RoundedRect({ node: x }));

      this.nodesQueue.remaining.push(...newNodes);
      this.edgesQueue.remaining.push(...newEdges);
    }
  }

  public chunkLoad() {
    if (
      this.frameCounter % 4 === 0 &&
      this.nodesPool.length < this.maxEntityCount
    ) {
      const nodes = this.nodesQueue.remaining.slice(
        this.nodesQueue.counter,
        this.nodesQueue.counter + this.chunkSize
      );
      const edges = this.edgesQueue.remaining.slice(
        this.edgesQueue.counter,
        this.edgesQueue.counter + this.chunkSize
      );
      this.edgesQueue.counter += this.chunkSize;
      this.nodesQueue.counter += this.chunkSize;
      if (nodes.length || edges.length) {
        this.nodesPool.push(...nodes);
        this.edgesPool.push(...edges);

        const nodesInstances = nodes.map((x) => x.getInstance());
        const edgesInstances = edges.map((x) => x.getInstance());
        nodes.length && this.nodesContainer.addChild(...nodesInstances);
        edges.length && this.edgesContainer.addChild(...edgesInstances);

        Viewport.addChildrenToCulling(...edgesInstances, ...nodesInstances);

        console.log(`Nodes in container: ${this.nodesPool.length}`);
      }
    }
  }
}
