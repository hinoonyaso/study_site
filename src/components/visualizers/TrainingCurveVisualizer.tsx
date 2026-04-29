import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function TrainingCurveVisualizer() {
  const [epochs, setEpochs] = useState(36);
  const [capacity, setCapacity] = useState(0.72);
  const [augmentation, setAugmentation] = useState(0.35);
  const [labelNoise, setLabelNoise] = useState(0.06);
  const [datasetSize, setDatasetSize] = useState(420);
  const curves = useMemo(() => {
    const overfit = Math.max(0, capacity - 0.45) * Math.max(0.25, 1 - augmentation) * (520 / Math.max(160, datasetSize));
    return Array.from({ length: epochs }, (_, index) => {
      const t = index / Math.max(1, epochs - 1);
      const trainLoss = Math.max(0.035, 1.15 * Math.exp(-4.2 * t * (0.55 + capacity)) + labelNoise * 0.32);
      const valLoss = Math.max(0.05, 1.05 * Math.exp(-3.0 * t) + labelNoise * 0.62 + overfit * t * t);
      const trainAcc = Math.min(0.995, 0.42 + (1 - trainLoss) * 0.62);
      const valAcc = Math.min(0.98, Math.max(0.25, 0.45 + (1 - valLoss) * 0.56 - labelNoise * 0.18));
      return { epoch: index + 1, trainLoss, valLoss, trainAcc, valAcc };
    });
  }, [augmentation, capacity, datasetSize, epochs, labelNoise]);
  const last = curves[curves.length - 1];
  const gap = last.valLoss - last.trainLoss;
  const maxLoss = Math.max(...curves.flatMap((point) => [point.trainLoss, point.valLoss]));
  const mapLoss = (value: number, index: number) => ({
    x: 34 + (index / Math.max(1, curves.length - 1)) * 360,
    y: 232 - (value / maxLoss) * 182,
  });
  const mapAcc = (value: number, index: number) => ({
    x: 34 + (index / Math.max(1, curves.length - 1)) * 360,
    y: 232 - value * 182,
  });

  return (
    <VisualFrame
      icon={<LineChart size={18} aria-hidden />}
      metrics={[
        ["train loss", last.trainLoss.toFixed(3)],
        ["val loss", last.valLoss.toFixed(3)],
        ["overfit gap", gap.toFixed(3)],
        ["val acc", last.valAcc.toFixed(2)],
      ]}
      title="Train vs Validation Loss / Accuracy"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="epochs" max={80} min={8} onChange={setEpochs} step={1} value={epochs} />
          <Slider label="model capacity" max={1.2} min={0.15} onChange={setCapacity} step={0.01} value={capacity} />
          <Slider label="augmentation strength" max={1} min={0} onChange={setAugmentation} step={0.01} value={augmentation} />
          <Slider label="label noise" max={0.28} min={0} onChange={setLabelNoise} step={0.01} value={labelNoise} />
          <Slider label="dataset size" max={1200} min={120} onChange={setDatasetSize} step={20} value={datasetSize} />
          {gap > 0.22 && <div className="singularity-banner">validation loss가 train loss에서 벌어집니다. 과적합, leakage, augmentation 부족을 확인하세요.</div>}
        </div>
        <div className="visual-stack">
          <svg className="plot compact-plot" role="img" viewBox="0 0 430 260">
            <line className="axis" x1="30" x2="400" y1="232" y2="232" />
            <line className="axis" x1="34" x2="34" y1="38" y2="236" />
            <polyline className="estimate-line" points={polyline(curves.map((point, index) => mapLoss(point.trainLoss, index)))} />
            <polyline className="measurement-line" points={polyline(curves.map((point, index) => mapLoss(point.valLoss, index)))} />
            <text x="42" y="30">loss: train solid, validation dashed</text>
          </svg>
          <svg className="plot compact-plot" role="img" viewBox="0 0 430 260">
            <line className="axis" x1="30" x2="400" y1="232" y2="232" />
            <line className="axis" x1="34" x2="34" y1="38" y2="236" />
            <polyline className="truth-line" points={polyline(curves.map((point, index) => mapAcc(point.trainAcc, index)))} />
            <polyline className="estimate-line" points={polyline(curves.map((point, index) => mapAcc(point.valAcc, index)))} />
            <text x="42" y="30">accuracy: train dark, validation teal</text>
          </svg>
        </div>
      </div>
    </VisualFrame>
  );
}
