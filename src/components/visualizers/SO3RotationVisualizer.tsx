import { useMemo, useState } from "react";
import { Rotate3D } from "lucide-react";

type Vec3 = [number, number, number];
type Mat3 = [Vec3, Vec3, Vec3];

const degToRad = (degree: number) => (degree * Math.PI) / 180;

const multiply = (A: Mat3, B: Mat3): Mat3 =>
  A.map((row) => B[0].map((_, col) => row[0] * B[0][col] + row[1] * B[1][col] + row[2] * B[2][col]) as Vec3) as Mat3;

const matVec = (R: Mat3, v: Vec3): Vec3 => [
  R[0][0] * v[0] + R[0][1] * v[1] + R[0][2] * v[2],
  R[1][0] * v[0] + R[1][1] * v[1] + R[1][2] * v[2],
  R[2][0] * v[0] + R[2][1] * v[1] + R[2][2] * v[2],
];

const transpose = (R: Mat3): Mat3 => [
  [R[0][0], R[1][0], R[2][0]],
  [R[0][1], R[1][1], R[2][1]],
  [R[0][2], R[1][2], R[2][2]],
];

const determinant = (R: Mat3) =>
  R[0][0] * (R[1][1] * R[2][2] - R[1][2] * R[2][1]) -
  R[0][1] * (R[1][0] * R[2][2] - R[1][2] * R[2][0]) +
  R[0][2] * (R[1][0] * R[2][1] - R[1][1] * R[2][0]);

const rotationMatrix = (rollDeg: number, pitchDeg: number, yawDeg: number): Mat3 => {
  const roll = degToRad(rollDeg);
  const pitch = degToRad(pitchDeg);
  const yaw = degToRad(yawDeg);
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const Rx: Mat3 = [[1, 0, 0], [0, cr, -sr], [0, sr, cr]];
  const Ry: Mat3 = [[cp, 0, sp], [0, 1, 0], [-sp, 0, cp]];
  const Rz: Mat3 = [[cy, -sy, 0], [sy, cy, 0], [0, 0, 1]];
  return multiply(multiply(Rz, Ry), Rx);
};

const project = ([x, y, z]: Vec3) => ({
  x: 210 + 86 * x - 44 * y,
  y: 150 - 72 * z + 26 * y,
});

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider-row">
      <span>
        {label}
        <strong>{value.toFixed(0)} deg</strong>
      </span>
      <input max={180} min={-180} onChange={(event) => onChange(Number(event.target.value))} step={1} type="range" value={value} />
    </label>
  );
}

export function SO3RotationVisualizer() {
  const [roll, setRoll] = useState(20);
  const [pitch, setPitch] = useState(35);
  const [yaw, setYaw] = useState(45);
  const [reflection, setReflection] = useState(false);

  const state = useMemo(() => {
    const R = rotationMatrix(roll, pitch, yaw);
    if (reflection) R[0] = R[0].map((value) => -value) as Vec3;
    const RtR = multiply(transpose(R), R);
    const orthogonalityError = Math.sqrt(
      RtR.flatMap((row, i) => row.map((value, j) => value - (i === j ? 1 : 0))).reduce((sum, value) => sum + value * value, 0),
    );
    const det = determinant(R);
    const axes = [
      { label: "x'", color: "result", end: matVec(R, [1, 0, 0]) },
      { label: "y'", color: "target", end: matVec(R, [0, 1, 0]) },
      { label: "z'", color: "original", end: matVec(R, [0, 0, 1]) },
    ];
    return { R, axes, det, orthogonalityError };
  }, [reflection, roll, pitch, yaw]);

  const origin = project([0, 0, 0]);
  const hasFailure = Math.abs(state.det - 1) > 0.05 || state.orthogonalityError > 0.05;

  return (
    <section className="panel visual-panel">
      <div className="panel-heading">
        <Rotate3D size={18} aria-hidden />
        <h2>3D SO(3) Rotation</h2>
      </div>
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="roll x" onChange={setRoll} value={roll} />
          <Slider label="pitch y" onChange={setPitch} value={pitch} />
          <Slider label="yaw z" onChange={setYaw} value={yaw} />
          <label className="done-toggle">
            <input checked={reflection} onChange={(event) => setReflection(event.target.checked)} type="checkbox" />
            <span>det(R)=-1 반례 섞기</span>
          </label>
          <div className="hint-box">
            코드의 sin/cos 입력은 radian이다. 현재 yaw {yaw} deg = {degToRad(yaw).toFixed(3)} rad.
          </div>
          {hasFailure && <div className="singularity-banner">SO(3) 실패: R^T R=I 또는 det(R)=1 조건이 깨졌다.</div>}
        </div>
        <svg className="plot" role="img" viewBox="0 0 420 300">
          <line className="axis" x1={origin.x} x2={project([1.55, 0, 0]).x} y1={origin.y} y2={project([1.55, 0, 0]).y} />
          <line className="axis" x1={origin.x} x2={project([0, 1.55, 0]).x} y1={origin.y} y2={project([0, 1.55, 0]).y} />
          <line className="axis" x1={origin.x} x2={project([0, 0, 1.55]).x} y1={origin.y} y2={project([0, 0, 1.55]).y} />
          {state.axes.map((axis) => {
            const end = project(axis.end);
            return (
              <g key={axis.label}>
                <line className={`vector ${axis.color}`} x1={origin.x} x2={end.x} y1={origin.y} y2={end.y} />
                <circle className={`point ${axis.color}`} cx={end.x} cy={end.y} r="5" />
                <text x={end.x + 8} y={end.y - 8}>{axis.label}</text>
              </g>
            );
          })}
          <text x="24" y="28">R = Rz(yaw) Ry(pitch) Rx(roll)</text>
        </svg>
      </div>
      <div className="metrics-grid">
        <div className="metric-card"><span>det(R)</span><strong>{state.det.toFixed(3)}</strong></div>
        <div className="metric-card"><span>||R^T R - I||</span><strong>{state.orthogonalityError.toExponential(2)}</strong></div>
        <div className="metric-card"><span>robot meaning</span><strong>base_link to camera_link 자세</strong></div>
      </div>
    </section>
  );
}
