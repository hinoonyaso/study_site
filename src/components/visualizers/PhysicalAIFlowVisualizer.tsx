import { useMemo, useState } from "react";
import { Bot } from "lucide-react";

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="slider-row">
      <span>{label}<strong>{value.toFixed(2)}</strong></span>
      <input min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} type="range" />
    </label>
  );
}

export function PhysicalAIFlowVisualizer() {
  const [demoCount, setDemoCount] = useState(30);
  const [stateShift, setStateShift] = useState(1);
  const metrics = useMemo(() => {
    const imitationLoss = Math.max(0.02, 1 / Math.sqrt(demoCount));
    const rolloutRisk = Math.min(1, imitationLoss + stateShift * 0.16);
    return { imitationLoss, rolloutRisk, success: Math.max(0, 1 - rolloutRisk) };
  }, [demoCount, stateShift]);

  return (
    <section className="panel visual-panel">
      <div className="panel-heading">
        <Bot size={18} aria-hidden />
        <h2>Physical AI Perception-Action Loop</h2>
      </div>
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="demo count N" min={5} max={200} step={5} value={demoCount} onChange={setDemoCount} />
          <Slider label="state shift" min={0} max={5} step={0.1} value={stateShift} onChange={setStateShift} />
        </div>
        <div className="flow-visual">
          {[
            ["sensor", "image / proprioception"],
            ["policy", `loss ${metrics.imitationLoss.toFixed(2)}`],
            ["action", "velocity / torque"],
            ["world", `success ${(metrics.success * 100).toFixed(0)}%`],
          ].map(([label, value], index, all) => (
            <div className="flow-step-wrap" key={label}>
              <div className="flow-step">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
              {index < all.length - 1 && <div className="flow-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="metrics-grid">
        <div className="metric-card"><span>covariate shift risk</span><strong>{metrics.rolloutRisk.toFixed(2)}</strong></div>
        <div className="metric-card"><span>normal case</span><strong>demo 분포 안 rollout</strong></div>
        <div className="metric-card"><span>failure case</span><strong>분포 밖 누적 오차</strong></div>
      </div>
    </section>
  );
}
