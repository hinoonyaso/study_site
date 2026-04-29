import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function GaussianBayesVisualizer() {
  const [priorSigma, setPriorSigma] = useState(2);
  const [measurementSigma, setMeasurementSigma] = useState(1);
  const [measurementZ, setMeasurementZ] = useState(3);
  const width = 430;
  const height = 280;
  const priorMu = 0;
  const priorVar = priorSigma ** 2;
  const measVar = measurementSigma ** 2;
  const postVar = 1 / (1 / priorVar + 1 / measVar);
  const postMu = postVar * (priorMu / priorVar + measurementZ / measVar);
  const kalmanGain = priorVar / (priorVar + measVar);
  const pdf = (x: number, mu: number, sigma: number) =>
    Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (Math.sqrt(2 * Math.PI) * sigma);
  const xs = Array.from({ length: 160 }, (_, index) => -6 + (12 * index) / 159);
  const maxPdf = Math.max(
    ...xs.flatMap((x) => [pdf(x, priorMu, priorSigma), pdf(x, measurementZ, measurementSigma), pdf(x, postMu, Math.sqrt(postVar))]),
  );
  const mapPoint = (x: number, y: number) => ({
    x: 28 + ((x + 6) / 12) * (width - 56),
    y: height - 34 - (y / maxPdf) * (height - 70),
  });
  const priorPoints = xs.map((x) => mapPoint(x, pdf(x, priorMu, priorSigma)));
  const measPoints = xs.map((x) => mapPoint(x, pdf(x, measurementZ, measurementSigma)));
  const postPoints = xs.map((x) => mapPoint(x, pdf(x, postMu, Math.sqrt(postVar))));

  return (
    <VisualFrame
      icon={<Gauge size={18} aria-hidden />}
      metrics={[
        ["posterior mu", postMu.toFixed(2)],
        ["posterior sigma", Math.sqrt(postVar).toFixed(2)],
        ["Kalman K", kalmanGain.toFixed(2)],
      ]}
      title="Gaussian Bayes Update"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="prior sigma" max={5} min={0.2} onChange={setPriorSigma} step={0.05} value={priorSigma} />
          <Slider label="measurement sigma" max={5} min={0.2} onChange={setMeasurementSigma} step={0.05} value={measurementSigma} />
          <Slider label="measurement z" max={5} min={-5} onChange={setMeasurementZ} step={0.05} value={measurementZ} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="24" x2={width - 24} y1={height - 34} y2={height - 34} />
          <polyline className="vector original" fill="none" points={polyline(priorPoints)} />
          <polyline className="vector accent" fill="none" points={polyline(measPoints)} />
          <polyline className="vector result" fill="none" points={polyline(postPoints)} />
          <text x="32" y="28">prior</text>
          <text x="32" y="48">measurement</text>
          <text x="32" y="68">posterior</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
