import { useMemo, useState } from "react";
import { Gauge } from "lucide-react";

function Slider({ label, value, min, max, step, onChange, suffix = "" }: { label: string; value: number; min: number; max: number; step: number; suffix?: string; onChange: (value: number) => void }) {
  return (
    <label className="slider-row">
      <span>{label}<strong>{value.toFixed(step < 1 ? 2 : 0)}{suffix}</strong></span>
      <input min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} type="range" />
    </label>
  );
}

export function DynamicsTorqueVisualizer() {
  const [q1, setQ1] = useState(30);
  const [q2, setQ2] = useState(45);
  const [payload, setPayload] = useState(0);
  const torque = useMemo(() => {
    const l1 = 1.0;
    const l2 = 0.7;
    const m1 = 1.2;
    const m2 = 0.8 + payload;
    const g = 9.81;
    const a1 = (q1 * Math.PI) / 180;
    const a12 = ((q1 + q2) * Math.PI) / 180;
    return {
      tau1: g * ((m1 * l1 / 2 + m2 * l1) * Math.cos(a1) + m2 * l2 / 2 * Math.cos(a12)),
      tau2: g * (m2 * l2 / 2 * Math.cos(a12)),
    };
  }, [payload, q1, q2]);
  const limit = 18;
  const maxAbs = Math.max(limit, Math.abs(torque.tau1), Math.abs(torque.tau2));

  return (
    <section className="panel visual-panel">
      <div className="panel-heading">
        <Gauge size={18} aria-hidden />
        <h2>2-link Dynamics Torque Graph</h2>
      </div>
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="q1" min={-180} max={180} step={1} suffix="°" value={q1} onChange={setQ1} />
          <Slider label="q2" min={-180} max={180} step={1} suffix="°" value={q2} onChange={setQ2} />
          <Slider label="payload" min={0} max={3} step={0.1} suffix=" kg" value={payload} onChange={setPayload} />
        </div>
        <svg className="plot" viewBox="0 0 430 260" role="img">
          <line className="deadline-line" x1="40" x2="390" y1={130 - (limit / maxAbs) * 100} y2={130 - (limit / maxAbs) * 100} />
          <line className="deadline-line" x1="40" x2="390" y1={130 + (limit / maxAbs) * 100} y2={130 + (limit / maxAbs) * 100} />
          {[["tau1", torque.tau1, 120], ["tau2", torque.tau2, 260]].map(([label, value, x]) => {
            const numeric = Number(value);
            const y = numeric >= 0 ? 130 - (numeric / maxAbs) * 100 : 130;
            const h = Math.abs(numeric / maxAbs) * 100;
            return (
              <g key={String(label)}>
                <rect className={Math.abs(numeric) > limit ? "bar is-miss" : "bar"} x={Number(x)} y={y} width="70" height={h} />
                <text x={Number(x)} y="230">{String(label)} {numeric.toFixed(2)}Nm</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="metrics-grid">
        <div className="metric-card"><span>tau1</span><strong>{torque.tau1.toFixed(2)} Nm</strong></div>
        <div className="metric-card"><span>tau2</span><strong>{torque.tau2.toFixed(2)} Nm</strong></div>
        <div className="metric-card"><span>failure</span><strong>{Math.max(Math.abs(torque.tau1), Math.abs(torque.tau2)) > limit ? "torque saturation" : "within limit"}</strong></div>
      </div>
    </section>
  );
}
