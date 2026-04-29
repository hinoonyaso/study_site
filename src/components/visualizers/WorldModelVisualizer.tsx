import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function WorldModelVisualizer() {
  const [horizon, setHorizon] = useState(6);
  const [error, setError] = useState(0.1);
  const pts = Array.from({ length: horizon + 1 }, (_, i) => ({ x: 35 + i * (360 / horizon), y: 220 - (Math.exp(-i / 4) - error * i * 0.04) * 150 }));
  return (
    <VisualFrame icon={<LineChart size={18} aria-hidden />} metrics={[["horizon", String(horizon)], ["model error", error.toFixed(2)], ["uncertainty", (error * horizon).toFixed(2)]]} title="World Model Rollout">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="horizon" max={20} min={1} onChange={setHorizon} step={1} value={horizon} />
          <Slider label="model error" max={1} min={0} onChange={setError} step={0.05} value={error} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280"><polyline className="estimate-line" points={polyline(pts)} /></svg>
      </div>
    </VisualFrame>
  );
}
