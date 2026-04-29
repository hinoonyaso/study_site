import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function PurePursuitVisualizer() {
  const [lookahead, setLookahead] = useState(0.9);
  const [progress, setProgress] = useState(0.25);
  const path = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => {
        const x = (i / 79) * 6;
        return { x, y: 0.65 * Math.sin(x * 1.2) };
      }),
    [],
  );
  const robotIndex = Math.min(path.length - 1, Math.floor(progress * (path.length - 1)));
  const robot = path[robotIndex];
  const target =
    path.slice(robotIndex).find((point) => Math.hypot(point.x - robot.x, point.y - robot.y) >= lookahead) ??
    path[path.length - 1];
  const localTarget = { x: target.x - robot.x, y: target.y - robot.y };
  const curvature = (2 * localTarget.y) / Math.max(0.001, localTarget.x * localTarget.x + localTarget.y * localTarget.y);
  const screen = path.map((point) => ({ x: 30 + point.x * 62, y: 150 - point.y * 70 }));
  const sRobot = { x: 30 + robot.x * 62, y: 150 - robot.y * 70 };
  const sTarget = { x: 30 + target.x * 62, y: 150 - target.y * 70 };

  return (
    <VisualFrame
      icon={<Gauge size={18} aria-hidden />}
      metrics={[
        ["target", `(${target.x.toFixed(2)}, ${target.y.toFixed(2)})`],
        ["curvature", curvature.toFixed(3)],
        ["lookahead", `${lookahead.toFixed(2)} m`],
      ]}
      title="Pure Pursuit"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="lookahead" max={1.8} min={0.3} onChange={setLookahead} step={0.05} suffix=" m" value={lookahead} />
          <Slider label="progress" max={0.95} min={0.02} onChange={setProgress} step={0.01} value={progress} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <polyline className="path-line" points={polyline(screen)} />
          <line className="lookahead-line" x1={sRobot.x} x2={sTarget.x} y1={sRobot.y} y2={sTarget.y} />
          <circle className="lookahead-ring" cx={sRobot.x} cy={sRobot.y} r={lookahead * 62} />
          <circle className="point result" cx={sRobot.x} cy={sRobot.y} r="7" />
          <circle className="point target" cx={sTarget.x} cy={sTarget.y} r="7" />
          <text x={sRobot.x + 8} y={sRobot.y - 8}>robot</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
