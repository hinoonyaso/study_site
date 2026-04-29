import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function Matrix3DTransformVisualizer() {
  const [scaleZ, setScaleZ] = useState(1.25);
  const [shearXY, setShearXY] = useState(0.35);
  const [tiltZX, setTiltZX] = useState(0.25);
  const width = 430;
  const height = 300;
  const scale = 72;
  const transform = (p: Point3): Point3 => ({
    x: p.x + shearXY * p.y,
    y: p.y,
    z: tiltZX * p.x + scaleZ * p.z,
  });
  const corners: Point3[] = [
    { x: -1, y: -1, z: -1 },
    { x: 1, y: -1, z: -1 },
    { x: 1, y: 1, z: -1 },
    { x: -1, y: 1, z: -1 },
    { x: -1, y: -1, z: 1 },
    { x: 1, y: -1, z: 1 },
    { x: 1, y: 1, z: 1 },
    { x: -1, y: 1, z: 1 },
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  const projected = corners.map((p) => project3D(transform(p), width, height, scale));
  const basis = [
    { label: "A e_x", point: transform({ x: 1.35, y: 0, z: 0 }), className: "original" },
    { label: "A e_y", point: transform({ x: 0, y: 1.35, z: 0 }), className: "result" },
    { label: "A e_z", point: transform({ x: 0, y: 0, z: 1.35 }), className: "accent" },
  ];
  const origin = project3D({ x: 0, y: 0, z: 0 }, width, height, scale);
  const det = scaleZ;

  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["det(A)", det.toFixed(2)],
        ["3D volume scale", det.toFixed(2)],
        ["inverse", Math.abs(det) < 0.08 ? "unstable" : "ok"],
      ]}
      title="3D Matrix Transform"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="z scale" max={2.5} min={0.1} onChange={setScaleZ} step={0.05} value={scaleZ} />
          <Slider label="xy shear" max={1.2} min={-1.2} onChange={setShearXY} step={0.05} value={shearXY} />
          <Slider label="z from x tilt" max={1.2} min={-1.2} onChange={setTiltZX} step={0.05} value={tiltZX} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          {edges.map(([a, b]) => (
            <line className="grid-line-soft" key={`${a}-${b}`} x1={projected[a].x} x2={projected[b].x} y1={projected[a].y} y2={projected[b].y} />
          ))}
          {basis.map((axis) => {
            const end = project3D(axis.point, width, height, scale);
            return (
              <g key={axis.label}>
                <line className={`vector ${axis.className}`} x1={origin.x} x2={end.x} y1={origin.y} y2={end.y} />
                <circle className={`point ${axis.className === "accent" ? "target" : axis.className}`} cx={end.x} cy={end.y} r="5" />
                <text x={end.x + 8} y={end.y - 8}>{axis.label}</text>
              </g>
            );
          })}
          <text x="24" y="28">unit cube after A</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
