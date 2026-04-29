import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function TrajectoryProfileVisualizer() {
  const [duration, setDuration] = useState(2);
  const [distance, setDistance] = useState(1);
  const data = useMemo(() => {
    const T = duration;
    return Array.from({ length: 80 }, (_, i) => {
      const t = (i / 79) * T;
      const s = t / T;
      const q = distance * (10 * s ** 3 - 15 * s ** 4 + 6 * s ** 5);
      const v = (distance / T) * (30 * s ** 2 - 60 * s ** 3 + 30 * s ** 4);
      return { q, v };
    });
  }, [distance, duration]);
  const qLine = data.map((p, i) => ({ x: 30 + i * 4.8, y: 235 - (p.q / Math.max(distance, 0.1)) * 150 }));
  const maxV = Math.max(...data.map((p) => p.v));
  const vLine = data.map((p, i) => ({ x: 30 + i * 4.8, y: 235 - (p.v / Math.max(maxV, 0.01)) * 110 }));
  return (
    <VisualFrame icon={<LineChart size={18} aria-hidden />} metrics={[["duration", `${duration.toFixed(1)} s`], ["distance", distance.toFixed(2)], ["peak velocity", maxV.toFixed(2)]]} title="Quintic Trajectory Profile">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="duration" max={5} min={0.5} onChange={setDuration} step={0.1} suffix=" s" value={duration} />
          <Slider label="distance" max={3} min={0.1} onChange={setDistance} step={0.1} value={distance} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <polyline className="estimate-line" points={polyline(qLine)} />
          <polyline className="measurement-line" points={polyline(vLine)} />
          <text x="32" y="34">q(t) solid · qdot dashed</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
