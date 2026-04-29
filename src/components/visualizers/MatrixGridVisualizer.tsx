import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function MatrixGridVisualizer() {
  const [scaleX, setScaleX] = useState(1.4);
  const [shear, setShear] = useState(0.4);
  const [basisRotation, setBasisRotation] = useState(25);
  const width = 430;
  const height = 300;
  const scale = 54;
  const origin = worldToSvg({ x: 0, y: 0 }, width, height, scale);
  const bTheta = (basisRotation * Math.PI) / 180;
  const firstTransform = (point: Point) => ({
    x: Math.cos(bTheta) * point.x - Math.sin(bTheta) * point.y,
    y: Math.sin(bTheta) * point.x + Math.cos(bTheta) * point.y,
  });
  const secondTransform = (point: Point) => ({
    x: scaleX * point.x + shear * point.y,
    y: point.y,
  });
  const composedTransform = (point: Point) => secondTransform(firstTransform(point));
  const detA = scaleX;
  const detAB = detA;
  const forceRad = bTheta;
  const r = { x: 0.8, y: 0 };
  const force = { x: Math.cos(forceRad), y: Math.sin(forceRad) };
  const torqueZ = r.x * force.y - r.y * force.x;
  const gridLines = Array.from({ length: 9 }, (_, index) => index - 4);
  const line = (fn: (point: Point) => Point, a: Point, b: Point) => {
    const ta = worldToSvg(fn(a), width, height, scale);
    const tb = worldToSvg(fn(b), width, height, scale);
    return { ta, tb };
  };
  const forceEnd = worldToSvg({ x: r.x + force.x * 0.9, y: r.y + force.y * 0.9 }, width, height, scale);
  const lever = worldToSvg(r, width, height, scale);

  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["det(A)", detA.toFixed(2)],
        ["det(AB)", detAB.toFixed(2)],
        ["tau_z", torqueZ.toFixed(2)],
        ["inverse", Math.abs(detAB) < 0.08 ? "unstable" : "ok"],
      ]}
      title="Matrix Multiplication Grid / Cross Product"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="scale x" max={3} min={0.1} onChange={setScaleX} step={0.05} value={scaleX} />
          <Slider label="shear xy" max={1.5} min={-1.5} onChange={setShear} step={0.05} value={shear} />
          <Slider label="B basis / F angle" max={90} min={-90} onChange={setBasisRotation} step={1} suffix="°" value={basisRotation} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="20" x2={width - 20} y1={origin.y} y2={origin.y} />
          <line className="axis" x1={origin.x} x2={origin.x} y1="20" y2={height - 20} />
          {gridLines.map((value) => {
            const firstVertical = line(firstTransform, { x: value, y: -3.5 }, { x: value, y: 3.5 });
            const firstHorizontal = line(firstTransform, { x: -3.5, y: value }, { x: 3.5, y: value });
            const finalVertical = line(composedTransform, { x: value, y: -3.5 }, { x: value, y: 3.5 });
            const finalHorizontal = line(composedTransform, { x: -3.5, y: value }, { x: 3.5, y: value });
            return (
              <g key={value}>
                <line className="grid-line-soft" strokeDasharray="4 4" x1={firstVertical.ta.x} x2={firstVertical.tb.x} y1={firstVertical.ta.y} y2={firstVertical.tb.y} />
                <line className="grid-line-soft" strokeDasharray="4 4" x1={firstHorizontal.ta.x} x2={firstHorizontal.tb.x} y1={firstHorizontal.ta.y} y2={firstHorizontal.tb.y} />
                <line className="grid-line-soft" x1={finalVertical.ta.x} x2={finalVertical.tb.x} y1={finalVertical.ta.y} y2={finalVertical.tb.y} />
                <line className="grid-line-soft" x1={finalHorizontal.ta.x} x2={finalHorizontal.tb.x} y1={finalHorizontal.ta.y} y2={finalHorizontal.tb.y} />
              </g>
            );
          })}
          <line className="vector original" x1={origin.x} x2={lever.x} y1={origin.y} y2={lever.y} />
          <line className="vector result" x1={lever.x} x2={forceEnd.x} y1={lever.y} y2={forceEnd.y} />
          <circle className="joint" cx={origin.x} cy={origin.y} r="5" />
          <circle className="point result" cx={lever.x} cy={lever.y} r="5" />
          <text x="24" y="32">dashed: B grid</text>
          <text x="24" y="52">solid: A(B grid)</text>
          <text x={forceEnd.x + 8} y={forceEnd.y - 8}>F</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
