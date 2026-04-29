import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function DatasetQualityVisualizer() {
  const [labelNoise, setLabelNoise] = useState(0.08);
  const [leakage, setLeakage] = useState(0.04);
  const [minorityRatio, setMinorityRatio] = useState(0.18);
  const total = 1200;
  const train = Math.round(total * 0.7);
  const val = Math.round(total * 0.15);
  const test = total - train - val;
  const audited = Math.round(total * 0.08);
  const wrongLabels = Math.round(audited * labelNoise);
  const leakageScenes = Math.round(40 * leakage);
  const safetyRecall = Math.max(0.35, 0.96 - labelNoise * 1.7 - Math.max(0, 0.22 - minorityRatio) * 1.1);
  const validationTrust = Math.max(0, 1 - leakage * 4);
  const splitRows = [
    ["train", train, "#047d7a"],
    ["validation", val, "#b7791f"],
    ["test", test, "#167a4a"],
  ] as const;

  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["split", `${train}/${val}/${test}`],
        ["wrong labels", `${wrongLabels}/${audited} audit`],
        ["scene leakage", String(leakageScenes)],
        ["safety recall", safetyRecall.toFixed(2)],
      ]}
      title="Dataset Split / Label Quality / Class Balance"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="label noise" max={0.35} min={0} onChange={setLabelNoise} step={0.01} value={labelNoise} />
          <Slider label="scene leakage" max={0.25} min={0} onChange={setLeakage} step={0.01} value={leakage} />
          <Slider label="minority class ratio" max={0.5} min={0.02} onChange={setMinorityRatio} step={0.01} value={minorityRatio} />
          <div className="hint-box">로봇 비전 데이터는 이미지 단위가 아니라 rosbag/scene 단위로 split해야 validation 점수가 실제 현장 성능을 속이지 않습니다.</div>
          {leakageScenes > 0 && <div className="singularity-banner">train/test scene leakage가 있습니다. validation accuracy가 과대평가될 수 있습니다.</div>}
        </div>
        <div className="visual-stack">
          <svg className="plot compact-plot" role="img" viewBox="0 0 430 220">
            <line className="axis" x1="34" x2="400" y1="174" y2="174" />
            {splitRows.map(([label, value, color], index) => {
              const width = (value / total) * 320;
              const x = 48 + splitRows.slice(0, index).reduce((sum, [, prev]) => sum + (prev / total) * 320, 0);
              return (
                <g key={label}>
                  <rect height="56" rx="6" style={{ fill: color }} width={width} x={x} y="96" />
                  <text x={x + 8} y="88">{label}</text>
                  <text x={x + 8} y="134">{value}</text>
                </g>
              );
            })}
            <line className="deadline-line" x1={48 + 320 * (1 - leakage)} x2={48 + 320 * (1 - leakage)} y1="42" y2="180" />
            <text x="34" y="30">group split by scene/rosbag, not by shuffled image</text>
          </svg>
          <div className="matrix-step-grid">
            <div className={validationTrust < 0.75 ? "matrix-card is-fail" : "matrix-card is-pass"}>
              <span>validation trust</span>
              <code>{validationTrust.toFixed(2)} from leakage audit</code>
            </div>
            <div className={safetyRecall < 0.82 ? "matrix-card is-fail" : "matrix-card is-pass"}>
              <span>safety class recall</span>
              <code>{safetyRecall.toFixed(2)} after label/noise balance</code>
            </div>
            <div className="matrix-card">
              <span>loader check</span>
              <code>image, label, scene_id, split, checksum</code>
            </div>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
