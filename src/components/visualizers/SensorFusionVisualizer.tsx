import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function SensorFusionVisualizer() {
  const [alpha, setAlpha] = useState(0.8);
  const [gpsNoise, setGpsNoise] = useState(1);
  const data = useMemo(() => {
    let estimate = 0;
    return Array.from({ length: 36 }, (_, i) => {
      const truth = i * 0.07;
      const gps = truth + Math.sin(i * 1.6) * gpsNoise * 0.08;
      estimate = alpha * (estimate + 0.07) + (1 - alpha) * gps;
      return { truth, gps, estimate };
    });
  }, [alpha, gpsNoise]);
  const map = (field: "truth" | "gps" | "estimate") => data.map((p, i) => ({ x: 30 + i * 10.5, y: 230 - p[field] * 80 }));
  return (
    <VisualFrame icon={<Activity size={18} aria-hidden />} metrics={[["alpha", alpha.toFixed(2)], ["gps noise", gpsNoise.toFixed(1)], ["estimate", data[data.length - 1].estimate.toFixed(2)]]} title="GPS + IMU Sensor Fusion">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="IMU prediction weight" max={1} min={0} onChange={setAlpha} step={0.05} value={alpha} />
          <Slider label="GPS noise" max={5} min={0} onChange={setGpsNoise} step={0.1} value={gpsNoise} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <polyline className="truth-line" points={polyline(map("truth"))} />
          <polyline className="measurement-line" points={polyline(map("gps"))} />
          <polyline className="estimate-line" points={polyline(map("estimate"))} />
        </svg>
      </div>
    </VisualFrame>
  );
}
