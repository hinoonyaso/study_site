import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function HomogeneousTransform4x4Visualizer() {
  const [theta, setTheta] = useState(35);
  const [tx, setTx] = useState(1);
  const [ty, setTy] = useState(0.6);
  const [tz, setTz] = useState(0.2);
  const rad = (theta * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const p = [0.8, 0.25, 0.4, 1];
  const out = [c * p[0] - s * p[1] + tx, s * p[0] + c * p[1] + ty, p[2] + tz, 1];
  const rows = [
    [c, -s, 0, tx],
    [s, c, 0, ty],
    [0, 0, 1, tz],
    [0, 0, 0, 1],
  ];

  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["theta", `${theta.toFixed(0)}°`],
        ["p_world", `(${out[0].toFixed(2)}, ${out[1].toFixed(2)}, ${out[2].toFixed(2)})`],
        ["bottom row", "[0 0 0 1]"],
      ]}
      title="4x4 Homogeneous Transform"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="yaw theta" max={180} min={-180} onChange={setTheta} step={1} suffix="°" value={theta} />
          <Slider label="tx" max={2} min={-2} onChange={setTx} step={0.05} value={tx} />
          <Slider label="ty" max={2} min={-2} onChange={setTy} step={0.05} value={ty} />
          <Slider label="tz" max={2} min={-1} onChange={setTz} step={0.05} value={tz} />
        </div>
        <div className="matrix-step-grid">
          <div className="matrix-card">
            <span>T matrix</span>
            <code>{rows.map((row) => `[${row.map((v) => v.toFixed(2)).join(" ")}]`).join(" ")}</code>
          </div>
          <div className="matrix-card">
            <span>homogeneous point</span>
            <code>p_child = [{p.map((v) => v.toFixed(2)).join(", ")}]^T</code>
          </div>
          <div className="matrix-card">
            <span>multiply</span>
            <code>p_world = T p_child = [{out.map((v) => v.toFixed(2)).join(", ")}]^T</code>
          </div>
          <div className="matrix-card">
            <span>robot link meaning</span>
            <code>R rotates local link axes, t moves the link origin in parent frame.</code>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
