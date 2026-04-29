import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function PoseGraphVisualizer() {
  const [drift, setDrift] = useState(0.45);
  const [weight, setWeight] = useState(0.7);
  const before = Array.from({ length: 7 }, (_, i) => ({ x: 45 + i * 55, y: 215 - Math.sin(i / 2) * 35 - (i / 6) * drift * 90 }));
  const after = before.map((p, i) => ({ x: p.x, y: p.y + weight * (i / 6) * drift * 90 }));
  return (
    <VisualFrame icon={<Workflow size={18} aria-hidden />} metrics={[["drift", drift.toFixed(2)], ["loop weight", weight.toFixed(2)], ["closure", `${Math.round(weight * 100)}%`]]} title="Pose Graph Loop Closure">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="drift" max={1} min={0} onChange={setDrift} step={0.05} value={drift} />
          <Slider label="loop weight" max={1} min={0} onChange={setWeight} step={0.05} value={weight} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <polyline className="measurement-line" points={polyline(before)} />
          <polyline className="estimate-line" points={polyline(after)} />
          {after.map((p, i) => <circle className="point result small" cx={p.x} cy={p.y} key={i} r="4" />)}
        </svg>
      </div>
    </VisualFrame>
  );
}
