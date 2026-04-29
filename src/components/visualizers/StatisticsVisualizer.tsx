import { useState, useMemo } from "react";
import { Activity } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame } from "./VisualizerUtils";
import type { Point } from "./VisualizerUtils";

// Box-Muller with a simple LCG so samples are deterministic per seed
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function boxMuller(u1: number, u2: number): [number, number] {
  const mag = Math.sqrt(-2 * Math.log(Math.max(1e-10, u1)));
  const angle = 2 * Math.PI * u2;
  return [mag * Math.cos(angle), mag * Math.sin(angle)];
}

function generateSamples(n: number, muX: number, muY: number, sigmaX: number, sigmaY: number, rho: number) {
  const rand = lcg(42);
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const [z1, z2] = boxMuller(rand(), rand());
    const x = muX + sigmaX * z1;
    const y = muY + sigmaY * (rho * z1 + Math.sqrt(1 - rho * rho) * z2);
    pts.push({ x, y });
  }
  return pts;
}

export function StatisticsVisualizer() {
  const [n, setN] = useState(40);
  const [muX, setMuX] = useState(1.0);
  const [muY, setMuY] = useState(0.5);
  const [sigmaX, setSigmaX] = useState(1.2);
  const [sigmaY, setSigmaY] = useState(0.8);
  const [rho, setRho] = useState(0.6);

  const width = 430;
  const height = 300;
  const scale = 44;

  const samples = useMemo(
    () => generateSamples(n, muX, muY, sigmaX, sigmaY, rho),
    [n, muX, muY, sigmaX, sigmaY, rho],
  );

  // sample statistics
  const mxHat = samples.reduce((s, p) => s + p.x, 0) / n;
  const myHat = samples.reduce((s, p) => s + p.y, 0) / n;
  const varX = samples.reduce((s, p) => s + (p.x - mxHat) ** 2, 0) / (n - 1);
  const varY = samples.reduce((s, p) => s + (p.y - myHat) ** 2, 0) / (n - 1);
  const covXY = samples.reduce((s, p) => s + (p.x - mxHat) * (p.y - myHat), 0) / (n - 1);
  const sxHat = Math.sqrt(varX);
  const syHat = Math.sqrt(varY);
  const corrHat = covXY / (Math.max(1e-6, sxHat * syHat));

  // covariance ellipse (1-sigma)
  const trace = varX + varY;
  const disc = Math.sqrt(Math.max(0, (varX - varY) ** 2 + 4 * covXY * covXY));
  const lambda1 = (trace + disc) / 2;
  const lambda2 = Math.max(0, (trace - disc) / 2);
  const ev: Point =
    Math.abs(covXY) > 1e-8
      ? (() => {
          const norm = Math.hypot(covXY, lambda1 - varX) || 1;
          return { x: covXY / norm, y: (lambda1 - varX) / norm };
        })()
      : lambda1 >= varY
        ? { x: 1, y: 0 }
        : { x: 0, y: 1 };
  const ev2: Point = { x: -ev.y, y: ev.x };

  const ellipse = Array.from({ length: 101 }, (_, i) => {
    const t = (i / 100) * Math.PI * 2;
    return worldToSvg(
      {
        x: mxHat + Math.sqrt(lambda1) * Math.cos(t) * ev.x + Math.sqrt(lambda2) * Math.sin(t) * ev2.x,
        y: myHat + Math.sqrt(lambda1) * Math.cos(t) * ev.y + Math.sqrt(lambda2) * Math.sin(t) * ev2.y,
      },
      width,
      height,
      scale,
    );
  });

  const origin = worldToSvg({ x: 0, y: 0 }, width, height, scale);
  const meanPt = worldToSvg({ x: mxHat, y: myHat }, width, height, scale);

  // std-dev rectangle corners (mean ± sigma)
  const rectPts = [
    worldToSvg({ x: mxHat - sxHat, y: myHat - syHat }, width, height, scale),
    worldToSvg({ x: mxHat + sxHat, y: myHat - syHat }, width, height, scale),
    worldToSvg({ x: mxHat + sxHat, y: myHat + syHat }, width, height, scale),
    worldToSvg({ x: mxHat - sxHat, y: myHat + syHat }, width, height, scale),
  ];

  return (
    <VisualFrame
      icon={<Activity size={18} aria-hidden />}
      metrics={[
        ["x̄", mxHat.toFixed(2)],
        ["sx", sxHat.toFixed(2)],
        ["ȳ", myHat.toFixed(2)],
        ["corr", corrHat.toFixed(2)],
      ]}
      title="평균 · 분산 · 공분산 시각화"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="샘플 수 n" max={100} min={10} onChange={setN} step={5} value={n} />
          <Slider label="μx (평균x)" max={3} min={-3} onChange={setMuX} step={0.1} value={muX} />
          <Slider label="μy (평균y)" max={3} min={-3} onChange={setMuY} step={0.1} value={muY} />
          <Slider label="σx (표준편차x)" max={3} min={0.1} onChange={setSigmaX} step={0.05} value={sigmaX} />
          <Slider label="σy (표준편차y)" max={3} min={0.1} onChange={setSigmaY} step={0.05} value={sigmaY} />
          <Slider label="ρ (상관계수)" max={0.97} min={-0.97} onChange={setRho} step={0.01} value={rho} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          {/* axes */}
          <line className="axis" x1="20" x2={width - 20} y1={origin.y} y2={origin.y} />
          <line className="axis" x1={origin.x} x2={origin.x} y1="20" y2={height - 20} />

          {/* std-dev rectangle */}
          <polygon
            fill="rgba(37,99,235,0.06)"
            points={rectPts.map((p) => `${p.x},${p.y}`).join(" ")}
            stroke="#2563eb"
            strokeDasharray="4,3"
            strokeWidth="1"
          />

          {/* sample points */}
          {samples.map((pt, i) => {
            const sp = worldToSvg(pt, width, height, scale);
            return <circle key={i} cx={sp.x} cy={sp.y} fill="rgba(4,125,122,0.55)" r="3" />;
          })}

          {/* covariance ellipse (1-sigma) */}
          <polyline
            fill="rgba(220,38,38,0.06)"
            points={polyline(ellipse)}
            stroke="#dc2626"
            strokeWidth="1.5"
          />

          {/* mean cross marker */}
          <line stroke="#dc2626" strokeWidth="2" x1={meanPt.x - 8} x2={meanPt.x + 8} y1={meanPt.y} y2={meanPt.y} />
          <line stroke="#dc2626" strokeWidth="2" x1={meanPt.x} x2={meanPt.x} y1={meanPt.y - 8} y2={meanPt.y + 8} />
          <text x={meanPt.x + 10} y={meanPt.y - 6} style={{ fontSize: 10, fill: "#dc2626" }}>
            μ̂=({mxHat.toFixed(1)},{myHat.toFixed(1)})
          </text>

          {/* legend */}
          <circle cx="26" cy={height - 36} fill="rgba(4,125,122,0.55)" r="4" />
          <text x="34" y={height - 32} style={{ fontSize: 9, fill: "#555" }}>샘플 점</text>
          <line stroke="#dc2626" strokeWidth="1.5" x1="20" x2="36" y1={height - 20} y2={height - 20} />
          <text x="40" y={height - 16} style={{ fontSize: 9, fill: "#555" }}>공분산 타원 (1σ)</text>
          <line stroke="#2563eb" strokeDasharray="4,3" strokeWidth="1" x1="20" x2="36" y1={height - 8} y2={height - 8} />
          <text x="40" y={height - 4} style={{ fontSize: 9, fill: "#555" }}>±σ 사각형</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
