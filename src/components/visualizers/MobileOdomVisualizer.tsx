import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function MobileOdomVisualizer() {
  const [vl, setVl] = useState(0.55);
  const [vr, setVr] = useState(0.85);
  const [seconds, setSeconds] = useState(7);
  const wheelBase = 0.48;
  const path = useMemo(() => {
    const pts: Point[] = [];
    let x = 0;
    let y = 0;
    let yaw = 0;
    const dt = seconds / 120;
    for (let i = 0; i < 120; i += 1) {
      const v = 0.5 * (vl + vr);
      const w = (vr - vl) / wheelBase;
      x += v * Math.cos(yaw) * dt;
      y += v * Math.sin(yaw) * dt;
      yaw += w * dt;
      pts.push({ x, y });
    }
    return { pts, pose: { x, y, yaw } };
  }, [seconds, vl, vr]);
  const width = 430;
  const height = 280;
  const screen = path.pts.map((point) => ({ x: 45 + point.x * 62, y: height / 2 - point.y * 62 }));
  const end = screen[screen.length - 1] ?? { x: 45, y: height / 2 };

  return (
    <VisualFrame
      icon={<Route size={18} aria-hidden />}
      metrics={[
        ["x, y", `(${path.pose.x.toFixed(2)}, ${path.pose.y.toFixed(2)}) m`],
        ["yaw", `${((path.pose.yaw * 180) / Math.PI).toFixed(1)}°`],
        ["angular z", `${((vr - vl) / wheelBase).toFixed(2)} rad/s`],
      ]}
      title="Differential Drive Odometry"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="left wheel" max={1.2} min={-0.3} onChange={setVl} step={0.01} suffix=" m/s" value={vl} />
          <Slider label="right wheel" max={1.2} min={-0.3} onChange={setVr} step={0.01} suffix=" m/s" value={vr} />
          <Slider label="time" max={12} min={2} onChange={setSeconds} step={1} suffix=" s" value={seconds} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="20" x2={width - 20} y1={height / 2} y2={height / 2} />
          <polyline className="path-line" points={polyline(screen)} />
          <circle className="point result" cx={end.x} cy={end.y} r="7" />
          <text x={end.x + 8} y={end.y - 8}>base_link</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
