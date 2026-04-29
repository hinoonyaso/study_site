import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function OpenCVThresholdVisualizer() {
  const [threshold, setThreshold] = useState(127);
  const [noise, setNoise] = useState(0.05);
  const rectIntensity = 210;
  const bgIntensity = Math.round(noise * 180);
  const foreground = rectIntensity > threshold ? 1 : 0;
  const noiseHits = bgIntensity > threshold ? 18 : Math.round(noise * 8);
  const bboxVisible = foreground === 1;
  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["foreground", bboxVisible ? "1 contour" : "0 contours"],
        ["noise hits", String(noiseHits)],
        ["bbox", bboxVisible ? "(40,30,61,51)" : "-"],
      ]}
      title="OpenCV Threshold / Contour"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="threshold" max={255} min={0} onChange={setThreshold} step={1} value={threshold} />
          <Slider label="noise" max={0.5} min={0} onChange={setNoise} step={0.01} value={noise} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 420 250">
          <rect className="workspace-ring" height="170" width="260" x="80" y="40" />
          {Array.from({ length: noiseHits }).map((_, index) => (
            <circle className="workspace-sample" cx={95 + (index * 37) % 220} cy={55 + (index * 53) % 140} key={index} r="2.5" />
          ))}
          <rect className={bboxVisible ? "heat-cell active" : "heat-cell"} height="82" width="100" x="160" y="82" />
          {bboxVisible && <rect className="selection-box" height="82" width="100" x="160" y="82" />}
          <text x="154" y="190">binary mask → contour → bbox</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
