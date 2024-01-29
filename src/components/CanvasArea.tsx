import { Container, Point } from "pixi.js";
import { NodeMap } from "../state/Map";
import { CircleMapGenerator } from "../state/generators/CircleMapGenerator";
import { SpiralMapGenerator } from "../state/generators/SpiralMapGenerator";
import { WebMapGenerator } from "../state/generators/WebMapGenerator";
import { Application } from "./../pixi/Application";
import { Viewport } from "./../pixi/Viewport";
import { DashedLine } from "./DashedCurvedArrow";
import { NodesEntityManager } from "./EntityManager";
import { ClickParticles } from "./effects/ClickParticles";
import { RoundedRect } from "./node/NodeContainer";

export type EdgeStrategy = "tree" | "nearest" | "chain";

export class CanvasArea {
  constructor({ centerPosition }: { centerPosition: Point }) {
    const map = (() => {
      const nodeMap = new NodeMap({ chunkSize: 400 });
      const generationStrategy = new CircleMapGenerator({
        averageDistance: 10000,
        childrenCount: 10,
        maxDepth: 10,
        map: nodeMap,
        totalNodes: 5000,
        center: centerPosition,
        repeated: true,
        edgeStrategy: "nearest",
      });

      const spiralGenerationStrategy = new SpiralMapGenerator({
        angleIncrement: 1,
        averageDistance: 20,
        center: new Point(0, 0),
        childrenCount: 1,
        totalNodes: 10000,
        map: nodeMap,
        edgeStrategy: "chain",
      });

      const webGenerationStrategy = new WebMapGenerator({
        center: new Point(0, 0),
        totalNodes: 10000,
        cellMargin: 200,
        map: nodeMap,
      });
      // webGenerationStrategy.fill();
      // spiralGenerationStrategy.fill();
      // generationStrategy.fill();
      nodeMap.generateChunks();

      return nodeMap;
    })();
    const arr = map.nodesToArray();
    console.log(arr.length);

    const dashedLinesContainer = new Container<DashedLine>();
    const nodesContainer = new Container<RoundedRect>();

    dashedLinesContainer.interactiveChildren = false;

    nodesContainer.sortableChildren = true;
    nodesContainer.eventMode = "passive";

    const viewport = Viewport.getInstance();
    Viewport.addChildren(dashedLinesContainer, nodesContainer);
    new NodesEntityManager({
      map,
      edgesContainer: dashedLinesContainer,
      nodesContainer,
    });

    Application.getInstance().stage.addChild(viewport);

    Application.getInstance().stage.addChild(
      ClickParticles.getInstance().particleContainer
    );

    document.body.appendChild(Application.getInstance().view);
  }
}

new CanvasArea({ centerPosition: new Point(0, 0) });
