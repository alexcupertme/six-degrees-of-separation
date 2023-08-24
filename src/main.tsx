import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import * as PIXI from "pixi.js";
import React from "react";
import ReactDOM from "react-dom/client";
import { CanvasArea } from "./CanvasArea.tsx";
import "./index.css";

CanvasArea;
// Disable scroll
document.addEventListener(
  "wheel",
  (event) => {
    const { ctrlKey } = event;
    if (ctrlKey) {
      event.preventDefault();
      return;
    }
  },
  { passive: false }
);

// Disable RMB Context Menu
window.addEventListener("contextmenu", (e) => e.preventDefault());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode></React.StrictMode>
);

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);
