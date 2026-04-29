import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function AiMetricsVisualizer() {
  const [tp, setTp] = useState(45);
  const [fp, setFp] = useState(8);
  const [fn, setFn] = useState(5);
  const [tn, setTn] = useState(42);
  const precision = tp / Math.max(1, tp + fp);
  const recall = tp / Math.max(1, tp + fn);
  const f1 = (2 * precision * recall) / Math.max(0.001, precision + recall);
  const accuracy = (tp + tn) / Math.max(1, tp + tn + fp + fn);

  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["accuracy", accuracy.toFixed(3)],
        ["precision", precision.toFixed(3)],
        ["recall", recall.toFixed(3)],
        ["F1", f1.toFixed(3)],
      ]}
      title="Confusion Matrix"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="TP" max={100} min={0} onChange={setTp} step={1} value={tp} />
          <Slider label="FP" max={100} min={0} onChange={setFp} step={1} value={fp} />
          <Slider label="FN" max={100} min={0} onChange={setFn} step={1} value={fn} />
          <Slider label="TN" max={100} min={0} onChange={setTn} step={1} value={tn} />
        </div>
        <div className="confusion-grid">
          <div className="matrix-cell good">
            <span>TP</span>
            <strong>{tp}</strong>
          </div>
          <div className="matrix-cell warn">
            <span>FP</span>
            <strong>{fp}</strong>
          </div>
          <div className="matrix-cell warn">
            <span>FN</span>
            <strong>{fn}</strong>
          </div>
          <div className="matrix-cell good">
            <span>TN</span>
            <strong>{tn}</strong>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
