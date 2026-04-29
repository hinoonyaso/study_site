import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform, iou, nms, drawBox } from "./VisualizerUtils";
import type { Point, Point3, Matrix, DetectionBox } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function NMSIoUVisualizer() {
  const [iouThreshold, setIouThreshold] = useState(0.45);
  const [scoreThreshold, setScoreThreshold] = useState(0.35);
  const [jitter, setJitter] = useState(0.08);
  const boxes: DetectionBox[] = [
    { id: "A", x: 98, y: 74, w: 128, h: 92, score: 0.92 },
    { id: "B", x: 112 + jitter * 80, y: 84, w: 122, h: 88, score: 0.76 },
    { id: "C", x: 258, y: 88 + jitter * 60, w: 86, h: 78, score: 0.68 },
    { id: "D", x: 266, y: 102, w: 82, h: 72, score: 0.41 },
    { id: "E", x: 64, y: 184, w: 80, h: 54, score: 0.31 + jitter * 0.25 },
  ];
  const candidates = boxes.filter((box) => box.score >= scoreThreshold).sort((a, b) => b.score - a.score);
  const kept: DetectionBox[] = [];
  const suppressed = new Set<string>();
  candidates.forEach((box) => {
    const overlaps = kept.some((winner) => iou(box, winner) >= iouThreshold);
    if (overlaps) suppressed.add(box.id);
    else kept.push(box);
  });
  const meanIoU = candidates.length > 1 ? iou(candidates[0], candidates[1]) : 0;

  return (
    <VisualFrame
      icon={<Crosshair size={18} aria-hidden />}
      metrics={[
        ["candidates", String(candidates.length)],
        ["kept", String(kept.length)],
        ["suppressed", String(suppressed.size)],
        ["top IoU", meanIoU.toFixed(2)],
      ]}
      title="IoU Threshold / NMS Result"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="IoU NMS threshold" max={0.9} min={0.05} onChange={setIouThreshold} step={0.01} value={iouThreshold} />
          <Slider label="score threshold" max={0.95} min={0.05} onChange={setScoreThreshold} step={0.01} value={scoreThreshold} />
          <Slider label="frame jitter" max={0.25} min={0} onChange={setJitter} step={0.01} value={jitter} />
          <div className="hint-box">tracking에서 IoU threshold가 너무 낮으면 같은 물체 box가 과하게 삭제되고, 너무 높으면 중복 detection이 남습니다.</div>
        </div>
        <div className="visual-stack">
          <svg className="plot compact-plot" role="img" viewBox="0 0 430 280">
            <rect className="image-frame" height="220" width="350" x="40" y="32" />
            {boxes.map((box) => {
              const isCandidate = box.score >= scoreThreshold;
              const isKept = kept.some((item) => item.id === box.id);
              const isSuppressed = suppressed.has(box.id);
              return (
                <g key={box.id} opacity={isCandidate ? 1 : 0.24}>
                  <rect className={isKept ? "nms-box is-kept" : isSuppressed ? "nms-box is-suppressed" : "nms-box"} height={box.h} width={box.w} x={box.x} y={box.y} />
                  <text x={box.x + 6} y={box.y + 18}>{box.id} {box.score.toFixed(2)}</text>
                </g>
              );
            })}
            <text x="48" y="24">green: kept, red dashed: suppressed, gray: below score</text>
          </svg>
          <div className="matrix-step-grid">
            {candidates.map((box) => (
              <div className={kept.some((item) => item.id === box.id) ? "matrix-card is-pass" : "matrix-card is-fail"} key={box.id}>
                <span>box {box.id}</span>
                <code>score={box.score.toFixed(2)} status={kept.some((item) => item.id === box.id) ? "kept" : "suppressed"}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
