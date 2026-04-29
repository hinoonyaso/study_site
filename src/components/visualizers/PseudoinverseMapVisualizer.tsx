import { useState } from "react";
import { Sigma } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame } from "./VisualizerUtils";
import type { Point } from "./VisualizerUtils";

export function PseudoinverseMapVisualizer() {
  const [epsilon, setEpsilon] = useState(0.08);
  const [b2, setB2] = useState(4.0);
  const [damping, setDamping] = useState(0.08);

  const A = [
    [1, 1],
    [2, 2 + epsilon],
  ];
  const b = [2, b2];

  const ata00 = A[0][0] ** 2 + A[1][0] ** 2 + damping * damping;
  const ata01 = A[0][0] * A[0][1] + A[1][0] * A[1][1];
  const ata11 = A[0][1] ** 2 + A[1][1] ** 2 + damping * damping;
  const atb0 = A[0][0] * b[0] + A[1][0] * b[1];
  const atb1 = A[0][1] * b[0] + A[1][1] * b[1];
  const det = ata00 * ata11 - ata01 * ata01;
  const xSol: Point = { x: (ata11 * atb0 - ata01 * atb1) / det, y: (-ata01 * atb0 + ata00 * atb1) / det };

  const residual = Math.hypot(A[0][0] * xSol.x + A[0][1] * xSol.y - b[0], A[1][0] * xSol.x + A[1][1] * xSol.y - b[1]);
  const norm = Math.hypot(xSol.x, xSol.y);
  const rankGap = Math.abs(epsilon);

  // null-space direction of A (nearly rank-deficient) ≈ [1, -1] / sqrt(2)
  const nullLen = Math.hypot(1, -1);
  const nullDir: Point = { x: 1 / nullLen, y: -1 / nullLen };

  // solution set: x_sol + t * nullDir for t in [-spread, spread]
  const spread = Math.max(1.5, norm * 0.8);

  const width = 420;
  const height = 260;
  const scale = 38;

  const origin = worldToSvg({ x: 0, y: 0 }, width, height, scale);
  const solPt = worldToSvg(xSol, width, height, scale);

  const lineStart = worldToSvg(
    { x: xSol.x + (-spread) * nullDir.x, y: xSol.y + (-spread) * nullDir.y },
    width, height, scale,
  );
  const lineEnd = worldToSvg(
    { x: xSol.x + spread * nullDir.x, y: xSol.y + spread * nullDir.y },
    width, height, scale,
  );

  // a "large" solution on the line for illustration
  const bigT = spread * 0.75;
  const bigSol: Point = { x: xSol.x + bigT * nullDir.x, y: xSol.y + bigT * nullDir.y };
  const bigPt = worldToSvg(bigSol, width, height, scale);

  // right-angle mark at minimum-norm solution (foot of perpendicular)
  const rmSize = 10;
  const rm1 = worldToSvg(
    { x: xSol.x + (rmSize / scale) * nullDir.x, y: xSol.y + (rmSize / scale) * nullDir.y },
    width, height, scale,
  );
  const rmOrtho: Point = { x: -nullDir.y, y: nullDir.x }; // perpendicular to null dir = toward origin
  const rm2 = worldToSvg(
    {
      x: xSol.x + (rmSize / scale) * nullDir.x + (rmSize / scale) * rmOrtho.x,
      y: xSol.y + (rmSize / scale) * nullDir.y + (rmSize / scale) * rmOrtho.y,
    },
    width, height, scale,
  );
  const rm3 = worldToSvg(
    { x: xSol.x + (rmSize / scale) * rmOrtho.x, y: xSol.y + (rmSize / scale) * rmOrtho.y },
    width, height, scale,
  );

  return (
    <VisualFrame
      icon={<Sigma size={18} aria-hidden />}
      metrics={[
        ["rank gap ε", rankGap.toFixed(3)],
        ["‖x‖ min-norm", norm.toFixed(3)],
        ["residual ‖Ax-b‖", residual.toFixed(3)],
        ["damping λ", damping.toFixed(2)],
      ]}
      title="Pseudoinverse: 최소노름해 기하학"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="rank gap ε" max={0.8} min={0} onChange={setEpsilon} step={0.01} value={epsilon} />
          <Slider label="b 두 번째 행" max={6} min={2} onChange={setB2} step={0.05} value={b2} />
          <Slider label="damping λ" max={0.5} min={0} onChange={setDamping} step={0.01} value={damping} />
          {epsilon < 0.04 && damping < 0.04 && (
            <div className="singularity-banner">rank-deficient 근처 + damping 작음 → 해 노름이 폭발할 수 있습니다.</div>
          )}
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          {/* axes */}
          <line className="axis" x1="20" x2={width - 20} y1={origin.y} y2={origin.y} />
          <line className="axis" x1={origin.x} x2={origin.x} y1="20" y2={height - 20} />
          <text x={width - 18} y={origin.y - 4} style={{ fontSize: 10 }}>x₁</text>
          <text x={origin.x + 4} y={18} style={{ fontSize: 10 }}>x₂</text>

          {/* solution set line */}
          <line stroke="#2563eb" strokeWidth="2" x1={lineStart.x} x2={lineEnd.x} y1={lineStart.y} y2={lineEnd.y} />
          <text x={lineEnd.x + 4} y={lineEnd.y - 4} style={{ fontSize: 10, fill: "#2563eb" }}>해 집합 (직선)</text>

          {/* right-angle mark at min-norm point */}
          <polyline
            fill="none"
            stroke="#666"
            strokeWidth="1"
            points={`${rm1.x},${rm1.y} ${rm2.x},${rm2.y} ${rm3.x},${rm3.y}`}
          />

          {/* arrow from origin to min-norm solution */}
          <line className="vector result" x1={origin.x} x2={solPt.x} y1={origin.y} y2={solPt.y} />
          <circle cx={solPt.x} cy={solPt.y} fill="#dc2626" r="5" />
          <text x={solPt.x + 7} y={solPt.y - 7} style={{ fontSize: 10, fill: "#dc2626" }}>최소노름해</text>
          <text x={solPt.x + 7} y={solPt.y + 12} style={{ fontSize: 9, fill: "#dc2626" }}>‖x‖={norm.toFixed(2)}</text>

          {/* a larger solution on the line */}
          <circle cx={bigPt.x} cy={bigPt.y} fill="none" r="5" stroke="#888" strokeWidth="1.5" />
          <text x={bigPt.x + 7} y={bigPt.y} style={{ fontSize: 9, fill: "#888" }}>다른 해 (‖x‖ 더 큼)</text>

          {/* origin dot */}
          <circle className="joint" cx={origin.x} cy={origin.y} r="4" />
          <text x={origin.x + 5} y={origin.y - 6} style={{ fontSize: 10 }}>O</text>

          <text x="20" y={height - 8} style={{ fontSize: 9, fill: "#888" }}>
            pseudoinverse는 해 직선 위 원점에서 가장 가까운 점을 선택합니다
          </text>
        </svg>
      </div>
    </VisualFrame>
  );
}
