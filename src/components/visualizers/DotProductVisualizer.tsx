import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function DotProductVisualizer() {
  const [angle, setAngle] = useState(55);
  const [speed, setSpeed] = useState(1.4);
  const [force, setForce] = useState(1.1);
  const theta = (angle * Math.PI) / 180;
  const velocity = { x: speed, y: 0 };
  const forceVector = { x: force * Math.cos(theta), y: force * Math.sin(theta) };
  const dot = velocity.x * forceVector.x + velocity.y * forceVector.y;
  const projection = dot / Math.max(0.001, speed);
  const width = 430;
  const height = 280;
  const scale = 78;
  const origin = worldToSvg({ x: 0, y: 0 }, width, height, scale);
  const vEnd = worldToSvg(velocity, width, height, scale);
  const fEnd = worldToSvg(forceVector, width, height, scale);
  const pEnd = worldToSvg({ x: projection, y: 0 }, width, height, scale);

  return (
    <VisualFrame
      icon={<Sigma size={18} aria-hidden />}
      metrics={[
        ["v · F", dot.toFixed(2)],
        ["cos θ", Math.cos(theta).toFixed(2)],
        ["parallel component", projection.toFixed(2)],
      ]}
      title="Dot Product Projection"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="angle between vectors" max={180} min={0} onChange={setAngle} step={1} suffix="°" value={angle} />
          <Slider label="velocity norm" max={2.5} min={0.2} onChange={setSpeed} step={0.05} value={speed} />
          <Slider label="force norm" max={2.5} min={0.2} onChange={setForce} step={0.05} value={force} />
          <div className="hint-box">내적은 힘/속도 분해처럼 한 벡터가 다른 벡터 방향으로 얼마나 작용하는지 읽는 도구입니다.</div>
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="24" x2={width - 24} y1={origin.y} y2={origin.y} />
          <line className="axis" x1={origin.x} x2={origin.x} y1="24" y2={height - 24} />
          <line className="vector original" x1={origin.x} x2={vEnd.x} y1={origin.y} y2={vEnd.y} />
          <line className="vector result" x1={origin.x} x2={fEnd.x} y1={origin.y} y2={fEnd.y} />
          <line className="cross-track-line" x1={fEnd.x} x2={pEnd.x} y1={fEnd.y} y2={pEnd.y} />
          <line className="velocity-arrow" x1={origin.x} x2={pEnd.x} y1={origin.y + 14} y2={pEnd.y + 14} />
          <circle className="point original" cx={vEnd.x} cy={vEnd.y} r="5" />
          <circle className="point result" cx={fEnd.x} cy={fEnd.y} r="5" />
          <circle className="point target" cx={pEnd.x} cy={pEnd.y} r="5" />
          <text x={vEnd.x + 8} y={vEnd.y - 8}>v</text>
          <text x={fEnd.x + 8} y={fEnd.y - 8}>F</text>
          <text x={pEnd.x + 8} y={pEnd.y + 24}>proj(F on v)</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
