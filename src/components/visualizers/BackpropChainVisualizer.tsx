import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function BackpropChainVisualizer() {
  const [gate, setGate] = useState(1);
  const [error, setError] = useState(-0.75);
  const gradOut = 2 * error;
  const gradHidden = gradOut * gate;
  const nodes = [
    ["x", "input"],
    ["W1", `grad ${gradHidden.toFixed(2)}`],
    ["ReLU", `gate ${gate.toFixed(2)}`],
    ["W2", `grad ${gradOut.toFixed(2)}`],
    ["L", `err ${error.toFixed(2)}`],
  ];
  return (
    <VisualFrame
      icon={<Workflow size={18} aria-hidden />}
      metrics={[
        ["dL/dy", gradOut.toFixed(2)],
        ["dL/dW1 scale", gradHidden.toFixed(2)],
        ["status", Math.abs(gradHidden) < 0.05 ? "dead gradient" : "flowing"],
      ]}
      title="Backprop Chain Rule"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="ReLU gate" max={1} min={0} onChange={setGate} step={0.05} value={gate} />
          <Slider label="output error" max={2} min={-2} onChange={setError} step={0.05} value={error} />
        </div>
        <div className="flow-visual">
          {nodes.map(([label, value], index) => (
            <div className="flow-step-wrap" key={label}>
              <div className="flow-step">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
              {index < nodes.length - 1 && <div className="flow-arrow">←</div>}
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  );
}
