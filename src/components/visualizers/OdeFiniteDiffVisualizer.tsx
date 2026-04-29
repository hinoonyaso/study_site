import { useState } from "react";
import { Activity } from "lucide-react";
import { Slider, polyline, VisualFrame } from "./VisualizerUtils";
import type { Point } from "./VisualizerUtils";

export function OdeFiniteDiffVisualizer() {
  const [dt, setDt] = useState(0.1);
  const [h, setH] = useState(0.001);
  const [lambda, setLambda] = useState(1);
  const width = 430;
  const height = 280;

  const derivative = ((2 + h) ** 2 - (2 - h) ** 2) / (2 * h);
  const derivativeError = Math.abs(derivative - 4);
  const steps = Math.max(1, Math.round(2 / dt));

  const euler: Point[] = [];
  const rk4: Point[] = [];
  const truth: Point[] = [];
  let xEuler = 1;
  let xRK4 = 1;

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    euler.push({ x: t, y: xEuler });
    rk4.push({ x: t, y: xRK4 });
    truth.push({ x: t, y: Math.exp(-lambda * t) });

    const f = (y: number) => -lambda * y;
    xEuler += dt * f(xEuler);

    const k1 = dt * f(xRK4);
    const k2 = dt * f(xRK4 + k1 / 2);
    const k3 = dt * f(xRK4 + k2 / 2);
    const k4 = dt * f(xRK4 + k3);
    xRK4 += (k1 + 2 * k2 + 2 * k3 + k4) / 6;
  }

  const mapCurve = (p: Point) => ({
    x: 32 + (p.x / 2) * (width - 64),
    y: height - 34 - Math.max(0, Math.min(1.5, p.y)) * (height - 72),
  });

  const eulerFinalError = Math.abs(euler[euler.length - 1].y - truth[truth.length - 1].y);
  const rk4FinalError = Math.abs(rk4[rk4.length - 1].y - truth[truth.length - 1].y);

  return (
    <VisualFrame
      icon={<Activity size={18} aria-hidden />}
      metrics={[
        ["df/dx error", derivativeError.toExponential(1)],
        ["Euler error", eulerFinalError.toFixed(4)],
        ["RK4 error", rk4FinalError.toExponential(2)],
        ["steps", String(steps)],
      ]}
      title="Finite Difference & ODE: Euler vs RK4"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="dt" max={0.5} min={0.01} onChange={setDt} step={0.005} value={dt} />
          <Slider label="difference h" max={0.1} min={0.000001} onChange={setH} step={0.001} value={h} />
          <Slider label="decay lambda" max={5} min={0.1} onChange={setLambda} step={0.05} value={lambda} />
          {dt > 0.3 && (
            <div className="singularity-banner">
              dt가 커질수록 Euler 오차는 급격히 증가하지만 RK4는 여전히 정확합니다.
            </div>
          )}
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="28" x2={width - 28} y1={height - 34} y2={height - 34} />
          <line className="axis" x1="32" x2="32" y1="26" y2={height - 34} />
          {/* true solution */}
          <polyline className="vector original" fill="none" points={polyline(truth.map(mapCurve))} />
          {/* Euler */}
          <polyline className="vector result" fill="none" points={polyline(euler.map(mapCurve))} strokeDasharray="5,3" />
          {/* RK4 */}
          <polyline
            fill="none"
            points={polyline(rk4.map(mapCurve))}
            stroke="#2563eb"
            strokeDasharray="3,2"
            strokeWidth="2"
          />
          {/* legend */}
          <line stroke="#047d7a" strokeWidth="2" x1="42" x2="62" y1="28" y2="28" />
          <text x="66" y="32" style={{ fontSize: 11 }}>true exp(-λt)</text>
          <line stroke="#dc2626" strokeDasharray="5,3" strokeWidth="2" x1="42" x2="62" y1="46" y2="46" />
          <text x="66" y="50" style={{ fontSize: 11 }}>Euler</text>
          <line stroke="#2563eb" strokeDasharray="3,2" strokeWidth="2" x1="42" x2="62" y1="62" y2="62" />
          <text x="66" y="66" style={{ fontSize: 11 }}>RK4</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
