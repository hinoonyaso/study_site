import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function KalmanVisualizer() {
  const [processNoise, setProcessNoise] = useState(0.03);
  const [measurementNoise, setMeasurementNoise] = useState(0.25);
  const data = useMemo(() => {
    let x = 0;
    let p = 1;
    return Array.from({ length: 45 }, (_, i) => {
      const truth = i * 0.045 + Math.sin(i * 0.18) * 0.2;
      const measurement = truth + Math.sin(i * 1.7) * measurementNoise;
      p += processNoise;
      const k = p / (p + measurementNoise);
      x += k * (measurement - x);
      p = (1 - k) * p;
      return { truth, measurement, estimate: x };
    });
  }, [measurementNoise, processNoise]);
  const mapPoint = (value: number, index: number, field: "truth" | "measurement" | "estimate") => ({
    x: 25 + index * 8.6,
    y: 240 - data[index][field] * 85,
  });

  return (
    <VisualFrame
      icon={<Activity size={18} aria-hidden />}
      metrics={[
        ["process noise", processNoise.toFixed(2)],
        ["measurement noise", measurementNoise.toFixed(2)],
        ["last estimate", data[data.length - 1]?.estimate.toFixed(2) ?? "0"],
      ]}
      title="1D Kalman Filter"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="process q" max={0.2} min={0.005} onChange={setProcessNoise} step={0.005} value={processNoise} />
          <Slider label="measurement r" max={0.8} min={0.05} onChange={setMeasurementNoise} step={0.01} value={measurementNoise} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <polyline className="truth-line" points={polyline(data.map((_, i) => mapPoint(data[i].truth, i, "truth")))} />
          <polyline className="measurement-line" points={polyline(data.map((_, i) => mapPoint(data[i].measurement, i, "measurement")))} />
          <polyline className="estimate-line" points={polyline(data.map((_, i) => mapPoint(data[i].estimate, i, "estimate")))} />
        </svg>
      </div>
    </VisualFrame>
  );
}
