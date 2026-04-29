import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function InverseStepsVisualizer() {
  const [a, setA] = useState(1.4);
  const [b, setB] = useState(0.35);
  const [c, setC] = useState(-0.25);
  const [d, setD] = useState(0.9);
  const det = a * d - b * c;
  const invScale = Math.abs(det) < 0.001 ? 0 : 1 / det;
  const inv = [
    [d * invScale, -b * invScale],
    [-c * invScale, a * invScale],
  ];
  const x = [1.2, 0.8];
  const y = [a * x[0] + b * x[1], c * x[0] + d * x[1]];
  const recovered = [inv[0][0] * y[0] + inv[0][1] * y[1], inv[1][0] * y[0] + inv[1][1] * y[1]];
  const err = Math.hypot(recovered[0] - x[0], recovered[1] - x[1]);

  return (
    <VisualFrame
      icon={<Sigma size={18} aria-hidden />}
      metrics={[
        ["det(A)", det.toFixed(3)],
        ["recover error", Math.abs(det) < 0.001 ? "singular" : err.toExponential(1)],
        ["condition hint", Math.abs(det) < 0.12 ? "near singular" : "stable"],
      ]}
      title="Inverse Matrix Step-by-step"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="a11" max={2.5} min={-2.5} onChange={setA} step={0.05} value={a} />
          <Slider label="a12" max={2.5} min={-2.5} onChange={setB} step={0.05} value={b} />
          <Slider label="a21" max={2.5} min={-2.5} onChange={setC} step={0.05} value={c} />
          <Slider label="a22" max={2.5} min={-2.5} onChange={setD} step={0.05} value={d} />
          {Math.abs(det) < 0.12 && <div className="singularity-banner">det(A)가 작아서 역행렬 계산이 노이즈에 민감합니다.</div>}
        </div>
        <div className="matrix-step-grid">
          <div className="matrix-card">
            <span>1. determinant</span>
            <code>det = a11 a22 - a12 a21 = {det.toFixed(3)}</code>
          </div>
          <div className="matrix-card">
            <span>2. adjugate</span>
            <code>[[a22, -a12], [-a21, a11]] = [[{d.toFixed(2)}, {(-b).toFixed(2)}], [{(-c).toFixed(2)}, {a.toFixed(2)}]]</code>
          </div>
          <div className="matrix-card">
            <span>3. inverse</span>
            <code>A^-1 = 1/det · adj(A) = [[{inv[0][0].toFixed(2)}, {inv[0][1].toFixed(2)}], [{inv[1][0].toFixed(2)}, {inv[1][1].toFixed(2)}]]</code>
          </div>
          <div className="matrix-card">
            <span>4. verify</span>
            <code>x={JSON.stringify(x)} → Ax=[{y.map((v) => v.toFixed(2)).join(", ")}] → A^-1Ax=[{recovered.map((v) => v.toFixed(2)).join(", ")}]</code>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
