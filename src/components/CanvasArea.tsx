import { Container, Point, SimpleRope } from "pixi.js";
import { Application } from "./../pixi/Application";
import { Viewport } from "./../pixi/Viewport";
import { NodeState } from "./../state/State";
import { NodesEntityManager } from "./EntityManager";

export class CanvasArea {
  constructor({ centerPosition }: { centerPosition: Point }) {
    const initialState = (() => {
      const totalNodes = 50000;
      const nodesPerLevel = 15;
      return NodeState.generate({
        center: centerPosition,
        totalNodes,
        nodesPerLevel,
        averageDistance: 12000,
        minDistance: 0,
      });
    })();
    const arr = initialState.nodesToArray();
    console.log(arr.length);

    const dashedLinesContainer = new Container<SimpleRope>();
    const nodesContainer = new Container<Container>();

    dashedLinesContainer.interactiveChildren = false;

    nodesContainer.sortableChildren = true;
    nodesContainer.eventMode = "passive";

    const viewport = Viewport.getInstance();
    Viewport.addChildren(dashedLinesContainer, nodesContainer);
    new NodesEntityManager({
      state: initialState,
      edgesContainer: dashedLinesContainer,
      nodesContainer,
    });

    Application.getInstance().stage.addChild(viewport);

    document.body.appendChild(Application.getInstance().view);
  }
}

new CanvasArea({ centerPosition: new Point(0, 0) });
