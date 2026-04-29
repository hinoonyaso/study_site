import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function SegmentationMaskVisualizer() {
  const [threshold, setThreshold] = useState(0.5);
  const cells = Array.from({ length: 48 }, (_, i) => Math.abs(Math.sin(i * 0.9)) > threshold);
  const iou = cells.filter(Boolean).length / 32;
  return (
    <VisualFrame icon={<Grid3X3 size={18} aria-hidden />} metrics={[["threshold", threshold.toFixed(2)], ["mask pixels", String(cells.filter(Boolean).length)], ["IoU proxy", Math.min(1, iou).toFixed(2)]]} title="Segmentation Mask">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="mask threshold" max={0.9} min={0.1} onChange={setThreshold} step={0.05} value={threshold} />
        </div>
        <div className="grid-visual" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
          {cells.map((on, i) => <div className={on ? "grid-cell is-path" : "grid-cell"} key={i} />)}
        </div>
      </div>
    </VisualFrame>
  );
}
