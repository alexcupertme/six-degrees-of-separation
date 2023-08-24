import { Container, Point } from "pixi.js";
import { DashedLine } from "./DashedCurvedArrow";
import { RoundedRect } from "./RoundedRect";
import { Application } from "./pixi/Application";
import { Viewport } from "./pixi/Viewport";
import { NodeState } from "./state/State";

export class CanvasArea {
  constructor({ centerPosition }: { centerPosition: Point }) {
    const initialState = (() => {
      const totalNodes = 10000;
      const nodesPerLevel = 40;
      return NodeState.generate({
        center: centerPosition,
        totalNodes,
        nodesPerLevel,
        averageDistance: 2000,
        minDistance: 0,
      });
    })();
    console.log(initialState.nodesToArray().length);

    const dashedLinesContainer = new Container();
    const nodesContainer = new Container();

    dashedLinesContainer.interactiveChildren = false;

    nodesContainer.sortableChildren = true;
    nodesContainer.eventMode = "passive";

    nodesContainer.addChild(
      ...initialState.nodesToArray().map((node, i) =>
        new RoundedRect({
          node,
        }).getInstance()
      )
    );

    dashedLinesContainer.addChild(
      ...initialState
        .edgesToArray()
        .map((edge) => new DashedLine({ edge }).getInstance())
    );
    const viewport = Viewport.getInstance();
    Viewport.addChildren(dashedLinesContainer, nodesContainer);
    Application.getInstance().stage.addChild(viewport);

    document.body.appendChild(Application.getInstance().view);
  }
}

new CanvasArea({ centerPosition: new Point(0, 0) });
