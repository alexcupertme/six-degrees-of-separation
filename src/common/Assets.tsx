import background from "../assets/background.png";
import line from "../assets/dashed_line.png";
import clickedNode from "../assets/rect_clicked.png";
import hoveredNode from "../assets/rect_hovered.png";
import nodeBackground from "../assets/rect_inactive.png";
import defaultNode from "../assets/rect_stroke.png";
import sample1 from "../assets/sample1.png";
import sample2 from "../assets/sample2.png";
import sample3 from "../assets/sample3.png";
import sample4 from "../assets/sample4.png";

export const Assets = {
  RoundedRect: {
    MockBackground1: sample1,
    MockBackground2: sample2,
    MockBackground3: sample3,
    MockBackground4: sample4,
    ClickedStroke: clickedNode,
    HoveredStroke: hoveredNode,
    DefaultStroke: defaultNode,
    Background: nodeBackground,
  },
  Common: {
    Background: background,
  },
  DashedLine: {
    Line: line,
  },
};
