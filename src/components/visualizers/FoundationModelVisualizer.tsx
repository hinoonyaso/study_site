import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function FoundationModelVisualizer() {
  const [confidence, setConfidence] = useState(0.8);
  const [actionNorm, setActionNorm] = useState(0.02);
  const blocked = confidence < 0.55 || actionNorm > 0.08;
  const nodes = [
    ["Vision", "image tokens"],
    ["Language", "task tokens"],
    ["RFM", "action token"],
    ["Safety", blocked ? "stop" : "pass"],
    ["ROS2", blocked ? "hold" : "execute"],
  ];
  return (
    <VisualFrame
      icon={<Workflow size={18} aria-hidden />}
      metrics={[
        ["confidence", confidence.toFixed(2)],
        ["action norm", `${actionNorm.toFixed(3)} m`],
        ["decision", blocked ? "blocked" : "execute"],
      ]}
      title="Robot Foundation Model Pipeline"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="confidence" max={1} min={0} onChange={setConfidence} step={0.01} value={confidence} />
          <Slider label="action norm" max={0.2} min={0} onChange={setActionNorm} step={0.005} suffix=" m" value={actionNorm} />
        </div>
        <div className="flow-visual">
          {nodes.map(([label, value], index) => (
            <div className="flow-step-wrap" key={label}>
              <div className={label === "Safety" && blocked ? "flow-step is-alert" : "flow-step"}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
              {index < nodes.length - 1 && <div className="flow-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  );
}
