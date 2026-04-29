import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function LocalizationFilterStackVisualizer() {
  const [measurementNoise, setMeasurementNoise] = useState(0.25);
  const [innovation, setInnovation] = useState(1.8);
  const [gate, setGate] = useState(5.99);
  const [roughening, setRoughening] = useState(0.07);
  const [resampleStep, setResampleStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setResampleStep((current) => {
        if (current >= 3) {
          window.clearInterval(timer);
          return 3;
        }
        return current + 1;
      });
    }, 650);
    return () => window.clearInterval(timer);
  }, [isPlaying]);
  useEffect(() => {
    if (resampleStep >= 3) setIsPlaying(false);
  }, [resampleStep]);

  const priorX = 1.2;
  const priorP = 0.48;
  const q = 0.12;
  const predictedP = priorP + q;
  const k = predictedP / (predictedP + measurementNoise);
  const updateX = priorX + k * innovation;
  const updateP = (1 - k) * predictedP;
  const d2 = (innovation * innovation) / (predictedP + measurementNoise);
  const accepted = d2 <= gate;
  const particles = Array.from({ length: 34 }, (_, index) => {
    const x = -1.5 + (3 * index) / 33;
    const weight = Math.exp(-0.5 * ((x - 0.55) / Math.max(0.16, measurementNoise)) ** 2);
    const resampledX = 0.55 + Math.sin(index * 2.37) * (0.08 + roughening * resampleStep);
    return { x, weight, resampledX };
  });
  const weightSum = particles.reduce((sum, particle) => sum + particle.weight, 0);
  const normalized = particles.map((particle) => ({ ...particle, weight: particle.weight / weightSum }));
  const neff = 1 / normalized.reduce((sum, particle) => sum + particle.weight * particle.weight, 0);
  const width = 430;
  const height = 270;
  const ellipseRx = Math.sqrt(gate * (predictedP + measurementNoise)) * 54;
  const obsX = 215 + innovation * 54;

  return (
    <VisualFrame
      icon={<Activity size={18} aria-hidden />}
      metrics={[
        ["Kalman K", k.toFixed(2)],
        ["update P", updateP.toFixed(2)],
        ["Mahalanobis d2", d2.toFixed(2)],
        ["N_eff", neff.toFixed(1)],
      ]}
      title="Kalman / EKF Gate / Particle Resampling"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="measurement R" max={1.2} min={0.05} onChange={setMeasurementNoise} step={0.01} value={measurementNoise} />
          <Slider label="innovation nu" max={4} min={-4} onChange={setInnovation} step={0.05} value={innovation} />
          <Slider label="chi2 gate" max={12} min={1} onChange={setGate} step={0.1} value={gate} />
          <Slider label="roughening" max={0.3} min={0} onChange={setRoughening} step={0.01} value={roughening} />
          <div className="visual-actions">
            <button className="text-button" onClick={() => setIsPlaying((playing) => !playing)} type="button">
              {isPlaying ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
              {isPlaying ? "일시정지" : "resampling 재생"}
            </button>
            <button className="icon-button" onClick={() => { setIsPlaying(false); setResampleStep(0); }} type="button">
              <RotateCcw size={16} aria-hidden />
            </button>
          </div>
          {!accepted && <div className="singularity-banner">chi-squared gate 밖 관측입니다. EKF update를 reject합니다.</div>}
        </div>
        <div className="visual-stack">
          <div className="flow-visual">
            {[
              ["Predict", `x=${priorX.toFixed(2)}, P=${predictedP.toFixed(2)}`],
              ["Innovation", `nu=${innovation.toFixed(2)}, S=${(predictedP + measurementNoise).toFixed(2)}`],
              ["Gate", accepted ? "accept" : "reject"],
              ["Update", accepted ? `x=${updateX.toFixed(2)}, P=${updateP.toFixed(2)}` : "skip measurement"],
            ].map(([label, value], index, array) => (
              <div className="flow-step-wrap" key={label}>
                <div className={label === "Gate" && !accepted ? "flow-step is-alert" : "flow-step"}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
                {index < array.length - 1 && <div className="flow-arrow">→</div>}
              </div>
            ))}
          </div>
          <svg className="plot compact-plot" role="img" viewBox={`0 0 ${width} ${height}`}>
            <line className="axis" x1="28" x2={width - 28} y1="138" y2="138" />
            <ellipse className="manip-ellipse" cx="215" cy="138" rx={Math.max(16, ellipseRx)} ry="42" />
            <circle className={accepted ? "point result" : "point target"} cx={Math.max(28, Math.min(width - 28, obsX))} cy="138" r="8" />
            <text x="30" y="30">EKF chi-squared innovation boundary</text>
            <text x="30" y="50">{accepted ? "inside gate: update" : "outside gate: reject"}</text>
          </svg>
          <svg className="plot compact-plot" role="img" viewBox={`0 0 ${width} ${height}`}>
            <line className="axis" x1="24" x2={width - 24} y1="220" y2="220" />
            {normalized.map((particle, index) => {
              const x = resampleStep === 0 ? particle.x : particle.resampledX;
              const y = resampleStep < 2 ? 220 - particle.weight * 1650 : 142 + Math.sin(index * 1.7) * roughening * 280;
              return (
                <circle
                  className={resampleStep === 0 ? "point original small" : "point result small"}
                  cx={215 + x * 94}
                  cy={y}
                  key={index}
                  r={resampleStep === 0 ? 2 + particle.weight * 55 : 4}
                />
              );
            })}
            <text x="30" y="30">Particle resampling step {resampleStep + 1}: weight -&gt; cumulative -&gt; draw -&gt; roughen</text>
          </svg>
        </div>
      </div>
    </VisualFrame>
  );
}
