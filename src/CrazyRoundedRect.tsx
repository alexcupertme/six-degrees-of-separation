import { PixiRef, Sprite } from "@pixi/react";
import { DisplayObject, FederatedEvent, Point, Ticker } from "pixi.js";
import { useRef, useState } from "react";
import { animated } from "react-spring";
import inactiveNodeImage from "./assets/rect_inactive.png";
import strokeNodeImage from "./assets/rect_stroke.png";
import { Colors } from "./common/Colors";

const AnimatedSprite = animated(Sprite);

type Draggable = DisplayObject & {
  isDragging?: boolean;
};

export const RoundedRect = (props: { position: Point }) => {
  const [pos, setPos] = useState(props.position);

  const backgroundRef = useRef<PixiRef<typeof Sprite>>(null);
  const interactiveRef = useRef<PixiRef<typeof Sprite>>(null);

  const handleMouseOver = () => {
    interactiveRef.current!.tint = Colors.NODE_HOVER;
    interactiveRef.current!.alpha = 1;
  };

  const handleMouseOut = () => {
    interactiveRef.current!.alpha = 0;
    interactiveRef.current!.tint = Colors.WHITE;
  };

  const handleClick = () => {
    interactiveRef.current!.tint = Colors.NODE_CLICK;
    interactiveRef.current!.alpha = 1;
  };

  const onDragStart = () => {
    interactiveRef.current!.zIndex = 100;
    backgroundRef.current!.zIndex = 100;
    interactiveRef.current!.scale = new Point(0.4, 0.4);
    backgroundRef.current!.scale = new Point(0.4, 0.4);
    (interactiveRef.current as Draggable).isDragging = true;
  };

  Ticker.shared.add((dt) => (interactiveRef.current!.alpha += 0.005 * dt));

  const onDragEnd = () => {
    (interactiveRef.current as Draggable).isDragging = false;
    interactiveRef.current!.scale = new Point(0.0625, 0.0625);
    backgroundRef.current!.scale = new Point(0.0625, 0.0625);
    setPos(interactiveRef.current!.position);
  };

  const onDragMove = (e: FederatedEvent) => {
    if ((e.currentTarget as Draggable).isDragging) {
      const newPosition = new Point(e.page.x, e.page.y);
      interactiveRef.current!.position = newPosition;
      backgroundRef.current!.position = newPosition;
      interactiveRef.current!.data = { x: 123 };
      console.log(interactiveRef.current!.data);
    }
  };

  return (
    <>
      <AnimatedSprite
        ref={backgroundRef}
        image={inactiveNodeImage}
        position={pos}
        anchor={0.5}
        scale={0.0625}
        alpha={1}
        eventMode={"none"}
        name={"Background"}
      ></AnimatedSprite>
      <AnimatedSprite
        ref={interactiveRef}
        image={strokeNodeImage}
        position={pos}
        pointerover={handleMouseOver}
        pointerout={handleMouseOut}
        pointerdown={onDragStart}
        pointerup={onDragEnd}
        pointerupoutside={onDragEnd}
        pointermove={onDragMove}
        onpointertap={handleClick}
        anchor={0.5}
        scale={0.0625}
        alpha={0}
        eventMode={Math.random() > 0.8 ? "static" : "none"}
        name={"Interactive"}
      />
    </>
  );
};
