import { useMemo, useState } from "react";
import { Blend } from "lucide-react";

type Quat = [number, number, number, number];
type Vec3 = [number, number, number];

const degToRad = (degree: number) => (degree * Math.PI) / 180;
const norm = (q: Quat) => Math.hypot(q[0], q[1], q[2], q[3]);
const normalize = (q: Quat): Quat => {
  const n = Math.max(norm(q), 1e-9);
  return [q[0] / n, q[1] / n, q[2] / n, q[3] / n];
};
const dot = (a: Quat, b: Quat) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
const multiply = (a: Quat, b: Quat): Quat => [
  a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
  a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
  a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
  a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
];
const conjugate = (q: Quat): Quat => [q[0], -q[1], -q[2], -q[3]];
const rotateVector = (q: Quat, v: Vec3): Vec3 => {
  const r = multiply(multiply(q, [0, v[0], v[1], v[2]]), conjugate(q));
  return [r[1], r[2], r[3]];
};

const fromEuler = (rollDeg: number, pitchDeg: number, yawDeg: number): Quat => {
  const cr = Math.cos(degToRad(rollDeg) / 2);
  const sr = Math.sin(degToRad(rollDeg) / 2);
  const cp = Math.cos(degToRad(pitchDeg) / 2);
  const sp = Math.sin(degToRad(pitchDeg) / 2);
  const cy = Math.cos(degToRad(yawDeg) / 2);
  const sy = Math.sin(degToRad(yawDeg) / 2);
  return normalize([
    cr * cp * cy + sr * sp * sy,
    sr * cp * cy - cr * sp * sy,
    cr * sp * cy + sr * cp * sy,
    cr * cp * sy - sr * sp * cy,
  ]);
};

const slerp = (q0: Quat, q1Input: Quat, t: number, forceLongPath: boolean): Quat => {
  let q1 = q1Input;
  let d = dot(q0, q1);
  if (!forceLongPath && d < 0) {
    q1 = [-q1[0], -q1[1], -q1[2], -q1[3]];
    d = -d;
  }
  d = Math.max(-1, Math.min(1, d));
  if (d > 0.9995) {
    return normalize([
      (1 - t) * q0[0] + t * q1[0],
      (1 - t) * q0[1] + t * q1[1],
      (1 - t) * q0[2] + t * q1[2],
      (1 - t) * q0[3] + t * q1[3],
    ]);
  }
  const omega = Math.acos(d);
  const s0 = Math.sin((1 - t) * omega) / Math.sin(omega);
  const s1 = Math.sin(t * omega) / Math.sin(omega);
  return normalize([s0 * q0[0] + s1 * q1[0], s0 * q0[1] + s1 * q1[1], s0 * q0[2] + s1 * q1[2], s0 * q0[3] + s1 * q1[3]]);
};

const project = ([x, y, z]: Vec3) => ({
  x: 210 + 88 * x - 42 * y,
  y: 142 - 68 * z + 24 * y,
});

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

export function QuaternionSlerpVisualizer() {
  const [targetRoll, setTargetRoll] = useState(0);
  const [targetPitch, setTargetPitch] = useState(60);
  const [targetYaw, setTargetYaw] = useState(140);
  const [t, setT] = useState(0.5);
  const [longPath, setLongPath] = useState(false);

  const state = useMemo(() => {
    const q0: Quat = [1, 0, 0, 0];
    const q1 = fromEuler(targetRoll, targetPitch, targetYaw);
    const q = slerp(q0, q1, t, longPath);
    const bodyX = rotateVector(q, [1, 0, 0]);
    const bodyY = rotateVector(q, [0, 1, 0]);
    const bodyZ = rotateVector(q, [0, 0, 1]);
    const angularDistance = 2 * Math.acos(Math.min(1, Math.abs(dot(q0, q1))));
    return { q0, q1, q, bodyX, bodyY, bodyZ, angularDistance };
  }, [longPath, t, targetPitch, targetRoll, targetYaw]);

  const origin = project([0, 0, 0]);
  const axes = [
    ["x body", state.bodyX, "result"],
    ["y body", state.bodyY, "target"],
    ["z body", state.bodyZ, "original"],
  ] as const;
  const gimbalLockRisk = Math.abs(Math.abs(targetPitch) - 90) < 8;

  return (
    <section className="panel visual-panel">
      <div className="panel-heading">
        <Blend size={18} aria-hidden />
        <h2>Quaternion SLERP</h2>
      </div>
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="target roll" max={180} min={-180} onChange={setTargetRoll} step={1} suffix=" deg" value={targetRoll} />
          <Slider label="target pitch" max={90} min={-90} onChange={setTargetPitch} step={1} suffix=" deg" value={targetPitch} />
          <Slider label="target yaw" max={180} min={-180} onChange={setTargetYaw} step={1} suffix=" deg" value={targetYaw} />
          <Slider label="SLERP t" max={1} min={0} onChange={setT} step={0.01} value={t} />
          <label className="done-toggle">
            <input checked={longPath} onChange={(event) => setLongPath(event.target.checked)} type="checkbox" />
            <span>q와 -q 짧은 경로 처리 끄기</span>
          </label>
          {gimbalLockRisk && <div className="singularity-banner">Euler pitch가 90 deg 근처라 gimbal lock 해석 위험이 크다.</div>}
        </div>
        <svg className="plot" role="img" viewBox="0 0 420 292">
          <line className="axis" x1={origin.x} x2={project([1.55, 0, 0]).x} y1={origin.y} y2={project([1.55, 0, 0]).y} />
          <line className="axis" x1={origin.x} x2={project([0, 1.55, 0]).x} y1={origin.y} y2={project([0, 1.55, 0]).y} />
          <line className="axis" x1={origin.x} x2={project([0, 0, 1.55]).x} y1={origin.y} y2={project([0, 0, 1.55]).y} />
          {axes.map(([label, vector, className]) => {
            const end = project(vector);
            return (
              <g key={label}>
                <line className={`vector ${className}`} x1={origin.x} x2={end.x} y1={origin.y} y2={end.y} />
                <circle className={`point ${className}`} cx={end.x} cy={end.y} r="5" />
                <text x={end.x + 8} y={end.y - 8}>{label}</text>
              </g>
            );
          })}
          <text x="24" y="28">q(t)=slerp(q0,q1,t)</text>
        </svg>
      </div>
      <div className="metrics-grid">
        <div className="metric-card"><span>q(t)</span><strong>[{state.q.map((value) => value.toFixed(3)).join(", ")}]</strong></div>
        <div className="metric-card"><span>||q(t)||</span><strong>{norm(state.q).toFixed(6)}</strong></div>
        <div className="metric-card"><span>angular distance</span><strong>{((state.angularDistance * 180) / Math.PI).toFixed(1)} deg</strong></div>
      </div>
      <div className="hint-box">
        Quaternion은 3D 회전을 안전하게 표현하는 숫자 4개 묶음이다. 정규화를 빼먹으면 회전이 아니라 scale이 섞인 이상한 변환처럼 동작한다.
      </div>
    </section>
  );
}
