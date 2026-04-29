import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function EigenCovarianceVisualizer() {
  const [sigmaX, setSigmaX] = useState(2);
  const [sigmaY, setSigmaY] = useState(1);
  const [rho, setRho] = useState(0.45);
  const width = 430;
  const height = 300;
  const scale = 46;
  const a = sigmaX * sigmaX;
  const d = sigmaY * sigmaY;
  const b = rho * sigmaX * sigmaY;
  const trace = a + d;
  const disc = Math.sqrt(Math.max(0, (a - d) ** 2 + 4 * b * b));
  const lambda1 = Math.max(0, (trace + disc) / 2);
  const lambda2 = Math.max(0, (trace - disc) / 2);
  const eigenVector = (lambda: number): Point => {
    const candidate = Math.abs(b) > 1e-8 ? { x: b, y: lambda - a } : lambda >= d ? { x: 1, y: 0 } : { x: 0, y: 1 };
    const norm = Math.hypot(candidate.x, candidate.y) || 1;
    return { x: candidate.x / norm, y: candidate.y / norm };
  };
  const v1 = eigenVector(lambda1);
  const v2 = { x: -v1.y, y: v1.x };
  const ellipse = Array.from({ length: 100 }, (_, index) => {
    const t = (index / 99) * Math.PI * 2;
    return worldToSvg(
      {
        x: Math.sqrt(lambda1) * Math.cos(t) * v1.x + Math.sqrt(lambda2) * Math.sin(t) * v2.x,
        y: Math.sqrt(lambda1) * Math.cos(t) * v1.y + Math.sqrt(lambda2) * Math.sin(t) * v2.y,
      },
      width,
      height,
      scale,
    );
  });
  const origin = worldToSvg({ x: 0, y: 0 }, width, height, scale);
  const major = worldToSvg({ x: Math.sqrt(lambda1) * v1.x, y: Math.sqrt(lambda1) * v1.y }, width, height, scale);
  const minor = worldToSvg({ x: Math.sqrt(lambda2) * v2.x, y: Math.sqrt(lambda2) * v2.y }, width, height, scale);

  return (
    <VisualFrame
      icon={<Sigma size={18} aria-hidden />}
      metrics={[
        ["lambda max", lambda1.toFixed(2)],
        ["lambda min", lambda2.toFixed(2)],
        ["major axis", Math.sqrt(lambda1).toFixed(2)],
        ["minor axis", Math.sqrt(lambda2).toFixed(2)],
      ]}
      title="Eigenvectors and Covariance Ellipse"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="sigma x" max={4} min={0.2} onChange={setSigmaX} step={0.05} value={sigmaX} />
          <Slider label="sigma y" max={4} min={0.2} onChange={setSigmaY} step={0.05} value={sigmaY} />
          <Slider label="rho" max={0.95} min={-0.95} onChange={setRho} step={0.01} value={rho} />
          {lambda2 < 0.05 && <div className="singularity-banner">공분산이 거의 한 방향으로 납작해져 수치적으로 민감합니다.</div>}
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="24" x2={width - 24} y1={origin.y} y2={origin.y} />
          <line className="axis" x1={origin.x} x2={origin.x} y1="24" y2={height - 24} />
          <polyline className="estimate-line" fill="rgba(4,125,122,0.08)" points={polyline(ellipse)} />
          <line className="vector result" x1={origin.x} x2={major.x} y1={origin.y} y2={major.y} />
          <line className="vector original" x1={origin.x} x2={minor.x} y1={origin.y} y2={minor.y} />
          <circle className="joint" cx={origin.x} cy={origin.y} r="5" />
          <text x={major.x + 8} y={major.y - 8}>v1</text>
          <text x={minor.x + 8} y={minor.y - 8}>v2</text>
          <text x="24" y="28">Σ = [[σx², ρσxσy], [ρσxσy, σy²]]</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
