import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function JacobianCompareVisualizer() {
  const [q1, setQ1] = useState(35);
  const [q2, setQ2] = useState(50);
  const [hExp, setHExp] = useState(-4);
  const l1 = 1;
  const l2 = 0.75;
  const h = 10 ** hExp;
  const q1r = (q1 * Math.PI) / 180;
  const q2r = (q2 * Math.PI) / 180;
  const fk = (a: number, b: number) => ({
    x: l1 * Math.cos(a) + l2 * Math.cos(a + b),
    y: l1 * Math.sin(a) + l2 * Math.sin(a + b),
  });
  const analytic = [
    [-l1 * Math.sin(q1r) - l2 * Math.sin(q1r + q2r), -l2 * Math.sin(q1r + q2r)],
    [l1 * Math.cos(q1r) + l2 * Math.cos(q1r + q2r), l2 * Math.cos(q1r + q2r)],
  ];
  const numCol = (joint: 0 | 1) => {
    const plus = joint === 0 ? fk(q1r + h, q2r) : fk(q1r, q2r + h);
    const minus = joint === 0 ? fk(q1r - h, q2r) : fk(q1r, q2r - h);
    return [(plus.x - minus.x) / (2 * h), (plus.y - minus.y) / (2 * h)];
  };
  const numerical = [numCol(0), numCol(1)];
  const maxError = Math.max(
    Math.abs(analytic[0][0] - numerical[0][0]),
    Math.abs(analytic[1][0] - numerical[0][1]),
    Math.abs(analytic[0][1] - numerical[1][0]),
    Math.abs(analytic[1][1] - numerical[1][1]),
  );
  const width = 430;
  const height = 300;
  const scale = 78;
  const base = worldToSvg({ x: 0, y: 0 }, width, height, scale);
  const j1 = worldToSvg({ x: l1 * Math.cos(q1r), y: l1 * Math.sin(q1r) }, width, height, scale);
  const ee = worldToSvg(fk(q1r, q2r), width, height, scale);
  const col1End = { x: ee.x + analytic[0][0] * 48, y: ee.y - analytic[1][0] * 48 };
  const col2End = { x: ee.x + analytic[0][1] * 48, y: ee.y - analytic[1][1] * 48 };

  return (
    <VisualFrame
      icon={<Crosshair size={18} aria-hidden />}
      metrics={[
        ["max |J_a-J_n|", maxError.toExponential(2)],
        ["h", h.toExponential(0)],
        ["det(J)", (l1 * l2 * Math.sin(q2r)).toFixed(3)],
      ]}
      title="Analytic vs Numerical Jacobian"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="q1" max={180} min={-180} onChange={setQ1} step={1} suffix="°" value={q1} />
          <Slider label="q2" max={180} min={-180} onChange={setQ2} step={1} suffix="°" value={q2} />
          <Slider label="log10 h" max={-1} min={-8} onChange={setHExp} step={1} value={hExp} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="24" x2={width - 24} y1={base.y} y2={base.y} />
          <line className="axis" x1={base.x} x2={base.x} y1="24" y2={height - 24} />
          <line className="link" x1={base.x} x2={j1.x} y1={base.y} y2={j1.y} />
          <line className="link" x1={j1.x} x2={ee.x} y1={j1.y} y2={ee.y} />
          <line className="vector result" x1={ee.x} x2={col1End.x} y1={ee.y} y2={col1End.y} />
          <line className="vector original" x1={ee.x} x2={col2End.x} y1={ee.y} y2={col2End.y} />
          <circle className="joint" cx={base.x} cy={base.y} r="6" />
          <circle className="joint" cx={j1.x} cy={j1.y} r="6" />
          <circle className="point result" cx={ee.x} cy={ee.y} r="6" />
          <text x={col1End.x + 8} y={col1End.y - 8}>J col q1</text>
          <text x={col2End.x + 8} y={col2End.y - 8}>J col q2</text>
        </svg>
      </div>
      <div className="matrix-step-grid">
        <div className="matrix-card"><span>analytic J</span><code>[[{analytic[0].map((v) => v.toFixed(3)).join(", ")}], [{analytic[1].map((v) => v.toFixed(3)).join(", ")}]]</code></div>
        <div className="matrix-card"><span>numerical J</span><code>[[{numerical.map((col) => col[0].toFixed(3)).join(", ")}], [{numerical.map((col) => col[1].toFixed(3)).join(", ")}]]</code></div>
      </div>
    </VisualFrame>
  );
}
