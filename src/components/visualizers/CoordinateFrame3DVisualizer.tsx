import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function CoordinateFrame3DVisualizer() {
  const [yaw, setYaw] = useState(35);
  const [pitch, setPitch] = useState(18);
  const [tx, setTx] = useState(0.8);
  const [ty, setTy] = useState(0.35);
  const [tz, setTz] = useState(0.25);
  const width = 430;
  const height = 300;
  const scale = 80;
  const yawRad = (yaw * Math.PI) / 180;
  const pitchRad = (pitch * Math.PI) / 180;
  const cy = Math.cos(yawRad);
  const sy = Math.sin(yawRad);
  const cp = Math.cos(pitchRad);
  const sp = Math.sin(pitchRad);
  const R = [
    [cy * cp, -sy, cy * sp],
    [sy * cp, cy, sy * sp],
    [-sp, 0, cp],
  ];
  const t: Point3 = { x: tx, y: ty, z: tz };
  const apply = (p: Point3): Point3 => ({
    x: R[0][0] * p.x + R[0][1] * p.y + R[0][2] * p.z + t.x,
    y: R[1][0] * p.x + R[1][1] * p.y + R[1][2] * p.z + t.y,
    z: R[2][0] * p.x + R[2][1] * p.y + R[2][2] * p.z + t.z,
  });
  const worldOrigin = project3D({ x: 0, y: 0, z: 0 }, width, height, scale);
  const childOrigin = project3D(t, width, height, scale);
  const axes = [
    { label: "x_child", p: apply({ x: 0.85, y: 0, z: 0 }), className: "original" },
    { label: "y_child", p: apply({ x: 0, y: 0.85, z: 0 }), className: "result" },
    { label: "z_child", p: apply({ x: 0, y: 0, z: 0.85 }), className: "target" },
  ];
  const localPoint = { x: 0.45, y: 0.3, z: 0.25 };
  const worldPoint = apply(localPoint);
  const sWorldPoint = project3D(worldPoint, width, height, scale);

  return (
    <VisualFrame
      icon={<Crosshair size={18} aria-hidden />}
      metrics={[
        ["child origin", `(${tx.toFixed(2)}, ${ty.toFixed(2)}, ${tz.toFixed(2)})`],
        ["yaw/pitch", `${yaw.toFixed(0)}° / ${pitch.toFixed(0)}°`],
        ["p_world", `(${worldPoint.x.toFixed(2)}, ${worldPoint.y.toFixed(2)}, ${worldPoint.z.toFixed(2)})`],
      ]}
      title="3D Coordinate Frame Transform"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="yaw z" max={180} min={-180} onChange={setYaw} step={1} suffix="°" value={yaw} />
          <Slider label="pitch y" max={80} min={-80} onChange={setPitch} step={1} suffix="°" value={pitch} />
          <Slider label="tx" max={1.6} min={-1.6} onChange={setTx} step={0.05} value={tx} />
          <Slider label="ty" max={1.6} min={-1.6} onChange={setTy} step={0.05} value={ty} />
          <Slider label="tz" max={1.4} min={-0.8} onChange={setTz} step={0.05} value={tz} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1={worldOrigin.x} x2={project3D({ x: 1.4, y: 0, z: 0 }, width, height, scale).x} y1={worldOrigin.y} y2={project3D({ x: 1.4, y: 0, z: 0 }, width, height, scale).y} />
          <line className="axis" x1={worldOrigin.x} x2={project3D({ x: 0, y: 1.4, z: 0 }, width, height, scale).x} y1={worldOrigin.y} y2={project3D({ x: 0, y: 1.4, z: 0 }, width, height, scale).y} />
          <line className="axis" x1={worldOrigin.x} x2={project3D({ x: 0, y: 0, z: 1.4 }, width, height, scale).x} y1={worldOrigin.y} y2={project3D({ x: 0, y: 0, z: 1.4 }, width, height, scale).y} />
          <line className="cross-track-line" x1={worldOrigin.x} x2={childOrigin.x} y1={worldOrigin.y} y2={childOrigin.y} />
          {axes.map((axis) => {
            const end = project3D(axis.p, width, height, scale);
            return (
              <g key={axis.label}>
                <line className={`vector ${axis.className}`} x1={childOrigin.x} x2={end.x} y1={childOrigin.y} y2={end.y} />
                <text x={end.x + 8} y={end.y - 8}>{axis.label}</text>
              </g>
            );
          })}
          <circle className="joint" cx={worldOrigin.x} cy={worldOrigin.y} r="5" />
          <circle className="point target" cx={childOrigin.x} cy={childOrigin.y} r="6" />
          <circle className="point result" cx={sWorldPoint.x} cy={sWorldPoint.y} r="6" />
          <text x={sWorldPoint.x + 8} y={sWorldPoint.y - 8}>T p_child</text>
          <text x="24" y="28">world frame → child frame</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
