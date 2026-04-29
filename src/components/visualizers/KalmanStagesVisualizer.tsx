import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function KalmanStagesVisualizer() {
  const [priorP, setPriorP] = useState(1.1);
  const [processQ, setProcessQ] = useState(0.25);
  const [measurementR, setMeasurementR] = useState(0.7);
  const [innovation, setInnovation] = useState(1.2);
  const priorX = 0;
  const u = 1;
  const xPred = priorX + u;
  const pPred = priorP + processQ;
  const k = pPred / (pPred + measurementR);
  const z = xPred + innovation;
  const xUpd = xPred + k * (z - xPred);
  const pUpd = (1 - k) * pPred;
  const stages = [
    ["prior", priorX, priorP],
    ["predict", xPred, pPred],
    ["measurement", z, measurementR],
    ["update", xUpd, pUpd],
  ] as const;
  const width = 430;
  const height = 280;
  const mapX = (value: number) => 40 + ((value + 1.2) / 4.6) * 350;
  const yFor = (index: number) => 58 + index * 54;

  return (
    <VisualFrame
      icon={<Activity size={18} aria-hidden />}
      metrics={[
        ["P predict", pPred.toFixed(2)],
        ["Kalman gain", k.toFixed(2)],
        ["P update", pUpd.toFixed(2)],
      ]}
      title="Kalman Predict / Update Stages"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="prior P" max={3} min={0.05} onChange={setPriorP} step={0.05} value={priorP} />
          <Slider label="process Q" max={2} min={0} onChange={setProcessQ} step={0.05} value={processQ} />
          <Slider label="measurement R" max={3} min={0.05} onChange={setMeasurementR} step={0.05} value={measurementR} />
          <Slider label="innovation z-x" max={2.5} min={-2.5} onChange={setInnovation} step={0.05} value={innovation} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="38" x2="392" y1="238" y2="238" />
          {stages.map(([label, x, uncertainty], index) => {
            const cx = mapX(x);
            const cy = yFor(index);
            const radius = 10 + uncertainty * 20;
            return (
              <g key={label}>
                <circle className={label === "measurement" ? "workspace-ring" : "manip-ellipse"} cx={cx} cy={cy} r={radius} />
                <circle className={label === "measurement" ? "point target" : "point result"} cx={cx} cy={cy} r="6" />
                <text x="24" y={cy + 4}>{label}</text>
                <text x={cx + radius + 8} y={cy + 4}>x={x.toFixed(2)}, P={uncertainty.toFixed(2)}</text>
              </g>
            );
          })}
          <line className="cross-track-line" x1={mapX(xPred)} x2={mapX(z)} y1={yFor(1)} y2={yFor(2)} />
          <line className="velocity-arrow" x1={mapX(xPred)} x2={mapX(xUpd)} y1={yFor(1)} y2={yFor(3)} />
        </svg>
      </div>
    </VisualFrame>
  );
}
