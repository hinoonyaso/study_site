import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function CameraProjectionVisualizer() {
  const [depth, setDepth] = useState(2);
  const [fx, setFx] = useState(400);
  const u = fx * 0.4 / depth + 210;
  return (
    <VisualFrame icon={<Crosshair size={18} aria-hidden />} metrics={[["depth", `${depth.toFixed(1)} m`], ["fx", fx.toFixed(0)], ["pixel u", u.toFixed(1)]]} title="Pinhole Camera Projection">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="depth Z" max={5} min={0.5} onChange={setDepth} step={0.1} value={depth} />
          <Slider label="focal fx" max={900} min={100} onChange={setFx} step={10} value={fx} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <line className="axis" x1="55" x2="210" y1="220" y2="140" />
          <line className="axis" x1="55" x2={u} y1="220" y2="92" />
          <rect className="workspace-ring" height="170" width="160" x="210" y="55" />
          <circle className="point target" cx={u} cy="92" r="7" />
          <text x="65" y="236">camera</text>
          <text x={u + 8} y="88">pixel</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
