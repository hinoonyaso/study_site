import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function RLRewardVisualizer() {
  const [epsilon, setEpsilon] = useState(0.25);
  const [gamma, setGamma] = useState(0.95);
  const rewards = useMemo(
    () => Array.from({ length: 36 }, (_, i) => Math.min(1, 0.12 + (1 - Math.exp(-i / (7 + epsilon * 20))) * gamma)),
    [epsilon, gamma],
  );
  return (
    <VisualFrame icon={<Activity size={18} aria-hidden />} metrics={[["epsilon", epsilon.toFixed(2)], ["gamma", gamma.toFixed(2)], ["last reward", rewards[rewards.length - 1].toFixed(2)]]} title="RL Reward Curve">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="epsilon" max={1} min={0} onChange={setEpsilon} step={0.05} value={epsilon} />
          <Slider label="gamma" max={0.99} min={0.1} onChange={setGamma} step={0.01} value={gamma} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          {rewards.map((reward, i) => <rect className="bar" height={reward * 190} key={i} width="7" x={30 + i * 10} y={235 - reward * 190} />)}
        </svg>
      </div>
    </VisualFrame>
  );
}
