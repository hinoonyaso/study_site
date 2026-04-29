import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function LyapunovEnergyVisualizer() {
  const [damping, setDamping] = useState(1);
  const [stiffness, setStiffness] = useState(4);
  const vdot = -damping;
  return (
    <VisualFrame icon={<Sigma size={18} aria-hidden />} metrics={[["stiffness", stiffness.toFixed(1)], ["damping", damping.toFixed(1)], ["Vdot sign", vdot <= 0 ? "non-positive" : "positive"]]} title="Lyapunov Energy">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="damping" max={5} min={-2} onChange={setDamping} step={0.1} value={damping} />
          <Slider label="stiffness" max={10} min={0.1} onChange={setStiffness} step={0.1} value={stiffness} />
          {damping < 0 && <div className="singularity-banner">Vdot이 양수라 에너지가 증가한다.</div>}
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          {Array.from({ length: 9 }, (_, i) => <ellipse className="workspace-ring" cx="215" cy="140" key={i} rx={20 + i * stiffness * 5} ry={12 + i * 10} />)}
        </svg>
      </div>
    </VisualFrame>
  );
}
