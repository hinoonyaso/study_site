import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function RetrievalFlowVisualizer() {
  const [chunks, setChunks] = useState(8);
  const [topK, setTopK] = useState(3);
  const [strictness, setStrictness] = useState(0.7);
  const retrieved = Math.min(chunks, topK);
  const groundedScore = Math.min(0.98, 0.42 + retrieved * 0.1 + strictness * 0.24);
  const latency = 180 + chunks * 9 + topK * 42;
  const passRate = Math.max(0, Math.min(1, groundedScore - Math.max(0, topK - 4) * 0.04));
  const nodes = [
    ["문서", `${chunks} chunks`],
    ["검색", `top-${retrieved}`],
    ["컨텍스트", `${Math.round(groundedScore * 100)}% grounded`],
    ["프롬프트", "JSON output"],
    ["평가", `${Math.round(passRate * 100)}% pass`],
  ];

  return (
    <VisualFrame
      icon={<Workflow size={18} aria-hidden />}
      metrics={[
        ["retrieved", `${retrieved}/${chunks}`],
        ["latency", `${latency} ms`],
        ["eval pass", `${Math.round(passRate * 100)}%`],
      ]}
      title="Retrieval / Eval Harness"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="chunks" max={18} min={4} onChange={setChunks} step={1} value={chunks} />
          <Slider label="top-k" max={6} min={1} onChange={setTopK} step={1} value={topK} />
          <Slider label="schema strictness" max={1} min={0.1} onChange={setStrictness} step={0.05} value={strictness} />
        </div>
        <div className="flow-visual">
          {nodes.map(([label, value], index) => (
            <div className="flow-step-wrap" key={label}>
              <div className="flow-step">
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
