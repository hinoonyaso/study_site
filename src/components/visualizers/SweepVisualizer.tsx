import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function SweepVisualizer() {
  const [noise, setNoise] = useState(0.08);
  const [limit, setLimit] = useState(1.0);
  const points = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const param = 0.2 + i * 0.08;
        const metric = 0.12 + Math.pow(param - limit, 2) * 0.7 + Math.abs(Math.sin(i * 1.9)) * noise;
        return { param, metric };
      }),
    [limit, noise],
  );
  const maxMetric = Math.max(...points.map((point) => point.metric));
  const screen = points.map((point) => ({
    x: 35 + ((point.param - 0.2) / 2.0) * 360,
    y: 245 - (point.metric / maxMetric) * 205,
  }));
  const best = points.reduce((a, b) => (a.metric < b.metric ? a : b));

  return (
    <VisualFrame
      icon={<LineChart size={18} aria-hidden />}
      metrics={[
        ["best param", best.param.toFixed(2)],
        ["best metric", best.metric.toFixed(3)],
        ["runs", String(points.length)],
      ]}
      title="Parameter Sweep"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="noise" max={0.3} min={0} onChange={setNoise} step={0.01} value={noise} />
          <Slider label="target region" max={1.8} min={0.4} onChange={setLimit} step={0.05} value={limit} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <line className="axis" x1="25" x2="405" y1="245" y2="245" />
          <line className="axis" x1="35" x2="35" y1="25" y2="250" />
          <polyline className="estimate-line" points={polyline(screen)} />
          {screen.map((point, index) => (
            <circle className="point result small" cx={point.x} cy={point.y} key={index} r="3" />
          ))}
        </svg>
      </div>
    </VisualFrame>
  );
}
