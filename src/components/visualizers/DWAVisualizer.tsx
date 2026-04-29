import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function DWAVisualizer() {
  const [clearanceWeight, setClearanceWeight] = useState(1);
  const [velocityWeight, setVelocityWeight] = useState(0.2);
  const candidates = Array.from({ length: 30 }, (_, i) => {
    const v = (i % 10) / 10;
    const w = Math.floor(i / 10) - 1;
    const clearance = Math.abs(Math.sin(i * 1.4));
    const score = clearanceWeight * clearance + velocityWeight * v - Math.abs(w) * 0.1;
    return { v, w, clearance, score };
  });
  const best = candidates.reduce((a, b) => (a.score > b.score ? a : b));
  return (
    <VisualFrame icon={<Gauge size={18} aria-hidden />} metrics={[["best v", best.v.toFixed(2)], ["best w", best.w.toFixed(0)], ["clearance", best.clearance.toFixed(2)]]} title="DWA Velocity Space">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="clearance weight" max={5} min={0} onChange={setClearanceWeight} step={0.1} value={clearanceWeight} />
          <Slider label="velocity weight" max={2} min={0} onChange={setVelocityWeight} step={0.05} value={velocityWeight} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          {candidates.map((c, i) => (
            <circle className={c === best ? "point target" : c.clearance < 0.25 ? "point original" : "point result"} cx={45 + c.v * 330} cy={140 - c.w * 70} key={i} r={c === best ? 8 : 5} />
          ))}
          <text x="36" y="28">x: linear velocity · y: angular velocity</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
