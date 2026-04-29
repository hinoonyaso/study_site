import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function ParticleFilterVisualizer() {
  const [count, setCount] = useState(120);
  const [noise, setNoise] = useState(0.45);
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const phase = i * 12.9898;
        const spread = noise * (Math.sin(phase) + 0.45 * Math.sin(phase * 2.1));
        const x = 1.1 + spread;
        const weight = Math.exp(-0.5 * Math.pow((1.2 - x) / Math.max(0.08, noise), 2));
        return { x, weight };
      }),
    [count, noise],
  );
  const weightSum = particles.reduce((sum, p) => sum + p.weight, 0);
  const estimate = particles.reduce((sum, p) => sum + p.x * p.weight, 0) / Math.max(weightSum, 1e-9);
  const neff = Math.pow(weightSum, 2) / Math.max(1e-9, particles.reduce((sum, p) => sum + p.weight * p.weight, 0));
  return (
    <VisualFrame icon={<Activity size={18} aria-hidden />} metrics={[["estimate", estimate.toFixed(2)], ["N_eff", neff.toFixed(0)], ["particles", String(count)]]} title="Particle Filter SIR">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="particles" max={500} min={40} onChange={setCount} step={10} value={count} />
          <Slider label="measurement noise" max={1.2} min={0.1} onChange={setNoise} step={0.05} value={noise} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <line className="axis" x1="25" x2="405" y1="220" y2="220" />
          <line className="deadline-line" x1={25 + 1.2 * 150} x2={25 + 1.2 * 150} y1="35" y2="238" />
          {particles.map((p, i) => (
            <circle className="point result small" cx={25 + p.x * 150} cy={220 - Math.min(120, p.weight * 120)} key={i} r={1.5 + Math.min(4, p.weight * 5)} />
          ))}
          <text x={25 + estimate * 150} y="34">estimate</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
