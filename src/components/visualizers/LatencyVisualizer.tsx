import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function LatencyVisualizer() {
  const [base, setBase] = useState(22);
  const [jitter, setJitter] = useState(6);
  const [deadline, setDeadline] = useState(33);
  const values = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) =>
        Math.max(1, base + Math.sin(i * 1.37) * jitter + Math.sin(i * 3.11) * jitter * 0.35),
      ),
    [base, jitter],
  );
  const misses = values.filter((value) => value > deadline).length;
  const max = Math.max(deadline, ...values) + 8;

  return (
    <VisualFrame
      icon={<LineChart size={18} aria-hidden />}
      metrics={[
        ["mean", `${(values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)} ms`],
        ["max", `${Math.max(...values).toFixed(1)} ms`],
        ["deadline miss", `${misses}/${values.length}`],
      ]}
      title="Loop Latency"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="base" max={45} min={5} onChange={setBase} step={1} suffix=" ms" value={base} />
          <Slider label="jitter" max={20} min={0} onChange={setJitter} step={1} suffix=" ms" value={jitter} />
          <Slider label="deadline" max={60} min={10} onChange={setDeadline} step={1} suffix=" ms" value={deadline} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <line className="deadline-line" x1="25" x2="405" y1={250 - (deadline / max) * 210} y2={250 - (deadline / max) * 210} />
          {values.map((value, index) => {
            const barHeight = (value / max) * 210;
            return (
              <rect
                className={value > deadline ? "bar is-miss" : "bar"}
                height={barHeight}
                key={`${value}-${index}`}
                width="6"
                x={28 + index * 9}
                y={250 - barHeight}
              />
            );
          })}
        </svg>
      </div>
    </VisualFrame>
  );
}
