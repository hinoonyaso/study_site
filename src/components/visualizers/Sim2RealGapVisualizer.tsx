import { useMemo, useState } from "react";
import { Workflow } from "lucide-react";

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="slider-row">
      <span>{label}<strong>{value.toFixed(2)}</strong></span>
      <input min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} type="range" />
    </label>
  );
}

export function Sim2RealGapVisualizer() {
  const [frictionLow, setFrictionLow] = useState(0.2);
  const [delay, setDelay] = useState(40);
  const [cameraNoise, setCameraNoise] = useState(10);
  const score = useMemo(() => {
    const frictionCoverage = frictionLow <= 0.35 ? 0.25 : -0.1;
    const delayPenalty = delay / 250;
    const cameraPenalty = cameraNoise / 120;
    return Math.max(0, Math.min(1, 0.9 + frictionCoverage - delayPenalty - cameraPenalty));
  }, [cameraNoise, delay, frictionLow]);

  return (
    <section className="panel visual-panel">
      <div className="panel-heading">
        <Workflow size={18} aria-hidden />
        <h2>Sim2Real Gap Visualizer</h2>
      </div>
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="friction low" min={0.1} max={0.8} step={0.01} value={frictionLow} onChange={setFrictionLow} />
          <Slider label="actuator delay ms" min={0} max={200} step={5} value={delay} onChange={setDelay} />
          <Slider label="camera noise" min={0} max={50} step={1} value={cameraNoise} onChange={setCameraNoise} />
        </div>
        <div className="flow-visual">
          {[
            ["sim train", `mu low ${frictionLow.toFixed(2)}`],
            ["domain gap", `${delay.toFixed(0)}ms delay`],
            ["real rollout", `${(score * 100).toFixed(0)}% success`],
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
        <div className="metric-card"><span>success estimate</span><strong>{(score * 100).toFixed(1)}%</strong></div>
        <div className="metric-card"><span>normal case</span><strong>wide randomization</strong></div>
        <div className="metric-card"><span>failure case</span><strong>delay/noise mismatch</strong></div>
      </div>
    </section>
  );
}
