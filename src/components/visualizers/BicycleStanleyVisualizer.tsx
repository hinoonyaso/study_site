import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function BicycleStanleyVisualizer() {
  const [crossTrack, setCrossTrack] = useState(0.8);
  const [headingError, setHeadingError] = useState(5);
  const [speed, setSpeed] = useState(5);
  const gain = 1.2;
  const wheelbase = 2.5;
  const headingRad = (headingError * Math.PI) / 180;
  const stanley = headingRad + Math.atan2(gain * crossTrack, speed + 1e-6);
  const delta = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, stanley));
  const yawRate = (speed / wheelbase) * Math.tan(delta);
  const path = Array.from({ length: 70 }, (_, index) => {
    const x = (index / 69) * 6;
    return { x, y: 0.28 * Math.sin(x * 1.4) };
  });
  const robot = { x: 2.6, y: 0.28 * Math.sin(2.6 * 1.4) + crossTrack };
  const screen = path.map((point) => ({ x: 35 + point.x * 62, y: 150 - point.y * 72 }));
  const sRobot = { x: 35 + robot.x * 62, y: 150 - robot.y * 72 };
  const headingEnd = {
    x: sRobot.x + Math.cos(headingRad) * 60,
    y: sRobot.y - Math.sin(headingRad) * 60,
  };
  const steerEnd = {
    x: sRobot.x + Math.cos(headingRad + delta) * 48,
    y: sRobot.y - Math.sin(headingRad + delta) * 48,
  };

  return (
    <VisualFrame
      icon={<Route size={18} aria-hidden />}
      metrics={[
        ["delta", `${((delta * 180) / Math.PI).toFixed(1)}°`],
        ["yaw rate", `${yawRate.toFixed(2)} rad/s`],
        ["saturation", Math.abs(stanley) > Math.PI / 6 ? "active" : "clear"],
      ]}
      title="Bicycle / Stanley Controller"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="cross-track" max={2} min={-2} onChange={setCrossTrack} step={0.05} suffix=" m" value={crossTrack} />
          <Slider label="heading error" max={30} min={-30} onChange={setHeadingError} step={1} suffix="°" value={headingError} />
          <Slider label="speed" max={15} min={0.5} onChange={setSpeed} step={0.1} suffix=" m/s" value={speed} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <polyline className="path-line" points={polyline(screen)} />
          <line className="lookahead-line" x1={sRobot.x} x2={headingEnd.x} y1={sRobot.y} y2={headingEnd.y} />
          <line className="velocity-arrow" x1={sRobot.x} x2={steerEnd.x} y1={sRobot.y} y2={steerEnd.y} />
          <line className="cross-track-line" x1={sRobot.x} x2={sRobot.x} y1={sRobot.y} y2={150 - 0.28 * Math.sin(2.6 * 1.4) * 72} />
          <circle className="point result" cx={sRobot.x} cy={sRobot.y} r="8" />
          <text x={sRobot.x + 10} y={sRobot.y - 10}>vehicle</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
