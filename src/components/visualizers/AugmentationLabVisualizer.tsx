import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function AugmentationLabVisualizer() {
  const [flip, setFlip] = useState(1);
  const [crop, setCrop] = useState(0.12);
  const [brightness, setBrightness] = useState(1.05);
  const [noise, setNoise] = useState(0.08);
  const object = { x: 138, y: 72, w: 96, h: 74 };
  const cropPx = crop * 80;
  const augX = flip ? 292 - object.x - object.w : object.x;
  const augBox = {
    x: 72 + (augX - 70) * (1 + crop * 0.75) - cropPx * 0.2,
    y: object.y * (1 + crop * 0.55) - cropPx * 0.3,
    w: object.w * (1 + crop * 0.45),
    h: object.h * (1 + crop * 0.45),
  };
  const brightnessFill = `rgba(4,125,122,${Math.min(0.9, 0.28 + brightness * 0.42)})`;
  const noiseDots = Math.round(noise * 80);

  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["flip", flip ? "horizontal" : "off"],
        ["crop", `${Math.round(crop * 100)}%`],
        ["brightness", brightness.toFixed(2)],
        ["bbox shift", `${Math.abs(augBox.x - object.x).toFixed(0)} px`],
      ]}
      title="Image Augmentation: Flip / Crop / Brightness"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="flip toggle" max={1} min={0} onChange={setFlip} step={1} value={flip} />
          <Slider label="crop strength" max={0.35} min={0} onChange={setCrop} step={0.01} value={crop} />
          <Slider label="brightness" max={1.8} min={0.35} onChange={setBrightness} step={0.01} value={brightness} />
          <Slider label="sensor noise" max={0.3} min={0} onChange={setNoise} step={0.01} value={noise} />
          <div className="hint-box">augmentation은 label bbox와 mask도 함께 변환되어야 합니다. 이미지만 flip/crop하면 label 품질이 즉시 깨집니다.</div>
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 300">
          <rect className="image-frame" height="198" width="170" x="38" y="52" />
          <rect className="image-frame" height="198" width="170" x="222" y="52" />
          <rect className="heat-cell active" height={object.h} width={object.w} x={object.x - 70} y={object.y} />
          <rect className="selection-box" height={object.h} width={object.w} x={object.x - 70} y={object.y} />
          <rect className="heat-cell active" height={augBox.h} style={{ fill: brightnessFill }} width={augBox.w} x={augBox.x} y={augBox.y} />
          <rect className="selection-box" height={augBox.h} width={augBox.w} x={augBox.x} y={augBox.y} />
          {Array.from({ length: noiseDots }).map((_, index) => (
            <circle className="workspace-sample" cx={230 + ((index * 31) % 150)} cy={62 + ((index * 47) % 174)} key={index} r="2" />
          ))}
          <text x="60" y="36">before</text>
          <text x="248" y="36">after augmentation</text>
          <text x="42" y="276">label bbox must follow the image transform</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
