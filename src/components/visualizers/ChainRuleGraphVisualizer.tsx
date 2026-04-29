import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function ChainRuleGraphVisualizer() {
  const [innerSlope, setInnerSlope] = useState(0.8);
  const [outerSlope, setOuterSlope] = useState(1.4);
  const [upstream, setUpstream] = useState(1.2);
  const total = upstream * outerSlope * innerSlope;
  const nodes = [
    ["q", "joint angle"],
    ["g(q)", `dg/dq ${innerSlope.toFixed(2)}`],
    ["f(g)", `df/dg ${outerSlope.toFixed(2)}`],
    ["L", `dL/df ${upstream.toFixed(2)}`],
  ];

  return (
    <VisualFrame
      icon={<Workflow size={18} aria-hidden />}
      metrics={[
        ["dL/dq", total.toFixed(3)],
        ["robot example", "d/dq l sin(q) = l cos(q)"],
        ["backprop", "multiply local slopes"],
      ]}
      title="Chain Rule Calculation Graph"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="inner slope dg/dq" max={3} min={-3} onChange={setInnerSlope} step={0.05} value={innerSlope} />
          <Slider label="outer slope df/dg" max={3} min={-3} onChange={setOuterSlope} step={0.05} value={outerSlope} />
          <Slider label="upstream dL/df" max={3} min={-3} onChange={setUpstream} step={0.05} value={upstream} />
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
          <div className="flow-step">
            <span>multiply</span>
            <strong>{upstream.toFixed(2)} × {outerSlope.toFixed(2)} × {innerSlope.toFixed(2)} = {total.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
