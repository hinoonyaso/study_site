import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function VLAArchitectureVisualizer() {
  const [vision, setVision] = useState(0.55);
  const [language, setLanguage] = useState(0.45);
  const confidence = Math.min(1, 0.35 + 0.4 * vision + 0.35 * language);
  const nodes = [["Vision", vision.toFixed(2)], ["Language", language.toFixed(2)], ["Fusion", confidence.toFixed(2)], ["Action", confidence > 0.72 ? "execute" : "ask/stop"]];
  return (
    <VisualFrame icon={<Workflow size={18} aria-hidden />} metrics={[["vision", vision.toFixed(2)], ["language", language.toFixed(2)], ["policy confidence", confidence.toFixed(2)]]} title="VLA Architecture">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="vision weight" max={1} min={0} onChange={setVision} step={0.05} value={vision} />
          <Slider label="language weight" max={1} min={0} onChange={setLanguage} step={0.05} value={language} />
        </div>
        <div className="flow-visual">{nodes.map(([label, value]) => <div className="flow-step" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      </div>
    </VisualFrame>
  );
}
