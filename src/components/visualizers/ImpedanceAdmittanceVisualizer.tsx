import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function ImpedanceAdmittanceVisualizer() {
  const [stiffness, setStiffness] = useState(45);
  const [dampingValue, setDampingValue] = useState(7);
  const [mass, setMass] = useState(1.4);
  const [force, setForce] = useState(8);
  const staticDisplacement = force / Math.max(1, stiffness);
  const response = useMemo(() => {
    const dt = 0.015;
    let x = 0;
    let v = 0;
    return Array.from({ length: 180 }, (_, index) => {
      const a = (force - dampingValue * v - stiffness * x) / Math.max(0.1, mass);
      v += a * dt;
      x += v * dt;
      return { t: index * dt, x, v };
    });
  }, [dampingValue, force, mass, stiffness]);
  const width = 430;
  const height = 220;
  const maxX = Math.max(0.16, staticDisplacement * 1.4);
  const maxForce = Math.max(12, force * 1.4);
  const mapFd = (x: number, y: number) => ({
    x: 40 + (x / maxX) * (width - 76),
    y: height - 36 - (y / maxForce) * (height - 68),
  });
  const fdLine = [mapFd(0, 0), mapFd(maxX, stiffness * maxX)];
  const operatingPoint = mapFd(staticDisplacement, force);
  const maxResponseX = Math.max(maxX, ...response.map((point) => Math.abs(point.x))) * 1.1;
  const mapResponse = (point: { t: number; x: number }) => ({
    x: 36 + (point.t / response[response.length - 1].t) * (width - 72),
    y: height - 32 - (point.x / maxResponseX) * (height - 64),
  });
  const responsePoints = response.map(mapResponse);
  const finalX = response[response.length - 1].x;
  const dampingRatio = dampingValue / Math.max(0.01, 2 * Math.sqrt(stiffness * mass));

  return (
    <VisualFrame
      icon={<Activity size={18} aria-hidden />}
      metrics={[
        ["x = F/K", `${staticDisplacement.toFixed(3)} m`],
        ["damping ratio", dampingRatio.toFixed(2)],
        ["final response", `${finalX.toFixed(3)} m`],
      ]}
      title="Impedance / Admittance Force-Displacement"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="stiffness K" max={120} min={5} onChange={setStiffness} step={1} suffix=" N/m" value={stiffness} />
          <Slider label="damping B" max={25} min={0.1} onChange={setDampingValue} step={0.1} suffix=" Ns/m" value={dampingValue} />
          <Slider label="virtual mass M" max={8} min={0.2} onChange={setMass} step={0.1} suffix=" kg" value={mass} />
          <Slider label="measured force" max={20} min={0} onChange={setForce} step={0.2} suffix=" N" value={force} />
          <div className="hint-box">impedance는 변위 오차에서 힘을 만들고, admittance는 측정 힘에서 목표 변위를 만듭니다. 힘센서가 없으면 admittance 입력 자체가 없습니다.</div>
        </div>
        <div className="visual-stack">
          <svg className="plot compact-plot" role="img" viewBox={`0 0 ${width} ${height}`}>
            <line className="axis" x1="36" x2={width - 28} y1={height - 36} y2={height - 36} />
            <line className="axis" x1="40" x2="40" y1="26" y2={height - 32} />
            <line className="vector result" x1={fdLine[0].x} x2={fdLine[1].x} y1={fdLine[0].y} y2={fdLine[1].y} />
            <circle className="point target" cx={operatingPoint.x} cy={operatingPoint.y} r="7" />
            <text x="50" y="30">force = K x</text>
            <text x={operatingPoint.x + 8} y={operatingPoint.y - 8}>operating point</text>
          </svg>
          <svg className="plot compact-plot" role="img" viewBox={`0 0 ${width} ${height}`}>
            <line className="axis" x1="32" x2={width - 28} y1={height - 32} y2={height - 32} />
            <line className="axis" x1="36" x2="36" y1="26" y2={height - 32} />
            <line className="cross-track-line" x1="36" x2={width - 30} y1={mapResponse({ t: 0, x: staticDisplacement }).y} y2={mapResponse({ t: response[response.length - 1].t, x: staticDisplacement }).y} />
            <polyline className="vector original" fill="none" points={polyline(responsePoints)} />
            <text x="46" y="30">admittance step response x(t)</text>
          </svg>
        </div>
      </div>
    </VisualFrame>
  );
}
