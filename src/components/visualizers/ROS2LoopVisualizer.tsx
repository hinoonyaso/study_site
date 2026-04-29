import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function ROS2LoopVisualizer() {
  const [age, setAge] = useState(30);
  const [command, setCommand] = useState(0.5);
  const stale = age > 200;
  const saturated = Math.abs(command) > 1;
  return (
    <VisualFrame icon={<Workflow size={18} aria-hidden />} metrics={[["sensor age", `${age} ms`], ["command", command.toFixed(2)], ["gate", stale || saturated ? "stop" : "publish"]]} title="ROS2 Subscriber-Control-Publisher Loop">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="sensor age" max={1000} min={0} onChange={setAge} step={10} suffix=" ms" value={age} />
          <Slider label="raw command" max={2} min={-2} onChange={setCommand} step={0.05} value={command} />
          {(stale || saturated) && <div className="singularity-banner">Safety gate blocks publish.</div>}
        </div>
        <div className="flow-visual">
          {["Subscriber", "State cache", "Safety gate", stale || saturated ? "Stop cmd" : "Publisher"].map((label) => <div className="flow-step" key={label}><span>{label}</span><strong>{label.includes("Stop") ? "safe" : "ok"}</strong></div>)}
        </div>
      </div>
    </VisualFrame>
  );
}
