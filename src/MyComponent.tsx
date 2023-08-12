import { Container } from "@pixi/react";
import { Point } from "pixi.js";
import { useMemo } from "react";
import { RoundedRect } from "./CrazyRoundedRect";

const MIN_DISTANCE = 0;

const isTooClose = (pos1: Point, pos2: Point) =>
  Math.abs(pos2.x - pos1.x) < MIN_DISTANCE &&
  Math.abs(pos2.y - pos1.y) < MIN_DISTANCE;

export const MyComponent = () => {
  const positions = useMemo(() => {
    const getRandomPosition = () =>
      new Point(
        Math.floor(Math.random() * 1400) + 0.5,
        Math.floor(Math.random() * 700) + 0.5
      );

    const generateUniquePosition = (uniquePositions: Point[]) => {
      let newPosition = getRandomPosition();
      while (uniquePositions.some((pos) => isTooClose(pos, newPosition))) {
        newPosition = getRandomPosition();
      }
      return newPosition;
    };

    const newPositions = [];
    const numOfNewPositions = 1000;
    for (let i = 0; i < numOfNewPositions; i++) {
      const uniquePosition = generateUniquePosition(newPositions);
      newPositions.push(uniquePosition);
    }

    return newPositions;
  }, []);

  return (
    <>
      {/* {positions.map((pos1) =>
        positions.map((pos2) => {
          if (
            Math.abs(pos1.x - pos2.x) < 150 &&
            Math.abs(pos1.y - pos2.y) < 150 &&
            Math.random() > 0.9
          ) {
            return (
              <DashedCurvedArrow
                key={`${pos1.x}-${pos1.y}-${pos2.x}-${pos2.y}`}
                pos1={pos1}
                pos2={pos2}
              />
            );
          }
        })
      )} */}
      <Container sortableChildren={true} eventMode={"passive"}>
        {positions.map((pos, index) => (
          <RoundedRect position={pos} key={index}></RoundedRect>
        ))}
      </Container>
    </>
  );
};
