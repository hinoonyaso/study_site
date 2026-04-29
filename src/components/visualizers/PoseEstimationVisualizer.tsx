import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function PoseEstimationVisualizer() {
  const [noise, setNoise] = useState(1);
  const [depth, setDepth] = useState(1);
  const scale = 72 / depth;
  const reprojection = Math.max(0.1, noise * 0.8 + Math.abs(depth - 1) * 1.2);
  return (
    <VisualFrame
      icon={<Crosshair size={18} aria-hidden />}
      metrics={[
        ["depth", `${depth.toFixed(2)} m`],
        ["reprojection", `${reprojection.toFixed(2)} px`],
        ["pose", reprojection < 3 ? "usable" : "reject"],
      ]}
      title="PnP 6D Pose"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="pixel noise" max={5} min={0} onChange={setNoise} step={0.1} suffix=" px" value={noise} />
          <Slider label="depth Z" max={2} min={0.4} onChange={setDepth} step={0.05} suffix=" m" value={depth} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 420 250">
          <line className="axis" x1="70" x2="350" y1="200" y2="200" />
          <line className="axis" x1="210" x2="210" y1="30" y2="220" />
          <polygon className="uncertainty-fill" points={`${210 - scale},${125 - scale} ${210 + scale},${125 - scale} ${210 + scale},${125 + scale} ${210 - scale},${125 + scale}`} />
          <polygon className="path-line" points={`${210 - scale + noise},${125 - scale - noise} ${210 + scale - noise},${125 - scale + noise} ${210 + scale + noise},${125 + scale - noise} ${210 - scale - noise},${125 + scale + noise}`} />
          <line className="velocity-arrow" x1="210" x2={210 + 45 / depth} y1="125" y2="95" />
          <text x="230" y="92">R,t</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
