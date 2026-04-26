import { useMemo, useState } from "react";
import { Activity } from "lucide-react";

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="slider-row">
      <span>{label}<strong>{value.toFixed(2)}</strong></span>
      <input min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} type="range" />
    </label>
  );
}

export function EKFCovarianceVisualizer() {
  const [prior, setPrior] = useState(0.5);
  const [measurementNoise, setMeasurementNoise] = useState(0.04);
  const update = useMemo(() => {
    const h = 1;
    const s = h * prior * h + measurementNoise;
    const k = prior * h / s;
    const posterior = (1 - k * h) * prior;
    return { k, posterior };
  }, [measurementNoise, prior]);

  return (
    <section className="panel visual-panel">
      <div className="panel-heading">
        <Activity size={18} aria-hidden />
        <h2>EKF Covariance Update</h2>
      </div>
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="prior covariance P" min={0.05} max={2} step={0.01} value={prior} onChange={setPrior} />
          <Slider label="measurement noise R" min={0.01} max={1} step={0.01} value={measurementNoise} onChange={setMeasurementNoise} />
        </div>
        <svg className="plot" viewBox="0 0 430 260" role="img">
          <ellipse className="workspace-ring" cx="150" cy="130" rx={40 + prior * 55} ry={30 + prior * 25} />
          <ellipse className="estimate-line" cx="285" cy="130" rx={40 + update.posterior * 55} ry={30 + update.posterior * 25} />
          <text x="95" y="230">prior ellipse</text>
          <text x="235" y="230">posterior ellipse</text>
        </svg>
      </div>
      <div className="metrics-grid">
        <div className="metric-card"><span>Kalman gain</span><strong>{update.k.toFixed(3)}</strong></div>
        <div className="metric-card"><span>posterior P</span><strong>{update.posterior.toFixed(3)}</strong></div>
        <div className="metric-card"><span>failure</span><strong>{measurementNoise > prior ? "measurement ignored" : "measurement useful"}</strong></div>
      </div>
    </section>
  );
}
