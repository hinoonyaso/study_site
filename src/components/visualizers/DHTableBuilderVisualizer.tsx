import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix, DhRow } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function DHTableBuilderVisualizer() {
  const [rows, setRows] = useState<DhRow[]>([
    { theta: 35, a: 0.9, d: 0, alpha: 0 },
    { theta: 45, a: 0.72, d: 0, alpha: 0 },
    { theta: -30, a: 0.48, d: 0, alpha: 0 },
  ]);
  const updateRow = (index: number, key: keyof DhRow, value: number) => {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  };
  const transforms = rows.map((row) => dhTransform((row.theta * Math.PI) / 180, row.a, row.d, (row.alpha * Math.PI) / 180));
  const frames = transforms.reduce<Array<{ label: string; matrix: Matrix; origin: Point3 }>>(
    (items, transform, index) => {
      const previous = items[items.length - 1].matrix;
      const matrix = multiplyMatrices(previous, transform);
      items.push({
        label: `T0${index + 1}`,
        matrix,
        origin: { x: matrix[0][3], y: matrix[1][3], z: matrix[2][3] },
      });
      return items;
    },
    [{
      label: "T00",
      matrix: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ],
      origin: { x: 0, y: 0, z: 0 },
    }],
  );
  const width = 430;
  const height = 310;
  const scale = 82;
  const projected = frames.map((frame) => project3D(frame.origin, width, height, scale));
  const ee = frames[frames.length - 1].origin;
  const matrixCards = [
    ["A1(theta,d,a,alpha)", transforms[0]],
    ["A2(theta,d,a,alpha)", transforms[1]],
    ["A3(theta,d,a,alpha)", transforms[2]],
    ["T03 = A1 x A2 x A3", frames[frames.length - 1].matrix],
  ] as Array<[string, Matrix]>;
  const guideCards = [
    ["theta", "z_i 축을 기준으로 joint frame을 돌린 각도"],
    ["d", "z_i 축 방향으로 다음 공통 법선까지 이동한 거리"],
    ["a", "x_i 공통 법선 방향 link length"],
    ["alpha", "x_i 축을 기준으로 z_i와 z_{i+1}를 맞추는 twist"],
  ] as const;

  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["end-effector", `(${ee.x.toFixed(2)}, ${ee.y.toFixed(2)}, ${ee.z.toFixed(2)})`],
        ["link count", String(rows.length)],
        ["chain", "base -> link1 -> link2 -> tool0"],
      ]}
      title="DH Table Builder / FK Matrix Steps"
    >
      <>
        <div className="visual-layout">
          <div className="control-stack">
            <div className="dh-table" role="group" aria-label="DH parameter table">
              <div className="dh-row is-header">
                <span>i</span>
                <span>theta</span>
                <span>a</span>
                <span>d</span>
                <span>alpha</span>
              </div>
              {rows.map((row, index) => (
                <div className="dh-row" key={index}>
                  <strong>{index + 1}</strong>
                  <input aria-label={`theta ${index + 1}`} max={180} min={-180} onChange={(event) => updateRow(index, "theta", Number(event.target.value))} step={1} type="number" value={row.theta} />
                  <input aria-label={`a ${index + 1}`} max={1.6} min={0.1} onChange={(event) => updateRow(index, "a", Number(event.target.value))} step={0.05} type="number" value={row.a} />
                  <input aria-label={`d ${index + 1}`} max={1.2} min={-1.2} onChange={(event) => updateRow(index, "d", Number(event.target.value))} step={0.05} type="number" value={row.d} />
                  <input aria-label={`alpha ${index + 1}`} max={180} min={-180} onChange={(event) => updateRow(index, "alpha", Number(event.target.value))} step={1} type="number" value={row.alpha} />
                </div>
              ))}
            </div>
            <div className="hint-box">표의 theta/a/d/alpha 값을 바꾸면 A_i 행렬과 말단 위치가 즉시 갱신됩니다.</div>
          </div>
          <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
            <line className="axis" x1="38" x2={width - 34} y1={height / 2 + 60} y2={height / 2 - 48} />
            <line className="axis" x1={width / 2} x2={width / 2} y1="30" y2={height - 34} />
            <line className="vector target" x1={projected[1].x} x2={projected[1].x + 46} y1={projected[1].y} y2={projected[1].y - 32} />
            <line className="vector original" x1={projected[1].x} x2={projected[1].x} y1={projected[1].y} y2={projected[1].y - 50} />
            <text x={projected[1].x + 50} y={projected[1].y - 34}>a: along x_i</text>
            <text x={projected[1].x + 8} y={projected[1].y - 54}>d: along z_i</text>
            {projected.slice(1).map((point, index) => {
              const prev = projected[index];
              return <line className="link" key={index} x1={prev.x} x2={point.x} y1={prev.y} y2={point.y} />;
            })}
            {projected.map((point, index) => (
              <g key={index}>
                <circle className={index === projected.length - 1 ? "point result" : "joint"} cx={point.x} cy={point.y} r="6" />
                <text x={point.x + 8} y={point.y - 8}>{frames[index].label}</text>
              </g>
            ))}
            <text x="24" y="28">DH table -&gt; A_i -&gt; T03 -&gt; robot pose</text>
            <text x="24" y="48">theta: rotate about z_i · alpha: twist about x_i</text>
          </svg>
        </div>
        <div className="matrix-step-grid">
          {guideCards.map(([label, description]) => (
            <div className="matrix-card" key={label}>
              <span>read {label}</span>
              <code>{description}</code>
            </div>
          ))}
        </div>
        <div className="matrix-step-grid">
          {matrixCards.map(([label, matrix]) => (
            <div className="matrix-card" key={label}>
              <span>{label}</span>
              <code>{formatMatrix(matrix)}</code>
            </div>
          ))}
        </div>
      </>
    </VisualFrame>
  );
}
