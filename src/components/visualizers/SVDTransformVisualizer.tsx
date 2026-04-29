import { useState } from "react";
import { Sigma, SkipForward, RotateCcw } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame } from "./VisualizerUtils";
import type { Point } from "./VisualizerUtils";

const STEP_LABELS = [
  "단계 0: 입력 단위원 (A 적용 전)",
  "단계 1: Vᵀ 회전 적용",
  "단계 2: Σ 스케일링 적용",
  "단계 3: U 회전 적용 → A 완성",
];

export function SVDTransformVisualizer() {
  const [sigma1, setSigma1] = useState(2.4);
  const [sigma2, setSigma2] = useState(0.55);
  const [inputAngle, setInputAngle] = useState(30);
  const [outputAngle, setOutputAngle] = useState(-20);
  const [step, setStep] = useState(3);

  const width = 430;
  const height = 300;
  const scale = 56;

  const vin = (inputAngle * Math.PI) / 180;
  const uout = (outputAngle * Math.PI) / 180;

  const rot = (p: Point, angle: number): Point => ({
    x: Math.cos(angle) * p.x - Math.sin(angle) * p.y,
    y: Math.sin(angle) * p.x + Math.cos(angle) * p.y,
  });

  const applyStep = (p: Point, s: number): Point => {
    if (s === 0) return p;
    const afterVt = rot(p, -vin);
    if (s === 1) return afterVt;
    const afterSigma = { x: sigma1 * afterVt.x, y: sigma2 * afterVt.y };
    if (s === 2) return afterSigma;
    return rot(afterSigma, uout);
  };

  const makeCurve = (s: number) =>
    Array.from({ length: 101 }, (_, i) => {
      const t = (i / 100) * Math.PI * 2;
      return worldToSvg(applyStep({ x: Math.cos(t), y: Math.sin(t) }, s), width, height, scale);
    });

  const origin = worldToSvg({ x: 0, y: 0 }, width, height, scale);
  const condition = sigma1 / Math.max(0.001, sigma2);

  // axis vectors for current step
  const axisE1 = worldToSvg(applyStep({ x: 1, y: 0 }, step), width, height, scale);
  const axisE2 = worldToSvg(applyStep({ x: 0, y: 1 }, step), width, height, scale);

  const prevStep = () => setStep((s) => Math.max(0, s - 1));
  const nextStep = () => setStep((s) => Math.min(3, s + 1));

  return (
    <VisualFrame
      icon={<Sigma size={18} aria-hidden />}
      metrics={[
        ["step", `${step}/3`],
        ["condition σ1/σ2", condition.toFixed(1)],
        ["sigma1", sigma1.toFixed(2)],
        ["sigma2", sigma2.toFixed(2)],
      ]}
      title="SVD: A = U Σ Vᵀ 단계별 분해"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="sigma1" max={4} min={0.1} onChange={setSigma1} step={0.05} value={sigma1} />
          <Slider label="sigma2" max={4} min={0.02} onChange={setSigma2} step={0.05} value={sigma2} />
          <Slider label="V 회전각" max={180} min={-180} onChange={setInputAngle} step={1} suffix="°" value={inputAngle} />
          <Slider label="U 회전각" max={180} min={-180} onChange={setOutputAngle} step={1} suffix="°" value={outputAngle} />
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
            <button
              aria-label="이전 단계"
              onClick={prevStep}
              disabled={step === 0}
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid #ccc",
                cursor: step === 0 ? "not-allowed" : "pointer",
                opacity: step === 0 ? 0.4 : 1,
              }}
            >
              <RotateCcw size={14} />
            </button>
            <span style={{ fontSize: 11, flex: 1, textAlign: "center" }}>{STEP_LABELS[step]}</span>
            <button
              aria-label="다음 단계"
              onClick={nextStep}
              disabled={step === 3}
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid #ccc",
                cursor: step === 3 ? "not-allowed" : "pointer",
                opacity: step === 3 ? 0.4 : 1,
              }}
            >
              <SkipForward size={14} />
            </button>
          </div>
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="24" x2={width - 24} y1={origin.y} y2={origin.y} />
          <line className="axis" x1={origin.x} x2={origin.x} y1="24" y2={height - 24} />
          {/* ghost of unit circle always shown */}
          <polyline
            fill="none"
            points={polyline(makeCurve(0))}
            stroke="#aaa"
            strokeDasharray="4,3"
            strokeWidth="1"
          />
          {/* current step curve */}
          <polyline
            className="estimate-line"
            fill={step === 3 ? "rgba(4,125,122,0.08)" : "rgba(37,99,235,0.08)"}
            points={polyline(makeCurve(step))}
            stroke={step === 3 ? "#047d7a" : "#2563eb"}
            strokeWidth="2"
          />
          {/* basis axis vectors */}
          <line className="vector result" x1={origin.x} x2={axisE1.x} y1={origin.y} y2={axisE1.y} />
          <line className="vector original" x1={origin.x} x2={axisE2.x} y1={origin.y} y2={axisE2.y} />
          <text x={axisE1.x + 6} y={axisE1.y - 6} style={{ fontSize: 11 }}>e1</text>
          <text x={axisE2.x + 6} y={axisE2.y - 6} style={{ fontSize: 11 }}>e2</text>
          <text x="24" y={height - 10} style={{ fontSize: 10, fill: "#888" }}>
            {step === 0 ? "단위원" : step === 1 ? "Vᵀ 회전" : step === 2 ? "Σ 스케일" : "U 회전 → 완성"}
          </text>
        </svg>
      </div>
    </VisualFrame>
  );
}
