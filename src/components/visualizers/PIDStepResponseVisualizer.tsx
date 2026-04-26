import { useMemo, useState } from "react";
import { Gauge, LineChart } from "lucide-react";

type Sample = {
  t: number;
  y: number;
  u: number;
  saturated: boolean;
};

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  suffix = "",
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <label className="slider-row">
      <span>
        {label}
        <strong>{value.toFixed(step < 1 ? 2 : 0)}{suffix}</strong>
      </span>
      <input max={max} min={min} onChange={(event) => onChange(Number(event.target.value))} step={step} type="range" value={value} />
    </label>
  );
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const simulate = (kp: number, ki: number, kd: number, target: number, limit: number, antiWindup: boolean): Sample[] => {
  const dt = 0.02;
  const tau = 0.45;
  let y = 0;
  let integral = 0;
  let previousError = target;
  const samples: Sample[] = [];
  for (let i = 0; i <= 260; i += 1) {
    const t = i * dt;
    const error = target - y;
    integral += error * dt;
    const derivative = (error - previousError) / dt;
    const rawU = kp * error + ki * integral + kd * derivative;
    const u = clamp(rawU, -limit, limit);
    const saturated = Math.abs(rawU - u) > 1e-6;
    if (antiWindup && saturated && Math.sign(error) === Math.sign(rawU)) {
      integral -= error * dt;
    }
    y += ((u - y) / tau) * dt;
    previousError = error;
    samples.push({ t, y, u, saturated });
  }
  return samples;
};

const points = (samples: Sample[], field: "y" | "u", target: number, limit: number) => {
  const min = field === "u" ? -limit : Math.min(0, ...samples.map((sample) => sample.y), target);
  const max = field === "u" ? limit : Math.max(target * 1.25, ...samples.map((sample) => sample.y));
  const range = Math.max(1e-6, max - min);
  return samples
    .map((sample) => {
      const value = sample[field];
      const x = 28 + (sample.t / samples[samples.length - 1].t) * 372;
      const y = 246 - ((value - min) / range) * 210;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};

export function PIDStepResponseVisualizer() {
  const [kp, setKp] = useState(2.2);
  const [ki, setKi] = useState(0.7);
  const [kd, setKd] = useState(0.18);
  const [target, setTarget] = useState(1.0);
  const [limit, setLimit] = useState(1.2);
  const [antiWindup, setAntiWindup] = useState(true);

  const result = useMemo(() => {
    const samples = simulate(kp, ki, kd, target, limit, antiWindup);
    const maxY = Math.max(...samples.map((sample) => sample.y));
    const overshoot = Math.max(0, ((maxY - target) / Math.max(0.001, target)) * 100);
    const finalError = target - samples[samples.length - 1].y;
    const tolerance = Math.max(0.02, Math.abs(target) * 0.02);
    const settlingSample = samples.find((sample, index) =>
      index > 5 && samples.slice(index).every((candidate) => Math.abs(candidate.y - target) <= tolerance),
    );
    const riseSample = samples.find((sample) => sample.y >= target * 0.9);
    const saturationCount = samples.filter((sample) => sample.saturated).length;
    return { samples, overshoot, finalError, settlingTime: settlingSample?.t, riseTime: riseSample?.t, saturationCount };
  }, [antiWindup, kd, ki, kp, limit, target]);

  const targetY = 246 - (target / Math.max(target * 1.25, ...result.samples.map((sample) => sample.y))) * 210;
  const saturationWarning = result.saturationCount > 8;
  const windupWarning = saturationWarning && !antiWindup && ki > 0.2;

  return (
    <section className="panel visual-panel">
      <div className="panel-heading">
        <Gauge size={18} aria-hidden />
        <h2>PID Step Response</h2>
      </div>
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="Kp" max={6} min={0} onChange={setKp} step={0.05} value={kp} />
          <Slider label="Ki" max={3} min={0} onChange={setKi} step={0.05} value={ki} />
          <Slider label="Kd" max={1.5} min={0} onChange={setKd} step={0.02} value={kd} />
          <Slider label="target" max={2} min={0.2} onChange={setTarget} step={0.05} value={target} />
          <Slider label="u limit" max={3} min={0.2} onChange={setLimit} step={0.05} value={limit} />
          <label className="done-toggle">
            <input checked={antiWindup} onChange={(event) => setAntiWindup(event.target.checked)} type="checkbox" />
            <span>anti-windup 사용</span>
          </label>
          {saturationWarning && <div className="singularity-banner">saturation 경고: 제어 입력이 제한에 자주 걸린다.</div>}
          {windupWarning && <div className="singularity-banner">integral windup 반례: I항이 제한 중에도 계속 쌓인다.</div>}
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <line className="axis" x1="25" x2="405" y1="246" y2="246" />
          <line className="axis" x1="28" x2="28" y1="26" y2="250" />
          <line className="deadline-line" x1="28" x2="400" y1={targetY} y2={targetY} />
          <polyline className="truth-line" points={points(result.samples, "y", target, limit)} />
          <polyline className="estimate-line" points={points(result.samples, "u", target, limit)} />
          <text x="32" y={Math.max(18, targetY - 8)}>target</text>
          <text x="300" y="35">y(t) and u(t)</text>
        </svg>
      </div>
      <div className="metrics-grid">
        <div className="metric-card"><span>overshoot</span><strong>{result.overshoot.toFixed(1)}%</strong></div>
        <div className="metric-card"><span>rise time</span><strong>{result.riseTime?.toFixed(2) ?? "not reached"} s</strong></div>
        <div className="metric-card"><span>settling time</span><strong>{result.settlingTime?.toFixed(2) ?? "not settled"} s</strong></div>
        <div className="metric-card"><span>steady-state error</span><strong>{result.finalError.toFixed(3)}</strong></div>
      </div>
      <div className="hint-box">
        P는 현재 오차를 미는 힘, I는 오래 남은 오차를 지우는 힘, D는 너무 빨리 변하지 않게 잡는 브레이크다.
        실제 모터에서는 saturation과 anti-windup을 같이 보지 않으면 목표값 그래프만 좋아 보여도 장비가 떨리거나 늦게 멈출 수 있다.
      </div>
      <div className="hint-box">
        <LineChart size={15} aria-hidden /> 파란 선은 현재값 y(t), 보조 선은 제어입력 u(t)이다.
      </div>
    </section>
  );
}
