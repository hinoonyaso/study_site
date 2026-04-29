import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function FFTSpectrumVisualizer() {
  const [alpha, setAlpha] = useState(0.1);
  const [freq, setFreq] = useState(30);
  const bins = [5, 10, 20, 30, 40].map((f) => ({ f, amp: f === freq ? 1 : 0.15 + Math.abs(Math.sin(f)) * 0.15 }));
  return (
    <VisualFrame icon={<LineChart size={18} aria-hidden />} metrics={[["LPF alpha", alpha.toFixed(2)], ["dominant", `${freq} Hz`], ["delay risk", alpha < 0.08 ? "high" : "ok"]]} title="FFT Spectrum and LPF">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="alpha" max={1} min={0.01} onChange={setAlpha} step={0.01} value={alpha} />
          <Slider label="noise frequency" max={40} min={5} onChange={setFreq} step={5} suffix=" Hz" value={freq} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          {bins.map((bin, i) => <rect className={bin.f === freq ? "bar is-miss" : "bar"} height={bin.amp * 180} key={bin.f} width="42" x={55 + i * 70} y={230 - bin.amp * 180} />)}
          {bins.map((bin, i) => <text key={`${bin.f}-label`} x={58 + i * 70} y="252">{bin.f}Hz</text>)}
        </svg>
      </div>
    </VisualFrame>
  );
}
