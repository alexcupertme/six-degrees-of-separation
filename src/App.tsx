import { Stage } from "@pixi/react";
import { useRef } from "react";
import "./App.css";
import { MyComponent } from "./MyComponent";

function App() {
  const [width, height] = useRef([
    window.innerWidth,
    window.innerHeight,
  ]).current;

  return (
    <Stage
      width={width}
      height={height}
      options={{
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resizeTo: window,
        resolution: window.devicePixelRatio,
      }}
      raf={true}
      renderOnComponentChange={false}
    >
      <MyComponent></MyComponent>
    </Stage>
  );
}

export default App;
