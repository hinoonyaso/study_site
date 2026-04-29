import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function CrossProduct3DVisualizer() {
  const [forceAngle, setForceAngle] = useState(90);
  const [force, setForce] = useState(6);
  const [outOfPlane, setOutOfPlane] = useState(0.25);
  const width = 430;
  const height = 300;
  const scale = 90;
  const rad = (forceAngle * Math.PI) / 180;
  const r: Point3 = { x: 1.1, y: 0, z: 0 };
  const f: Point3 = {
    x: Math.cos(rad) * force,
    y: Math.sin(rad) * force,
    z: outOfPlane * force,
  };
  const tau: Point3 = {
    x: r.y * f.z - r.z * f.y,
    y: r.z * f.x - r.x * f.z,
    z: r.x * f.y - r.y * f.x,
  };
  const tauMag = Math.hypot(tau.x, tau.y, tau.z);
  const fScale = 0.11;
  const tauScale = tauMag > 0 ? 0.85 / tauMag : 0;
  const origin = project3D({ x: 0, y: 0, z: 0 }, width, height, scale);
  const rEnd = project3D(r, width, height, scale);
  const fEnd = project3D({ x: r.x + f.x * fScale, y: r.y + f.y * fScale, z: r.z + f.z * fScale }, width, height, scale);
  const tauEnd = project3D({ x: tau.x * tauScale, y: tau.y * tauScale, z: tau.z * tauScale }, width, height, scale);

  return (
    <VisualFrame
      icon={<Crosshair size={18} aria-hidden />}
      metrics={[
        ["|tau|", tauMag.toFixed(2)],
        ["tau_z", tau.z.toFixed(2)],
        ["right hand", tauMag < 0.05 ? "parallel" : tau.z >= 0 ? "+z" : "-z"],
      ]}
      title="3D Cross Product Torque"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="force angle" max={180} min={0} onChange={setForceAngle} step={1} suffix="°" value={forceAngle} />
          <Slider label="force" max={20} min={0} onChange={setForce} step={0.2} suffix=" N" value={force} />
          <Slider label="out of plane" max={1} min={-1} onChange={setOutOfPlane} step={0.05} value={outOfPlane} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="35" x2={width - 35} y1={height / 2 + 42} y2={height / 2 - 42} />
          <line className="axis" x1={width / 2} x2={width / 2} y1="30" y2={height - 35} />
          <line className="vector original" x1={origin.x} x2={rEnd.x} y1={origin.y} y2={rEnd.y} />
          <line className="vector result" x1={rEnd.x} x2={fEnd.x} y1={rEnd.y} y2={fEnd.y} />
          <line className="vector accent" x1={origin.x} x2={tauEnd.x} y1={origin.y} y2={tauEnd.y} />
          <circle className="joint" cx={origin.x} cy={origin.y} r="5" />
          <circle className="point original" cx={rEnd.x} cy={rEnd.y} r="5" />
          <text x={rEnd.x + 8} y={rEnd.y + 4}>r</text>
          <text x={fEnd.x + 8} y={fEnd.y - 8}>F</text>
          <text x={tauEnd.x + 8} y={tauEnd.y - 8}>tau=r x F</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
