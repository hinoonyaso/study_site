import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function DepthMapVisualizer() {
  const [disparity, setDisparity] = useState(50);
  const [baselineCm, setBaselineCm] = useState(10);
  const z = (500 * (baselineCm / 100)) / Math.max(1e-6, disparity);
  return (
    <VisualFrame
      icon={<Activity size={18} aria-hidden />}
      metrics={[
        ["Z", `${z.toFixed(2)} m`],
        ["baseline", `${baselineCm.toFixed(0)} cm`],
        ["valid", disparity > 5 ? "yes" : "near infinity"],
      ]}
      title="Stereo Depth Map"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="disparity" max={100} min={5} onChange={setDisparity} step={1} suffix=" px" value={disparity} />
          <Slider label="baseline" max={20} min={3} onChange={setBaselineCm} step={1} suffix=" cm" value={baselineCm} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 420 250">
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 8 }).map((__, col) => {
              const shade = Math.max(20, Math.min(90, 110 - z * 20 - row * 4 + col * 2));
              return <rect fill={`hsl(205 70% ${shade}%)`} height="28" key={`${row}-${col}`} width="32" x={82 + col * 34} y={48 + row * 30} />;
            }),
          )}
          <text x="128" y="220">Z = fB / d · smaller d means farther depth</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
