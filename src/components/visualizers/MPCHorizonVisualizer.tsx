import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function MPCHorizonVisualizer() {
  const [horizon, setHorizon] = useState(5);
  const [rWeight, setRWeight] = useState(0.4);
  const path = useMemo(() => {
    let x = 0;
    return Array.from({ length: horizon + 1 }, (_, i) => {
      if (i > 0) x += Math.max(0.15, 0.35 - rWeight * 0.06);
      return { x: i, y: Math.min(1, x) };
    });
  }, [horizon, rWeight]);
  const screen = path.map((p) => ({ x: 35 + p.x * (360 / Math.max(1, horizon)), y: 235 - p.y * 170 }));
  return (
    <VisualFrame icon={<LineChart size={18} aria-hidden />} metrics={[["horizon", `${horizon} steps`], ["R weight", rWeight.toFixed(2)], ["terminal x", path[path.length - 1].y.toFixed(2)]]} title="MPC Prediction Horizon">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="horizon" max={10} min={1} onChange={setHorizon} step={1} value={horizon} />
          <Slider label="input penalty R" max={3} min={0} onChange={setRWeight} step={0.05} value={rWeight} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <line className="axis" x1="25" x2="405" y1="235" y2="235" />
          <line className="deadline-line" x1="25" x2="405" y1="65" y2="65" />
          <polyline className="estimate-line" points={polyline(screen)} />
          {screen.map((p, i) => <circle className="point result small" cx={p.x} cy={p.y} key={i} r="4" />)}
          <text x="30" y="58">reference</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
