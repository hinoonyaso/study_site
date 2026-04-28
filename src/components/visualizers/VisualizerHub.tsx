import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Activity, Crosshair, Gauge, Grid3X3, LineChart, Route, Sigma, Workflow } from "lucide-react";
import { MiniGraph } from "../MiniGraph";
import { DynamicsTorqueVisualizer } from "./DynamicsTorqueVisualizer";
import { EKFCovarianceVisualizer } from "./EKFCovarianceVisualizer";
import { PIDStepResponseVisualizer } from "./PIDStepResponseVisualizer";
import { PhysicalAIFlowVisualizer } from "./PhysicalAIFlowVisualizer";
import { QuaternionSlerpVisualizer } from "./QuaternionSlerpVisualizer";
import { Sim2RealGapVisualizer } from "./Sim2RealGapVisualizer";
import { SO3RotationVisualizer } from "./SO3RotationVisualizer";
import { ThreeRobotArmVisualizer } from "./ThreeRobotArmVisualizer";
import type { LessonSection, TheoryGraphId, VisualizationSpec, VisualizerId } from "../../types";

type VisualizerHubProps = {
  id?: VisualizerId;
  section?: LessonSection;
};

type Point = { x: number; y: number };

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
        <strong>
          {value.toFixed(step < 1 ? 2 : 0)}
          {suffix}
        </strong>
      </span>
      <input
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
    </label>
  );
}

function worldToSvg(point: Point, width: number, height: number, scale: number): Point {
  return {
    x: width / 2 + point.x * scale,
    y: height / 2 - point.y * scale,
  };
}

function polyline(points: Point[]) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

function VisualFrame({
  title,
  icon,
  children,
  metrics,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  metrics?: Array<[string, string]>;
}) {
  return (
    <section className="panel visual-panel">
      <div className="panel-heading">
        {icon}
        <h2>{title}</h2>
      </div>
      <div className="visual-content">{children}</div>
      {metrics && (
        <div className="metrics-grid">
          {metrics.map(([label, value]) => (
            <div className="metric-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function LinearAlgebraVisualizer() {
  const [angle, setAngle] = useState(35);
  const [vx, setVx] = useState(1.3);
  const [vy, setVy] = useState(0.5);
  const theta = (angle * Math.PI) / 180;
  const rotated = {
    x: Math.cos(theta) * vx - Math.sin(theta) * vy,
    y: Math.sin(theta) * vx + Math.cos(theta) * vy,
  };
  const width = 420;
  const height = 280;
  const scale = 72;
  const origin = worldToSvg({ x: 0, y: 0 }, width, height, scale);
  const v = worldToSvg({ x: vx, y: vy }, width, height, scale);
  const rv = worldToSvg(rotated, width, height, scale);

  return (
    <VisualFrame
      icon={<Sigma size={18} aria-hidden />}
      metrics={[
        ["cos θ", Math.cos(theta).toFixed(3)],
        ["sin θ", Math.sin(theta).toFixed(3)],
        ["rotated", `(${rotated.x.toFixed(2)}, ${rotated.y.toFixed(2)})`],
      ]}
      title="2D 회전행렬"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="각도" max={180} min={-180} onChange={setAngle} step={1} suffix="°" value={angle} />
          <Slider label="vx" max={2} min={-2} onChange={setVx} step={0.05} value={vx} />
          <Slider label="vy" max={2} min={-2} onChange={setVy} step={0.05} value={vy} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="20" x2={width - 20} y1={origin.y} y2={origin.y} />
          <line className="axis" x1={origin.x} x2={origin.x} y1="20" y2={height - 20} />
          <line className="vector original" x1={origin.x} x2={v.x} y1={origin.y} y2={v.y} />
          <line className="vector result" x1={origin.x} x2={rv.x} y1={origin.y} y2={rv.y} />
          <circle className="point original" cx={v.x} cy={v.y} r="5" />
          <circle className="point result" cx={rv.x} cy={rv.y} r="5" />
          <text x={v.x + 8} y={v.y - 8}>v</text>
          <text x={rv.x + 8} y={rv.y - 8}>Rv</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function MatrixGridVisualizer() {
  const [scaleX, setScaleX] = useState(1.4);
  const [shear, setShear] = useState(0.4);
  const [basisRotation, setBasisRotation] = useState(25);
  const width = 430;
  const height = 300;
  const scale = 54;
  const origin = worldToSvg({ x: 0, y: 0 }, width, height, scale);
  const bTheta = (basisRotation * Math.PI) / 180;
  const firstTransform = (point: Point) => ({
    x: Math.cos(bTheta) * point.x - Math.sin(bTheta) * point.y,
    y: Math.sin(bTheta) * point.x + Math.cos(bTheta) * point.y,
  });
  const secondTransform = (point: Point) => ({
    x: scaleX * point.x + shear * point.y,
    y: point.y,
  });
  const composedTransform = (point: Point) => secondTransform(firstTransform(point));
  const detA = scaleX;
  const detAB = detA;
  const forceRad = bTheta;
  const r = { x: 0.8, y: 0 };
  const force = { x: Math.cos(forceRad), y: Math.sin(forceRad) };
  const torqueZ = r.x * force.y - r.y * force.x;
  const gridLines = Array.from({ length: 9 }, (_, index) => index - 4);
  const line = (fn: (point: Point) => Point, a: Point, b: Point) => {
    const ta = worldToSvg(fn(a), width, height, scale);
    const tb = worldToSvg(fn(b), width, height, scale);
    return { ta, tb };
  };
  const forceEnd = worldToSvg({ x: r.x + force.x * 0.9, y: r.y + force.y * 0.9 }, width, height, scale);
  const lever = worldToSvg(r, width, height, scale);

  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["det(A)", detA.toFixed(2)],
        ["det(AB)", detAB.toFixed(2)],
        ["tau_z", torqueZ.toFixed(2)],
        ["inverse", Math.abs(detAB) < 0.08 ? "unstable" : "ok"],
      ]}
      title="Matrix Multiplication Grid / Cross Product"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="scale x" max={3} min={0.1} onChange={setScaleX} step={0.05} value={scaleX} />
          <Slider label="shear xy" max={1.5} min={-1.5} onChange={setShear} step={0.05} value={shear} />
          <Slider label="B basis / F angle" max={90} min={-90} onChange={setBasisRotation} step={1} suffix="°" value={basisRotation} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="20" x2={width - 20} y1={origin.y} y2={origin.y} />
          <line className="axis" x1={origin.x} x2={origin.x} y1="20" y2={height - 20} />
          {gridLines.map((value) => {
            const firstVertical = line(firstTransform, { x: value, y: -3.5 }, { x: value, y: 3.5 });
            const firstHorizontal = line(firstTransform, { x: -3.5, y: value }, { x: 3.5, y: value });
            const finalVertical = line(composedTransform, { x: value, y: -3.5 }, { x: value, y: 3.5 });
            const finalHorizontal = line(composedTransform, { x: -3.5, y: value }, { x: 3.5, y: value });
            return (
              <g key={value}>
                <line className="grid-line-soft" strokeDasharray="4 4" x1={firstVertical.ta.x} x2={firstVertical.tb.x} y1={firstVertical.ta.y} y2={firstVertical.tb.y} />
                <line className="grid-line-soft" strokeDasharray="4 4" x1={firstHorizontal.ta.x} x2={firstHorizontal.tb.x} y1={firstHorizontal.ta.y} y2={firstHorizontal.tb.y} />
                <line className="grid-line-soft" x1={finalVertical.ta.x} x2={finalVertical.tb.x} y1={finalVertical.ta.y} y2={finalVertical.tb.y} />
                <line className="grid-line-soft" x1={finalHorizontal.ta.x} x2={finalHorizontal.tb.x} y1={finalHorizontal.ta.y} y2={finalHorizontal.tb.y} />
              </g>
            );
          })}
          <line className="vector original" x1={origin.x} x2={lever.x} y1={origin.y} y2={lever.y} />
          <line className="vector result" x1={lever.x} x2={forceEnd.x} y1={lever.y} y2={forceEnd.y} />
          <circle className="joint" cx={origin.x} cy={origin.y} r="5" />
          <circle className="point result" cx={lever.x} cy={lever.y} r="5" />
          <text x="24" y="32">dashed: B grid</text>
          <text x="24" y="52">solid: A(B grid)</text>
          <text x={forceEnd.x + 8} y={forceEnd.y - 8}>F</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

type Point3 = { x: number; y: number; z: number };

function project3D(point: Point3, width: number, height: number, scale: number): Point {
  return {
    x: width / 2 + (point.x - point.y) * scale * 0.72,
    y: height / 2 - point.z * scale - (point.x + point.y) * scale * 0.28,
  };
}

function CrossProduct3DVisualizer() {
  const [forceAngle, setForceAngle] = useState(90);
  const [force, setForce] = useState(6);
  const [outOfPlane, setOutOfPlane] = useState(0.25);
  const width = 430;
  const height = 300;
  const scale = 90;
  const rad = (forceAngle * Math.PI) / 180;
  const r: Point3 = { x: 1.1, y: 0, z: 0 };
  const f: Point3 = {
    x: Math.cos(rad) * force,
    y: Math.sin(rad) * force,
    z: outOfPlane * force,
  };
  const tau: Point3 = {
    x: r.y * f.z - r.z * f.y,
    y: r.z * f.x - r.x * f.z,
    z: r.x * f.y - r.y * f.x,
  };
  const tauMag = Math.hypot(tau.x, tau.y, tau.z);
  const fScale = 0.11;
  const tauScale = tauMag > 0 ? 0.85 / tauMag : 0;
  const origin = project3D({ x: 0, y: 0, z: 0 }, width, height, scale);
  const rEnd = project3D(r, width, height, scale);
  const fEnd = project3D({ x: r.x + f.x * fScale, y: r.y + f.y * fScale, z: r.z + f.z * fScale }, width, height, scale);
  const tauEnd = project3D({ x: tau.x * tauScale, y: tau.y * tauScale, z: tau.z * tauScale }, width, height, scale);

  return (
    <VisualFrame
      icon={<Crosshair size={18} aria-hidden />}
      metrics={[
        ["|tau|", tauMag.toFixed(2)],
        ["tau_z", tau.z.toFixed(2)],
        ["right hand", tauMag < 0.05 ? "parallel" : tau.z >= 0 ? "+z" : "-z"],
      ]}
      title="3D Cross Product Torque"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="force angle" max={180} min={0} onChange={setForceAngle} step={1} suffix="°" value={forceAngle} />
          <Slider label="force" max={20} min={0} onChange={setForce} step={0.2} suffix=" N" value={force} />
          <Slider label="out of plane" max={1} min={-1} onChange={setOutOfPlane} step={0.05} value={outOfPlane} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="35" x2={width - 35} y1={height / 2 + 42} y2={height / 2 - 42} />
          <line className="axis" x1={width / 2} x2={width / 2} y1="30" y2={height - 35} />
          <line className="vector original" x1={origin.x} x2={rEnd.x} y1={origin.y} y2={rEnd.y} />
          <line className="vector result" x1={rEnd.x} x2={fEnd.x} y1={rEnd.y} y2={fEnd.y} />
          <line className="vector accent" x1={origin.x} x2={tauEnd.x} y1={origin.y} y2={tauEnd.y} />
          <circle className="joint" cx={origin.x} cy={origin.y} r="5" />
          <circle className="point original" cx={rEnd.x} cy={rEnd.y} r="5" />
          <text x={rEnd.x + 8} y={rEnd.y + 4}>r</text>
          <text x={fEnd.x + 8} y={fEnd.y - 8}>F</text>
          <text x={tauEnd.x + 8} y={tauEnd.y - 8}>tau=r x F</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function LossLandscapeVisualizer() {
  const [alpha, setAlpha] = useState(0.2);
  const [initialX, setInitialX] = useState(-1);
  const [initialY, setInitialY] = useState(1);
  const width = 430;
  const height = 300;
  const scale = 55;
  const center = { x: 1, y: -0.5 };
  const loss = (x: number, y: number) => (x - 1) ** 2 + 0.5 * (y + 0.5) ** 2;
  const grad = (x: number, y: number) => ({ x: 2 * (x - 1), y: y + 0.5 });
  const path = [{ x: initialX, y: initialY }];
  for (let i = 0; i < 18; i += 1) {
    const last = path[path.length - 1];
    const g = grad(last.x, last.y);
    const next = {
      x: Math.max(-3.5, Math.min(3.5, last.x - alpha * g.x)),
      y: Math.max(-3.5, Math.min(3.5, last.y - alpha * g.y)),
    };
    path.push(next);
  }
  const final = path[path.length - 1];
  const finalGrad = grad(final.x, final.y);
  const contourLevels = [0.25, 0.75, 1.5, 3, 5.5, 8];
  const contour = (level: number) =>
    Array.from({ length: 80 }, (_, index) => {
      const t = (index / 79) * Math.PI * 2;
      return worldToSvg(
        {
          x: center.x + Math.sqrt(level) * Math.cos(t),
          y: center.y + Math.sqrt(2 * level) * Math.sin(t),
        },
        width,
        height,
        scale,
      );
    });
  const svgPath = path.map((point) => worldToSvg(point, width, height, scale));

  return (
    <VisualFrame
      icon={<LineChart size={18} aria-hidden />}
      metrics={[
        ["final loss", loss(final.x, final.y).toFixed(3)],
        ["grad norm", Math.hypot(finalGrad.x, finalGrad.y).toFixed(3)],
        ["status", alpha > 0.95 ? "unstable risk" : "descent"],
      ]}
      title="Gradient Descent Loss Landscape"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="learning rate" max={1.2} min={0.01} onChange={setAlpha} step={0.01} value={alpha} />
          <Slider label="initial x" max={3} min={-3} onChange={setInitialX} step={0.05} value={initialX} />
          <Slider label="initial y" max={3} min={-3} onChange={setInitialY} step={0.05} value={initialY} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          {contourLevels.map((level) => (
            <polyline className="grid-line-soft" fill="none" key={level} points={polyline(contour(level))} />
          ))}
          <polyline className="vector result" fill="none" points={polyline(svgPath)} />
          {svgPath.map((point, index) => (
            <circle className={index === 0 ? "point original" : "point result"} cx={point.x} cy={point.y} key={`${point.x}-${point.y}-${index}`} r={index === 0 ? 5 : 3} />
          ))}
          <circle className="joint" cx={worldToSvg(center, width, height, scale).x} cy={worldToSvg(center, width, height, scale).y} r="5" />
          <text x={worldToSvg(center, width, height, scale).x + 8} y={worldToSvg(center, width, height, scale).y - 8}>minimum</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function GaussianBayesVisualizer() {
  const [priorSigma, setPriorSigma] = useState(2);
  const [measurementSigma, setMeasurementSigma] = useState(1);
  const [measurementZ, setMeasurementZ] = useState(3);
  const width = 430;
  const height = 280;
  const priorMu = 0;
  const priorVar = priorSigma ** 2;
  const measVar = measurementSigma ** 2;
  const postVar = 1 / (1 / priorVar + 1 / measVar);
  const postMu = postVar * (priorMu / priorVar + measurementZ / measVar);
  const kalmanGain = priorVar / (priorVar + measVar);
  const pdf = (x: number, mu: number, sigma: number) =>
    Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (Math.sqrt(2 * Math.PI) * sigma);
  const xs = Array.from({ length: 160 }, (_, index) => -6 + (12 * index) / 159);
  const maxPdf = Math.max(
    ...xs.flatMap((x) => [pdf(x, priorMu, priorSigma), pdf(x, measurementZ, measurementSigma), pdf(x, postMu, Math.sqrt(postVar))]),
  );
  const mapPoint = (x: number, y: number) => ({
    x: 28 + ((x + 6) / 12) * (width - 56),
    y: height - 34 - (y / maxPdf) * (height - 70),
  });
  const priorPoints = xs.map((x) => mapPoint(x, pdf(x, priorMu, priorSigma)));
  const measPoints = xs.map((x) => mapPoint(x, pdf(x, measurementZ, measurementSigma)));
  const postPoints = xs.map((x) => mapPoint(x, pdf(x, postMu, Math.sqrt(postVar))));

  return (
    <VisualFrame
      icon={<Gauge size={18} aria-hidden />}
      metrics={[
        ["posterior mu", postMu.toFixed(2)],
        ["posterior sigma", Math.sqrt(postVar).toFixed(2)],
        ["Kalman K", kalmanGain.toFixed(2)],
      ]}
      title="Gaussian Bayes Update"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="prior sigma" max={5} min={0.2} onChange={setPriorSigma} step={0.05} value={priorSigma} />
          <Slider label="measurement sigma" max={5} min={0.2} onChange={setMeasurementSigma} step={0.05} value={measurementSigma} />
          <Slider label="measurement z" max={5} min={-5} onChange={setMeasurementZ} step={0.05} value={measurementZ} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="24" x2={width - 24} y1={height - 34} y2={height - 34} />
          <polyline className="vector original" fill="none" points={polyline(priorPoints)} />
          <polyline className="vector accent" fill="none" points={polyline(measPoints)} />
          <polyline className="vector result" fill="none" points={polyline(postPoints)} />
          <text x="32" y="28">prior</text>
          <text x="32" y="48">measurement</text>
          <text x="32" y="68">posterior</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function OdeFiniteDiffVisualizer() {
  const [dt, setDt] = useState(0.1);
  const [h, setH] = useState(0.001);
  const [lambda, setLambda] = useState(1);
  const width = 430;
  const height = 280;
  const derivative = ((2 + h) ** 2 - (2 - h) ** 2) / (2 * h);
  const derivativeError = Math.abs(derivative - 4);
  const steps = Math.max(1, Math.round(2 / dt));
  const euler: Point[] = [];
  const truth: Point[] = [];
  let x = 1;
  for (let i = 0; i <= steps; i += 1) {
    const t = i * dt;
    euler.push({ x: t, y: x });
    truth.push({ x: t, y: Math.exp(-lambda * t) });
    x += dt * (-lambda * x);
  }
  const mapCurve = (point: Point) => ({
    x: 32 + (point.x / 2) * (width - 64),
    y: height - 34 - point.y * (height - 72),
  });
  const finalError = Math.abs(euler[euler.length - 1].y - truth[truth.length - 1].y);

  return (
    <VisualFrame
      icon={<Activity size={18} aria-hidden />}
      metrics={[
        ["df/dx error", derivativeError.toExponential(1)],
        ["final error", finalError.toFixed(3)],
        ["steps", String(steps)],
      ]}
      title="Finite Difference and ODE Error"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="dt" max={0.5} min={0.01} onChange={setDt} step={0.005} value={dt} />
          <Slider label="difference h" max={0.1} min={0.000001} onChange={setH} step={0.001} value={h} />
          <Slider label="decay lambda" max={5} min={0.1} onChange={setLambda} step={0.05} value={lambda} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="28" x2={width - 28} y1={height - 34} y2={height - 34} />
          <line className="axis" x1="32" x2="32" y1="26" y2={height - 34} />
          <polyline className="vector original" fill="none" points={polyline(truth.map(mapCurve))} />
          <polyline className="vector result" fill="none" points={polyline(euler.map(mapCurve))} />
          <text x="42" y="30">true exp(-lambda t)</text>
          <text x="42" y="50">Euler</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function ManipulatorVisualizer() {
  const [q1, setQ1] = useState(35);
  const [q2, setQ2] = useState(55);
  const [q3, setQ3] = useState(-25);
  const [targetX, setTargetX] = useState(1.0);
  const [targetY, setTargetY] = useState(0.8);
  const [damping, setDamping] = useState(0.08);
  const l1 = 1.0;
  const l2 = 0.72;
  const l3 = 0.45;
  const lengths = [l1, l2, l3];
  const a1 = (q1 * Math.PI) / 180;
  const a2 = (q2 * Math.PI) / 180;
  const a3 = (q3 * Math.PI) / 180;
  const reachMax = lengths.reduce((sum, value) => sum + value, 0);
  const fk3 = (q: number[]) => {
    let theta = 0;
    let x = 0;
    let y = 0;
    const joints = [{ x: 0, y: 0 }];
    q.forEach((angle, index) => {
      theta += angle;
      x += lengths[index] * Math.cos(theta);
      y += lengths[index] * Math.sin(theta);
      joints.push({ x, y });
    });
    return { joints, ee: joints[joints.length - 1], theta };
  };
  const jacobian3 = (q: number[]) => {
    const cumulative = q.map((_, index) => q.slice(0, index + 1).reduce((sum, value) => sum + value, 0));
    return q.map((_, column) => {
      let dx = 0;
      let dy = 0;
      for (let link = column; link < lengths.length; link += 1) {
        dx += -lengths[link] * Math.sin(cumulative[link]);
        dy += lengths[link] * Math.cos(cumulative[link]);
      }
      return { dx, dy };
    });
  };
  const solve2 = (a: number, b: number, c: number, d: number, x: number, y: number) => {
    const det = a * d - b * c;
    if (Math.abs(det) < 1e-8) return { x: 0, y: 0 };
    return { x: (d * x - b * y) / det, y: (-c * x + a * y) / det };
  };
  const dlsStep = (q: number[], target: Point) => {
    const current = fk3(q).ee;
    const error = { x: target.x - current.x, y: target.y - current.y };
    const j = jacobian3(q);
    const jj00 = j.reduce((sum, col) => sum + col.dx * col.dx, 0) + damping * damping;
    const jj01 = j.reduce((sum, col) => sum + col.dx * col.dy, 0);
    const jj11 = j.reduce((sum, col) => sum + col.dy * col.dy, 0) + damping * damping;
    const solved = solve2(jj00, jj01, jj01, jj11, error.x, error.y);
    const rawDelta = j.map((col) => col.dx * solved.x + col.dy * solved.y);
    const deltaNorm = Math.hypot(...rawDelta);
    const scaleDelta = deltaNorm > 0.32 ? 0.32 / deltaNorm : 1;
    return q.map((angle, index) => angle + rawDelta[index] * scaleDelta);
  };
  const q = [a1, a2, a3];
  const fk = fk3(q);
  const [base, joint1, joint2, ee] = fk.joints;
  const jacobian = jacobian3(q);
  const j11 = jacobian[0].dx;
  const j12 = jacobian[1].dx;
  const j13 = jacobian[2].dx;
  const j21 = jacobian[0].dy;
  const j22 = jacobian[1].dy;
  const j23 = jacobian[2].dy;
  const jj00 = j11 * j11 + j12 * j12 + j13 * j13;
  const jj01 = j11 * j21 + j12 * j22 + j13 * j23;
  const jj11 = j21 * j21 + j22 * j22 + j23 * j23;
  const detJjt = Math.max(0, jj00 * jj11 - jj01 * jj01);
  const manipulability = Math.sqrt(detJjt);
  const detJ12 = l1 * l2 * Math.sin(a2);
  const isSingular = manipulability < 0.08;
  const targetDistance = Math.hypot(targetX, targetY);
  const isReachable = targetDistance <= reachMax + 1e-6;
  const qdot = { q1: 0.35, q2: -0.2, q3: 0.15 };
  const xdot = {
    x: j11 * qdot.q1 + j12 * qdot.q2 + j13 * qdot.q3,
    y: j21 * qdot.q1 + j22 * qdot.q2 + j23 * qdot.q3,
  };
  const width = 420;
  const height = 310;
  const scale = 66;
  const origin = worldToSvg({ x: 0, y: 0 }, width, height, scale);
  const sEe = worldToSvg(ee, width, height, scale);
  const sTarget = worldToSvg({ x: targetX, y: targetY }, width, height, scale);
  const sJoint1 = worldToSvg(joint1, width, height, scale);
  const sJoint2 = worldToSvg(joint2, width, height, scale);
  const sVelocityEnd = {
    x: sEe.x + xdot.x * 76,
    y: sEe.y - xdot.y * 76,
  };
  const trace = jj00 + jj11;
  const discr = Math.sqrt(Math.max(0, (jj00 - jj11) ** 2 + 4 * jj01 ** 2));
  const lambdaMax = Math.max(0, (trace + discr) / 2);
  const lambdaMin = Math.max(0, (trace - discr) / 2);
  const ellipseAngle = (Math.atan2(2 * jj01, jj00 - jj11) * 90) / Math.PI;
  const ikTrace = Array.from({ length: 10 }, (_, index) => index).reduce<Array<{ point: Point; error: number; q: number[] }>>((traceItems, index) => {
    const previousQ = index === 0 ? q : traceItems[traceItems.length - 1].q;
    const nextQ = index === 0 ? previousQ : dlsStep(previousQ, { x: targetX, y: targetY });
    const nextFk = fk3(nextQ);
    traceItems.push({
      point: worldToSvg(nextFk.ee, width, height, scale),
      error: Math.hypot(targetX - nextFk.ee.x, targetY - nextFk.ee.y),
      q: nextQ,
    });
    return traceItems;
  }, []);
  const finalIk = ikTrace[ikTrace.length - 1];
  const l23 = l2 + l3;
  const seedDistance = Math.max(0.001, Math.min(l1 + l23 - 0.001, targetDistance));
  const cosSeed = Math.max(-1, Math.min(1, (seedDistance * seedDistance - l1 * l1 - l23 * l23) / (2 * l1 * l23)));
  const elbowUpQ2 = Math.acos(cosSeed);
  const elbowDownQ2 = -elbowUpQ2;
  const seedQ1 = (seedQ2: number) => Math.atan2(targetY, targetX) - Math.atan2(l23 * Math.sin(seedQ2), l1 + l23 * Math.cos(seedQ2));
  const compactTransform = (label: string, angle: number, x: number, y: number) => {
    const c = Math.cos(angle).toFixed(2);
    const s = Math.sin(angle).toFixed(2);
    return [label, `${c} ${(-Number(s)).toFixed(2)} | ${x.toFixed(2)} ; ${s} ${c} | ${y.toFixed(2)}`];
  };
  const localStep = (angle: number, length: number) => ({
    x: length * Math.cos(angle),
    y: length * Math.sin(angle),
  });
  const step12 = localStep(a2, l2);
  const step23 = localStep(a3, l3);
  const transformRows = [
    compactTransform("T01", a1, joint1.x, joint1.y),
    compactTransform("T12", a2, step12.x, step12.y),
    compactTransform("T23", a3, step23.x, step23.y),
    compactTransform("T03", fk.theta, ee.x, ee.y),
  ];

  return (
    <VisualFrame
      icon={<Crosshair size={18} aria-hidden />}
      metrics={[
        ["FK end-effector", `(${ee.x.toFixed(2)}, ${ee.y.toFixed(2)})`],
        ["DLS final error", finalIk.error.toFixed(3)],
        ["det(JJᵀ)", detJjt.toFixed(3)],
        ["manipulability", manipulability.toFixed(3)],
        ["det J12", detJ12.toFixed(3)],
      ]}
      title="3링크 FK Matrix / DLS IK / Jacobian Singularity"
    >
      <>
        <div className="visual-layout">
          <div className="control-stack">
            <Slider label="q1" max={180} min={-180} onChange={setQ1} step={1} suffix="°" value={q1} />
            <Slider label="q2" max={180} min={-180} onChange={setQ2} step={1} suffix="°" value={q2} />
            <Slider label="q3" max={180} min={-180} onChange={setQ3} step={1} suffix="°" value={q3} />
            <Slider label="target x" max={2.2} min={-2.2} onChange={setTargetX} step={0.05} value={targetX} />
            <Slider label="target y" max={2.2} min={-2.2} onChange={setTargetY} step={0.05} value={targetY} />
            <Slider label="IK damping" max={0.3} min={0.01} onChange={setDamping} step={0.01} value={damping} />
            {isSingular && <div className="singularity-banner">singularity 근처 · manipulability ellipse가 선분으로 붕괴</div>}
            {!isReachable && <div className="singularity-banner">workspace 밖 target · DLS가 끝까지 도달하지 못함</div>}
          </div>
          <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
            <circle className="workspace-ring" cx={origin.x} cy={origin.y} r={reachMax * scale} />
            <circle className="workspace-ring workspace-inner" cx={origin.x} cy={origin.y} r={Math.max(0.03, Math.abs(l1 - l2 - l3)) * scale} />
            {ikTrace.map((item, index) => (
              <circle className="workspace-sample" cx={item.point.x} cy={item.point.y} key={index} r="1.8" />
            ))}
            <line className="axis" x1="20" x2={width - 20} y1={origin.y} y2={origin.y} />
            <line className="axis" x1={origin.x} x2={origin.x} y1="20" y2={height - 20} />
            <line className="link" x1={origin.x} x2={sJoint1.x} y1={origin.y} y2={sJoint1.y} />
            <line className="link" x1={sJoint1.x} x2={sJoint2.x} y1={sJoint1.y} y2={sJoint2.y} />
            <line className="link" x1={sJoint2.x} x2={sEe.x} y1={sJoint2.y} y2={sEe.y} />
            <line className="velocity-arrow" x1={sEe.x} x2={sVelocityEnd.x} y1={sEe.y} y2={sVelocityEnd.y} />
            <ellipse
              className="manip-ellipse"
              cx={sEe.x}
              cy={sEe.y}
              rx={Math.max(4, Math.sqrt(lambdaMax) * 32)}
              ry={Math.max(2, Math.sqrt(lambdaMin) * 32)}
              transform={`rotate(${ellipseAngle} ${sEe.x} ${sEe.y})`}
            />
            <polyline className="ik-trace-line" points={polyline(ikTrace.map((item) => item.point))} />
            {ikTrace.map((item, index) => (
              <circle className="ik-trace-dot" cx={item.point.x} cy={item.point.y} key={index} r={2.5 + index * 0.35} />
            ))}
            <circle className="joint" cx={origin.x} cy={origin.y} r="6" />
            <circle className="joint" cx={sJoint1.x} cy={sJoint1.y} r="6" />
            <circle className="joint" cx={sJoint2.x} cy={sJoint2.y} r="6" />
            <circle className="point result" cx={sEe.x} cy={sEe.y} r="6" />
            <circle className="point target" cx={sTarget.x} cy={sTarget.y} r="6" />
            <text x={sTarget.x + 8} y={sTarget.y - 8}>target</text>
            <text x="24" y="28">workspace ring</text>
            <text x="24" y="48">dots: DLS IK iterations</text>
          </svg>
        </div>
        <div className="matrix-step-grid">
          {transformRows.map(([label, value]) => (
            <div className="matrix-card" key={label}>
              <span>{label}</span>
              <code>{value}</code>
            </div>
          ))}
        </div>
        <div className="ik-trace-summary">
          <strong>IK convergence</strong>
          <span>analytic elbow-up seed: {((seedQ1(elbowUpQ2) * 180) / Math.PI).toFixed(1)}°, {((elbowUpQ2 * 180) / Math.PI).toFixed(1)}°</span>
          <span>analytic elbow-down seed: {((seedQ1(elbowDownQ2) * 180) / Math.PI).toFixed(1)}°, {((elbowDownQ2 * 180) / Math.PI).toFixed(1)}°</span>
          <span>workspace: {isReachable ? "reachable" : "unreachable"}</span>
          {ikTrace.map((item, index) => (
            <span key={index}>#{index}: e={item.error.toFixed(3)}</span>
          ))}
        </div>
      </>
    </VisualFrame>
  );
}

function RetrievalFlowVisualizer() {
  const [chunks, setChunks] = useState(8);
  const [topK, setTopK] = useState(3);
  const [strictness, setStrictness] = useState(0.7);
  const retrieved = Math.min(chunks, topK);
  const groundedScore = Math.min(0.98, 0.42 + retrieved * 0.1 + strictness * 0.24);
  const latency = 180 + chunks * 9 + topK * 42;
  const passRate = Math.max(0, Math.min(1, groundedScore - Math.max(0, topK - 4) * 0.04));
  const nodes = [
    ["문서", `${chunks} chunks`],
    ["검색", `top-${retrieved}`],
    ["컨텍스트", `${Math.round(groundedScore * 100)}% grounded`],
    ["프롬프트", "JSON output"],
    ["평가", `${Math.round(passRate * 100)}% pass`],
  ];

  return (
    <VisualFrame
      icon={<Workflow size={18} aria-hidden />}
      metrics={[
        ["retrieved", `${retrieved}/${chunks}`],
        ["latency", `${latency} ms`],
        ["eval pass", `${Math.round(passRate * 100)}%`],
      ]}
      title="Retrieval / Eval Harness"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="chunks" max={18} min={4} onChange={setChunks} step={1} value={chunks} />
          <Slider label="top-k" max={6} min={1} onChange={setTopK} step={1} value={topK} />
          <Slider label="schema strictness" max={1} min={0.1} onChange={setStrictness} step={0.05} value={strictness} />
        </div>
        <div className="flow-visual">
          {nodes.map(([label, value], index) => (
            <div className="flow-step-wrap" key={label}>
              <div className="flow-step">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
              {index < nodes.length - 1 && <div className="flow-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  );
}

function MobileOdomVisualizer() {
  const [vl, setVl] = useState(0.55);
  const [vr, setVr] = useState(0.85);
  const [seconds, setSeconds] = useState(7);
  const wheelBase = 0.48;
  const path = useMemo(() => {
    const pts: Point[] = [];
    let x = 0;
    let y = 0;
    let yaw = 0;
    const dt = seconds / 120;
    for (let i = 0; i < 120; i += 1) {
      const v = 0.5 * (vl + vr);
      const w = (vr - vl) / wheelBase;
      x += v * Math.cos(yaw) * dt;
      y += v * Math.sin(yaw) * dt;
      yaw += w * dt;
      pts.push({ x, y });
    }
    return { pts, pose: { x, y, yaw } };
  }, [seconds, vl, vr]);
  const width = 430;
  const height = 280;
  const screen = path.pts.map((point) => ({ x: 45 + point.x * 62, y: height / 2 - point.y * 62 }));
  const end = screen[screen.length - 1] ?? { x: 45, y: height / 2 };

  return (
    <VisualFrame
      icon={<Route size={18} aria-hidden />}
      metrics={[
        ["x, y", `(${path.pose.x.toFixed(2)}, ${path.pose.y.toFixed(2)}) m`],
        ["yaw", `${((path.pose.yaw * 180) / Math.PI).toFixed(1)}°`],
        ["angular z", `${((vr - vl) / wheelBase).toFixed(2)} rad/s`],
      ]}
      title="Differential Drive Odometry"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="left wheel" max={1.2} min={-0.3} onChange={setVl} step={0.01} suffix=" m/s" value={vl} />
          <Slider label="right wheel" max={1.2} min={-0.3} onChange={setVr} step={0.01} suffix=" m/s" value={vr} />
          <Slider label="time" max={12} min={2} onChange={setSeconds} step={1} suffix=" s" value={seconds} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          <line className="axis" x1="20" x2={width - 20} y1={height / 2} y2={height / 2} />
          <polyline className="path-line" points={polyline(screen)} />
          <circle className="point result" cx={end.x} cy={end.y} r="7" />
          <text x={end.x + 8} y={end.y - 8}>base_link</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

const defaultObstacles = new Set(["2,1", "2,2", "2,3", "4,3", "5,3", "6,3", "6,4", "6,5", "3,6", "4,6"]);

function runAStar(width: number, height: number, obstacles: Set<string>) {
  const start = "0,0";
  const goal = `${width - 1},${height - 1}`;
  const key = (x: number, y: number) => `${x},${y}`;
  const parse = (id: string) => id.split(",").map(Number) as [number, number];
  const h = (id: string) => {
    const [x, y] = parse(id);
    return Math.abs(width - 1 - x) + Math.abs(height - 1 - y);
  };
  const open = new Set([start]);
  const came: Record<string, string> = {};
  const g: Record<string, number> = { [start]: 0 };

  while (open.size > 0) {
    const current = [...open].sort((a, b) => (g[a] ?? Infinity) + h(a) - ((g[b] ?? Infinity) + h(b)))[0];
    if (current === goal) {
      const path = [current];
      while (came[path[0]]) path.unshift(came[path[0]]);
      return path;
    }
    open.delete(current);
    const [cx, cy] = parse(current);
    [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].forEach(([dx, dy]) => {
      const nx = cx + dx;
      const ny = cy + dy;
      const nid = key(nx, ny);
      if (nx < 0 || nx >= width || ny < 0 || ny >= height || obstacles.has(nid)) return;
      const tentative = (g[current] ?? Infinity) + 1;
      if (tentative < (g[nid] ?? Infinity)) {
        came[nid] = current;
        g[nid] = tentative;
        open.add(nid);
      }
    });
  }
  return [];
}

function AStarVisualizer() {
  const [obstacles, setObstacles] = useState(defaultObstacles);
  const width = 10;
  const height = 8;
  const path = useMemo(() => runAStar(width, height, obstacles), [obstacles]);
  const toggle = (x: number, y: number) => {
    const id = `${x},${y}`;
    if (id === "0,0" || id === `${width - 1},${height - 1}`) return;
    setObstacles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["grid", `${width} x ${height}`],
        ["obstacles", String(obstacles.size)],
        ["path length", path.length ? String(path.length - 1) : "blocked"],
      ]}
      title="A* Grid Planner"
    >
      <div className="grid-visual" style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
        {Array.from({ length: width * height }, (_, index) => {
          const x = index % width;
          const y = Math.floor(index / width);
          const id = `${x},${y}`;
          const className = [
            "grid-cell",
            obstacles.has(id) ? "is-obstacle" : "",
            path.includes(id) ? "is-path" : "",
            id === "0,0" ? "is-start" : "",
            id === `${width - 1},${height - 1}` ? "is-goal" : "",
          ].join(" ");
          return (
            <button aria-label={`cell ${id}`} className={className} key={id} onClick={() => toggle(x, y)} type="button" />
          );
        })}
      </div>
      <div className="visual-actions">
        <button className="text-button" onClick={() => setObstacles(defaultObstacles)} type="button">
          기본 장애물
        </button>
        <button className="text-button" onClick={() => setObstacles(new Set())} type="button">
          장애물 지우기
        </button>
      </div>
    </VisualFrame>
  );
}

function PurePursuitVisualizer() {
  const [lookahead, setLookahead] = useState(0.9);
  const [progress, setProgress] = useState(0.25);
  const path = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => {
        const x = (i / 79) * 6;
        return { x, y: 0.65 * Math.sin(x * 1.2) };
      }),
    [],
  );
  const robotIndex = Math.min(path.length - 1, Math.floor(progress * (path.length - 1)));
  const robot = path[robotIndex];
  const target =
    path.slice(robotIndex).find((point) => Math.hypot(point.x - robot.x, point.y - robot.y) >= lookahead) ??
    path[path.length - 1];
  const localTarget = { x: target.x - robot.x, y: target.y - robot.y };
  const curvature = (2 * localTarget.y) / Math.max(0.001, localTarget.x * localTarget.x + localTarget.y * localTarget.y);
  const screen = path.map((point) => ({ x: 30 + point.x * 62, y: 150 - point.y * 70 }));
  const sRobot = { x: 30 + robot.x * 62, y: 150 - robot.y * 70 };
  const sTarget = { x: 30 + target.x * 62, y: 150 - target.y * 70 };

  return (
    <VisualFrame
      icon={<Gauge size={18} aria-hidden />}
      metrics={[
        ["target", `(${target.x.toFixed(2)}, ${target.y.toFixed(2)})`],
        ["curvature", curvature.toFixed(3)],
        ["lookahead", `${lookahead.toFixed(2)} m`],
      ]}
      title="Pure Pursuit"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="lookahead" max={1.8} min={0.3} onChange={setLookahead} step={0.05} suffix=" m" value={lookahead} />
          <Slider label="progress" max={0.95} min={0.02} onChange={setProgress} step={0.01} value={progress} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <polyline className="path-line" points={polyline(screen)} />
          <line className="lookahead-line" x1={sRobot.x} x2={sTarget.x} y1={sRobot.y} y2={sTarget.y} />
          <circle className="lookahead-ring" cx={sRobot.x} cy={sRobot.y} r={lookahead * 62} />
          <circle className="point result" cx={sRobot.x} cy={sRobot.y} r="7" />
          <circle className="point target" cx={sTarget.x} cy={sTarget.y} r="7" />
          <text x={sRobot.x + 8} y={sRobot.y - 8}>robot</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function BicycleStanleyVisualizer() {
  const [crossTrack, setCrossTrack] = useState(0.8);
  const [headingError, setHeadingError] = useState(5);
  const [speed, setSpeed] = useState(5);
  const gain = 1.2;
  const wheelbase = 2.5;
  const headingRad = (headingError * Math.PI) / 180;
  const stanley = headingRad + Math.atan2(gain * crossTrack, speed + 1e-6);
  const delta = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, stanley));
  const yawRate = (speed / wheelbase) * Math.tan(delta);
  const path = Array.from({ length: 70 }, (_, index) => {
    const x = (index / 69) * 6;
    return { x, y: 0.28 * Math.sin(x * 1.4) };
  });
  const robot = { x: 2.6, y: 0.28 * Math.sin(2.6 * 1.4) + crossTrack };
  const screen = path.map((point) => ({ x: 35 + point.x * 62, y: 150 - point.y * 72 }));
  const sRobot = { x: 35 + robot.x * 62, y: 150 - robot.y * 72 };
  const headingEnd = {
    x: sRobot.x + Math.cos(headingRad) * 60,
    y: sRobot.y - Math.sin(headingRad) * 60,
  };
  const steerEnd = {
    x: sRobot.x + Math.cos(headingRad + delta) * 48,
    y: sRobot.y - Math.sin(headingRad + delta) * 48,
  };

  return (
    <VisualFrame
      icon={<Route size={18} aria-hidden />}
      metrics={[
        ["delta", `${((delta * 180) / Math.PI).toFixed(1)}°`],
        ["yaw rate", `${yawRate.toFixed(2)} rad/s`],
        ["saturation", Math.abs(stanley) > Math.PI / 6 ? "active" : "clear"],
      ]}
      title="Bicycle / Stanley Controller"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="cross-track" max={2} min={-2} onChange={setCrossTrack} step={0.05} suffix=" m" value={crossTrack} />
          <Slider label="heading error" max={30} min={-30} onChange={setHeadingError} step={1} suffix="°" value={headingError} />
          <Slider label="speed" max={15} min={0.5} onChange={setSpeed} step={0.1} suffix=" m/s" value={speed} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <polyline className="path-line" points={polyline(screen)} />
          <line className="lookahead-line" x1={sRobot.x} x2={headingEnd.x} y1={sRobot.y} y2={headingEnd.y} />
          <line className="velocity-arrow" x1={sRobot.x} x2={steerEnd.x} y1={sRobot.y} y2={steerEnd.y} />
          <line className="cross-track-line" x1={sRobot.x} x2={sRobot.x} y1={sRobot.y} y2={150 - 0.28 * Math.sin(2.6 * 1.4) * 72} />
          <circle className="point result" cx={sRobot.x} cy={sRobot.y} r="8" />
          <text x={sRobot.x + 10} y={sRobot.y - 10}>vehicle</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function KalmanVisualizer() {
  const [processNoise, setProcessNoise] = useState(0.03);
  const [measurementNoise, setMeasurementNoise] = useState(0.25);
  const data = useMemo(() => {
    let x = 0;
    let p = 1;
    return Array.from({ length: 45 }, (_, i) => {
      const truth = i * 0.045 + Math.sin(i * 0.18) * 0.2;
      const measurement = truth + Math.sin(i * 1.7) * measurementNoise;
      p += processNoise;
      const k = p / (p + measurementNoise);
      x += k * (measurement - x);
      p = (1 - k) * p;
      return { truth, measurement, estimate: x };
    });
  }, [measurementNoise, processNoise]);
  const mapPoint = (value: number, index: number, field: "truth" | "measurement" | "estimate") => ({
    x: 25 + index * 8.6,
    y: 240 - data[index][field] * 85,
  });

  return (
    <VisualFrame
      icon={<Activity size={18} aria-hidden />}
      metrics={[
        ["process noise", processNoise.toFixed(2)],
        ["measurement noise", measurementNoise.toFixed(2)],
        ["last estimate", data[data.length - 1]?.estimate.toFixed(2) ?? "0"],
      ]}
      title="1D Kalman Filter"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="process q" max={0.2} min={0.005} onChange={setProcessNoise} step={0.005} value={processNoise} />
          <Slider label="measurement r" max={0.8} min={0.05} onChange={setMeasurementNoise} step={0.01} value={measurementNoise} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <polyline className="truth-line" points={polyline(data.map((_, i) => mapPoint(data[i].truth, i, "truth")))} />
          <polyline className="measurement-line" points={polyline(data.map((_, i) => mapPoint(data[i].measurement, i, "measurement")))} />
          <polyline className="estimate-line" points={polyline(data.map((_, i) => mapPoint(data[i].estimate, i, "estimate")))} />
        </svg>
      </div>
    </VisualFrame>
  );
}

function AiMetricsVisualizer() {
  const [tp, setTp] = useState(45);
  const [fp, setFp] = useState(8);
  const [fn, setFn] = useState(5);
  const [tn, setTn] = useState(42);
  const precision = tp / Math.max(1, tp + fp);
  const recall = tp / Math.max(1, tp + fn);
  const f1 = (2 * precision * recall) / Math.max(0.001, precision + recall);
  const accuracy = (tp + tn) / Math.max(1, tp + tn + fp + fn);

  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["accuracy", accuracy.toFixed(3)],
        ["precision", precision.toFixed(3)],
        ["recall", recall.toFixed(3)],
        ["F1", f1.toFixed(3)],
      ]}
      title="Confusion Matrix"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="TP" max={100} min={0} onChange={setTp} step={1} value={tp} />
          <Slider label="FP" max={100} min={0} onChange={setFp} step={1} value={fp} />
          <Slider label="FN" max={100} min={0} onChange={setFn} step={1} value={fn} />
          <Slider label="TN" max={100} min={0} onChange={setTn} step={1} value={tn} />
        </div>
        <div className="confusion-grid">
          <div className="matrix-cell good">
            <span>TP</span>
            <strong>{tp}</strong>
          </div>
          <div className="matrix-cell warn">
            <span>FP</span>
            <strong>{fp}</strong>
          </div>
          <div className="matrix-cell warn">
            <span>FN</span>
            <strong>{fn}</strong>
          </div>
          <div className="matrix-cell good">
            <span>TN</span>
            <strong>{tn}</strong>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

function LatencyVisualizer() {
  const [base, setBase] = useState(22);
  const [jitter, setJitter] = useState(6);
  const [deadline, setDeadline] = useState(33);
  const values = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) =>
        Math.max(1, base + Math.sin(i * 1.37) * jitter + Math.sin(i * 3.11) * jitter * 0.35),
      ),
    [base, jitter],
  );
  const misses = values.filter((value) => value > deadline).length;
  const max = Math.max(deadline, ...values) + 8;

  return (
    <VisualFrame
      icon={<LineChart size={18} aria-hidden />}
      metrics={[
        ["mean", `${(values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)} ms`],
        ["max", `${Math.max(...values).toFixed(1)} ms`],
        ["deadline miss", `${misses}/${values.length}`],
      ]}
      title="Loop Latency"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="base" max={45} min={5} onChange={setBase} step={1} suffix=" ms" value={base} />
          <Slider label="jitter" max={20} min={0} onChange={setJitter} step={1} suffix=" ms" value={jitter} />
          <Slider label="deadline" max={60} min={10} onChange={setDeadline} step={1} suffix=" ms" value={deadline} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <line className="deadline-line" x1="25" x2="405" y1={250 - (deadline / max) * 210} y2={250 - (deadline / max) * 210} />
          {values.map((value, index) => {
            const barHeight = (value / max) * 210;
            return (
              <rect
                className={value > deadline ? "bar is-miss" : "bar"}
                height={barHeight}
                key={`${value}-${index}`}
                width="6"
                x={28 + index * 9}
                y={250 - barHeight}
              />
            );
          })}
        </svg>
      </div>
    </VisualFrame>
  );
}

function SweepVisualizer() {
  const [noise, setNoise] = useState(0.08);
  const [limit, setLimit] = useState(1.0);
  const points = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const param = 0.2 + i * 0.08;
        const metric = 0.12 + Math.pow(param - limit, 2) * 0.7 + Math.abs(Math.sin(i * 1.9)) * noise;
        return { param, metric };
      }),
    [limit, noise],
  );
  const maxMetric = Math.max(...points.map((point) => point.metric));
  const screen = points.map((point) => ({
    x: 35 + ((point.param - 0.2) / 2.0) * 360,
    y: 245 - (point.metric / maxMetric) * 205,
  }));
  const best = points.reduce((a, b) => (a.metric < b.metric ? a : b));

  return (
    <VisualFrame
      icon={<LineChart size={18} aria-hidden />}
      metrics={[
        ["best param", best.param.toFixed(2)],
        ["best metric", best.metric.toFixed(3)],
        ["runs", String(points.length)],
      ]}
      title="Parameter Sweep"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="noise" max={0.3} min={0} onChange={setNoise} step={0.01} value={noise} />
          <Slider label="target region" max={1.8} min={0.4} onChange={setLimit} step={0.05} value={limit} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <line className="axis" x1="25" x2="405" y1="245" y2="245" />
          <line className="axis" x1="35" x2="35" y1="25" y2="250" />
          <polyline className="estimate-line" points={polyline(screen)} />
          {screen.map((point, index) => (
            <circle className="point result small" cx={point.x} cy={point.y} key={index} r="3" />
          ))}
        </svg>
      </div>
    </VisualFrame>
  );
}

function ParticleFilterVisualizer() {
  const [count, setCount] = useState(120);
  const [noise, setNoise] = useState(0.45);
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const phase = i * 12.9898;
        const spread = noise * (Math.sin(phase) + 0.45 * Math.sin(phase * 2.1));
        const x = 1.1 + spread;
        const weight = Math.exp(-0.5 * Math.pow((1.2 - x) / Math.max(0.08, noise), 2));
        return { x, weight };
      }),
    [count, noise],
  );
  const weightSum = particles.reduce((sum, p) => sum + p.weight, 0);
  const estimate = particles.reduce((sum, p) => sum + p.x * p.weight, 0) / Math.max(weightSum, 1e-9);
  const neff = Math.pow(weightSum, 2) / Math.max(1e-9, particles.reduce((sum, p) => sum + p.weight * p.weight, 0));
  return (
    <VisualFrame icon={<Activity size={18} aria-hidden />} metrics={[["estimate", estimate.toFixed(2)], ["N_eff", neff.toFixed(0)], ["particles", String(count)]]} title="Particle Filter SIR">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="particles" max={500} min={40} onChange={setCount} step={10} value={count} />
          <Slider label="measurement noise" max={1.2} min={0.1} onChange={setNoise} step={0.05} value={noise} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <line className="axis" x1="25" x2="405" y1="220" y2="220" />
          <line className="deadline-line" x1={25 + 1.2 * 150} x2={25 + 1.2 * 150} y1="35" y2="238" />
          {particles.map((p, i) => (
            <circle className="point result small" cx={25 + p.x * 150} cy={220 - Math.min(120, p.weight * 120)} key={i} r={1.5 + Math.min(4, p.weight * 5)} />
          ))}
          <text x={25 + estimate * 150} y="34">estimate</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function MPCHorizonVisualizer() {
  const [horizon, setHorizon] = useState(5);
  const [rWeight, setRWeight] = useState(0.4);
  const path = useMemo(() => {
    let x = 0;
    return Array.from({ length: horizon + 1 }, (_, i) => {
      if (i > 0) x += Math.max(0.15, 0.35 - rWeight * 0.06);
      return { x: i, y: Math.min(1, x) };
    });
  }, [horizon, rWeight]);
  const screen = path.map((p) => ({ x: 35 + p.x * (360 / Math.max(1, horizon)), y: 235 - p.y * 170 }));
  return (
    <VisualFrame icon={<LineChart size={18} aria-hidden />} metrics={[["horizon", `${horizon} steps`], ["R weight", rWeight.toFixed(2)], ["terminal x", path[path.length - 1].y.toFixed(2)]]} title="MPC Prediction Horizon">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="horizon" max={10} min={1} onChange={setHorizon} step={1} value={horizon} />
          <Slider label="input penalty R" max={3} min={0} onChange={setRWeight} step={0.05} value={rWeight} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <line className="axis" x1="25" x2="405" y1="235" y2="235" />
          <line className="deadline-line" x1="25" x2="405" y1="65" y2="65" />
          <polyline className="estimate-line" points={polyline(screen)} />
          {screen.map((p, i) => <circle className="point result small" cx={p.x} cy={p.y} key={i} r="4" />)}
          <text x="30" y="58">reference</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function TrajectoryProfileVisualizer() {
  const [duration, setDuration] = useState(2);
  const [distance, setDistance] = useState(1);
  const data = useMemo(() => {
    const T = duration;
    return Array.from({ length: 80 }, (_, i) => {
      const t = (i / 79) * T;
      const s = t / T;
      const q = distance * (10 * s ** 3 - 15 * s ** 4 + 6 * s ** 5);
      const v = (distance / T) * (30 * s ** 2 - 60 * s ** 3 + 30 * s ** 4);
      return { q, v };
    });
  }, [distance, duration]);
  const qLine = data.map((p, i) => ({ x: 30 + i * 4.8, y: 235 - (p.q / Math.max(distance, 0.1)) * 150 }));
  const maxV = Math.max(...data.map((p) => p.v));
  const vLine = data.map((p, i) => ({ x: 30 + i * 4.8, y: 235 - (p.v / Math.max(maxV, 0.01)) * 110 }));
  return (
    <VisualFrame icon={<LineChart size={18} aria-hidden />} metrics={[["duration", `${duration.toFixed(1)} s`], ["distance", distance.toFixed(2)], ["peak velocity", maxV.toFixed(2)]]} title="Quintic Trajectory Profile">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="duration" max={5} min={0.5} onChange={setDuration} step={0.1} suffix=" s" value={duration} />
          <Slider label="distance" max={3} min={0.1} onChange={setDistance} step={0.1} value={distance} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <polyline className="estimate-line" points={polyline(qLine)} />
          <polyline className="measurement-line" points={polyline(vLine)} />
          <text x="32" y="34">q(t) solid · qdot dashed</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function CNNFeatureMapVisualizer() {
  const [stride, setStride] = useState(1);
  const [threshold, setThreshold] = useState(0.45);
  const size = stride === 1 ? 6 : 4;
  return (
    <VisualFrame icon={<Grid3X3 size={18} aria-hidden />} metrics={[["stride", String(stride)], ["feature map", `${size} x ${size}`], ["threshold", threshold.toFixed(2)]]} title="CNN Feature Map">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="stride" max={3} min={1} onChange={setStride} step={1} value={stride} />
          <Slider label="activation threshold" max={0.9} min={0.1} onChange={setThreshold} step={0.05} value={threshold} />
        </div>
        <div className="grid-visual" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
          {Array.from({ length: size * size }, (_, i) => {
            const value = Math.abs(Math.sin(i * 1.7));
            return <div className={value > threshold ? "grid-cell is-path" : "grid-cell"} key={i} style={{ opacity: 0.45 + value * 0.55 }} />;
          })}
        </div>
      </div>
    </VisualFrame>
  );
}

function RLRewardVisualizer() {
  const [epsilon, setEpsilon] = useState(0.25);
  const [gamma, setGamma] = useState(0.95);
  const rewards = useMemo(
    () => Array.from({ length: 36 }, (_, i) => Math.min(1, 0.12 + (1 - Math.exp(-i / (7 + epsilon * 20))) * gamma)),
    [epsilon, gamma],
  );
  return (
    <VisualFrame icon={<Activity size={18} aria-hidden />} metrics={[["epsilon", epsilon.toFixed(2)], ["gamma", gamma.toFixed(2)], ["last reward", rewards[rewards.length - 1].toFixed(2)]]} title="RL Reward Curve">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="epsilon" max={1} min={0} onChange={setEpsilon} step={0.05} value={epsilon} />
          <Slider label="gamma" max={0.99} min={0.1} onChange={setGamma} step={0.01} value={gamma} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          {rewards.map((reward, i) => <rect className="bar" height={reward * 190} key={i} width="7" x={30 + i * 10} y={235 - reward * 190} />)}
        </svg>
      </div>
    </VisualFrame>
  );
}

function FFTSpectrumVisualizer() {
  const [alpha, setAlpha] = useState(0.1);
  const [freq, setFreq] = useState(30);
  const bins = [5, 10, 20, 30, 40].map((f) => ({ f, amp: f === freq ? 1 : 0.15 + Math.abs(Math.sin(f)) * 0.15 }));
  return (
    <VisualFrame icon={<LineChart size={18} aria-hidden />} metrics={[["LPF alpha", alpha.toFixed(2)], ["dominant", `${freq} Hz`], ["delay risk", alpha < 0.08 ? "high" : "ok"]]} title="FFT Spectrum and LPF">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="alpha" max={1} min={0.01} onChange={setAlpha} step={0.01} value={alpha} />
          <Slider label="noise frequency" max={40} min={5} onChange={setFreq} step={5} suffix=" Hz" value={freq} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          {bins.map((bin, i) => <rect className={bin.f === freq ? "bar is-miss" : "bar"} height={bin.amp * 180} key={bin.f} width="42" x={55 + i * 70} y={230 - bin.amp * 180} />)}
          {bins.map((bin, i) => <text key={`${bin.f}-label`} x={58 + i * 70} y="252">{bin.f}Hz</text>)}
        </svg>
      </div>
    </VisualFrame>
  );
}

function PoseGraphVisualizer() {
  const [drift, setDrift] = useState(0.45);
  const [weight, setWeight] = useState(0.7);
  const before = Array.from({ length: 7 }, (_, i) => ({ x: 45 + i * 55, y: 215 - Math.sin(i / 2) * 35 - (i / 6) * drift * 90 }));
  const after = before.map((p, i) => ({ x: p.x, y: p.y + weight * (i / 6) * drift * 90 }));
  return (
    <VisualFrame icon={<Workflow size={18} aria-hidden />} metrics={[["drift", drift.toFixed(2)], ["loop weight", weight.toFixed(2)], ["closure", `${Math.round(weight * 100)}%`]]} title="Pose Graph Loop Closure">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="drift" max={1} min={0} onChange={setDrift} step={0.05} value={drift} />
          <Slider label="loop weight" max={1} min={0} onChange={setWeight} step={0.05} value={weight} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <polyline className="measurement-line" points={polyline(before)} />
          <polyline className="estimate-line" points={polyline(after)} />
          {after.map((p, i) => <circle className="point result small" cx={p.x} cy={p.y} key={i} r="4" />)}
        </svg>
      </div>
    </VisualFrame>
  );
}

function DWAVisualizer() {
  const [clearanceWeight, setClearanceWeight] = useState(1);
  const [velocityWeight, setVelocityWeight] = useState(0.2);
  const candidates = Array.from({ length: 30 }, (_, i) => {
    const v = (i % 10) / 10;
    const w = Math.floor(i / 10) - 1;
    const clearance = Math.abs(Math.sin(i * 1.4));
    const score = clearanceWeight * clearance + velocityWeight * v - Math.abs(w) * 0.1;
    return { v, w, clearance, score };
  });
  const best = candidates.reduce((a, b) => (a.score > b.score ? a : b));
  return (
    <VisualFrame icon={<Gauge size={18} aria-hidden />} metrics={[["best v", best.v.toFixed(2)], ["best w", best.w.toFixed(0)], ["clearance", best.clearance.toFixed(2)]]} title="DWA Velocity Space">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="clearance weight" max={5} min={0} onChange={setClearanceWeight} step={0.1} value={clearanceWeight} />
          <Slider label="velocity weight" max={2} min={0} onChange={setVelocityWeight} step={0.05} value={velocityWeight} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          {candidates.map((c, i) => (
            <circle className={c === best ? "point target" : c.clearance < 0.25 ? "point original" : "point result"} cx={45 + c.v * 330} cy={140 - c.w * 70} key={i} r={c === best ? 8 : 5} />
          ))}
          <text x="36" y="28">x: linear velocity · y: angular velocity</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function CameraProjectionVisualizer() {
  const [depth, setDepth] = useState(2);
  const [fx, setFx] = useState(400);
  const u = fx * 0.4 / depth + 210;
  return (
    <VisualFrame icon={<Crosshair size={18} aria-hidden />} metrics={[["depth", `${depth.toFixed(1)} m`], ["fx", fx.toFixed(0)], ["pixel u", u.toFixed(1)]]} title="Pinhole Camera Projection">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="depth Z" max={5} min={0.5} onChange={setDepth} step={0.1} value={depth} />
          <Slider label="focal fx" max={900} min={100} onChange={setFx} step={10} value={fx} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <line className="axis" x1="55" x2="210" y1="220" y2="140" />
          <line className="axis" x1="55" x2={u} y1="220" y2="92" />
          <rect className="workspace-ring" height="170" width="160" x="210" y="55" />
          <circle className="point target" cx={u} cy="92" r="7" />
          <text x="65" y="236">camera</text>
          <text x={u + 8} y="88">pixel</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function SegmentationMaskVisualizer() {
  const [threshold, setThreshold] = useState(0.5);
  const cells = Array.from({ length: 48 }, (_, i) => Math.abs(Math.sin(i * 0.9)) > threshold);
  const iou = cells.filter(Boolean).length / 32;
  return (
    <VisualFrame icon={<Grid3X3 size={18} aria-hidden />} metrics={[["threshold", threshold.toFixed(2)], ["mask pixels", String(cells.filter(Boolean).length)], ["IoU proxy", Math.min(1, iou).toFixed(2)]]} title="Segmentation Mask">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="mask threshold" max={0.9} min={0.1} onChange={setThreshold} step={0.05} value={threshold} />
        </div>
        <div className="grid-visual" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
          {cells.map((on, i) => <div className={on ? "grid-cell is-path" : "grid-cell"} key={i} />)}
        </div>
      </div>
    </VisualFrame>
  );
}

function VLAArchitectureVisualizer() {
  const [vision, setVision] = useState(0.55);
  const [language, setLanguage] = useState(0.45);
  const confidence = Math.min(1, 0.35 + 0.4 * vision + 0.35 * language);
  const nodes = [["Vision", vision.toFixed(2)], ["Language", language.toFixed(2)], ["Fusion", confidence.toFixed(2)], ["Action", confidence > 0.72 ? "execute" : "ask/stop"]];
  return (
    <VisualFrame icon={<Workflow size={18} aria-hidden />} metrics={[["vision", vision.toFixed(2)], ["language", language.toFixed(2)], ["policy confidence", confidence.toFixed(2)]]} title="VLA Architecture">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="vision weight" max={1} min={0} onChange={setVision} step={0.05} value={vision} />
          <Slider label="language weight" max={1} min={0} onChange={setLanguage} step={0.05} value={language} />
        </div>
        <div className="flow-visual">{nodes.map(([label, value]) => <div className="flow-step" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      </div>
    </VisualFrame>
  );
}

function WorldModelVisualizer() {
  const [horizon, setHorizon] = useState(6);
  const [error, setError] = useState(0.1);
  const pts = Array.from({ length: horizon + 1 }, (_, i) => ({ x: 35 + i * (360 / horizon), y: 220 - (Math.exp(-i / 4) - error * i * 0.04) * 150 }));
  return (
    <VisualFrame icon={<LineChart size={18} aria-hidden />} metrics={[["horizon", String(horizon)], ["model error", error.toFixed(2)], ["uncertainty", (error * horizon).toFixed(2)]]} title="World Model Rollout">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="horizon" max={20} min={1} onChange={setHorizon} step={1} value={horizon} />
          <Slider label="model error" max={1} min={0} onChange={setError} step={0.05} value={error} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280"><polyline className="estimate-line" points={polyline(pts)} /></svg>
      </div>
    </VisualFrame>
  );
}

function LyapunovEnergyVisualizer() {
  const [damping, setDamping] = useState(1);
  const [stiffness, setStiffness] = useState(4);
  const vdot = -damping;
  return (
    <VisualFrame icon={<Sigma size={18} aria-hidden />} metrics={[["stiffness", stiffness.toFixed(1)], ["damping", damping.toFixed(1)], ["Vdot sign", vdot <= 0 ? "non-positive" : "positive"]]} title="Lyapunov Energy">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="damping" max={5} min={-2} onChange={setDamping} step={0.1} value={damping} />
          <Slider label="stiffness" max={10} min={0.1} onChange={setStiffness} step={0.1} value={stiffness} />
          {damping < 0 && <div className="singularity-banner">Vdot이 양수라 에너지가 증가한다.</div>}
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          {Array.from({ length: 9 }, (_, i) => <ellipse className="workspace-ring" cx="215" cy="140" key={i} rx={20 + i * stiffness * 5} ry={12 + i * 10} />)}
        </svg>
      </div>
    </VisualFrame>
  );
}

function SensorFusionVisualizer() {
  const [alpha, setAlpha] = useState(0.8);
  const [gpsNoise, setGpsNoise] = useState(1);
  const data = useMemo(() => {
    let estimate = 0;
    return Array.from({ length: 36 }, (_, i) => {
      const truth = i * 0.07;
      const gps = truth + Math.sin(i * 1.6) * gpsNoise * 0.08;
      estimate = alpha * (estimate + 0.07) + (1 - alpha) * gps;
      return { truth, gps, estimate };
    });
  }, [alpha, gpsNoise]);
  const map = (field: "truth" | "gps" | "estimate") => data.map((p, i) => ({ x: 30 + i * 10.5, y: 230 - p[field] * 80 }));
  return (
    <VisualFrame icon={<Activity size={18} aria-hidden />} metrics={[["alpha", alpha.toFixed(2)], ["gps noise", gpsNoise.toFixed(1)], ["estimate", data[data.length - 1].estimate.toFixed(2)]]} title="GPS + IMU Sensor Fusion">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="IMU prediction weight" max={1} min={0} onChange={setAlpha} step={0.05} value={alpha} />
          <Slider label="GPS noise" max={5} min={0} onChange={setGpsNoise} step={0.1} value={gpsNoise} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 430 280">
          <polyline className="truth-line" points={polyline(map("truth"))} />
          <polyline className="measurement-line" points={polyline(map("gps"))} />
          <polyline className="estimate-line" points={polyline(map("estimate"))} />
        </svg>
      </div>
    </VisualFrame>
  );
}

function ROS2LoopVisualizer() {
  const [age, setAge] = useState(30);
  const [command, setCommand] = useState(0.5);
  const stale = age > 200;
  const saturated = Math.abs(command) > 1;
  return (
    <VisualFrame icon={<Workflow size={18} aria-hidden />} metrics={[["sensor age", `${age} ms`], ["command", command.toFixed(2)], ["gate", stale || saturated ? "stop" : "publish"]]} title="ROS2 Subscriber-Control-Publisher Loop">
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="sensor age" max={1000} min={0} onChange={setAge} step={10} suffix=" ms" value={age} />
          <Slider label="raw command" max={2} min={-2} onChange={setCommand} step={0.05} value={command} />
          {(stale || saturated) && <div className="singularity-banner">Safety gate blocks publish.</div>}
        </div>
        <div className="flow-visual">
          {["Subscriber", "State cache", "Safety gate", stale || saturated ? "Stop cmd" : "Publisher"].map((label) => <div className="flow-step" key={label}><span>{label}</span><strong>{label.includes("Stop") ? "safe" : "ok"}</strong></div>)}
        </div>
      </div>
    </VisualFrame>
  );
}

function EmptyVisualizer({ section }: { section?: LessonSection }) {
  const figures = Array.from(
    new Map((section?.theory.flatMap((u) => u.figures) ?? []).map((figure) => [figure.id, figure])).values(),
  );
  const links = [
    ["rotation-basis", "선형대수 회전행렬 시각화"],
    ["gaussian-kf", "Kalman Filter 시각화"],
    ["trajectory-polynomial", "로봇팔/trajectory 시각화"],
    ["astar-cost", "A* / Pure Pursuit 시각화"],
    ["confusion-matrix", "AI metric 시각화"],
    ["retrieval-pipeline", "Retrieval flow 시각화"],
    ["state-machine", "Latency / safety 상태 흐름 시각화"],
  ].filter(([id]) => section?.graphIds?.includes(id as TheoryGraphId));
  return (
    <section className="panel visual-panel">
      <div className="panel-heading">
        <Activity size={18} aria-hidden />
        <h2>시각화</h2>
      </div>
      {figures.length > 0 ? (
        <>
          <p className="lead">이 섹션의 개념 그래프를 시각적으로 확인하세요.</p>
          <div className="mini-graph-grid">
            {figures.map((figure) => (
              <MiniGraph figure={figure} key={figure.id} />
            ))}
          </div>
          {links.length > 0 && (
            <div className="visual-crosslinks">
              {links.map(([id, label]) => (
                <span key={id}>{label}</span>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="lead">이 섹션은 이론, 코드 실습, 체크리스트 중심으로 진행합니다.</p>
      )}
    </section>
  );
}

function VisualizationSpecInteractiveCard({ spec }: { spec: VisualizationSpec }) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(spec.parameters.map((parameter) => [parameter.name, parameter.default])),
  );
  const metrics = useMemo(() => {
    const normalized = spec.parameters.map((parameter) => {
      const span = Math.max(1e-9, parameter.max - parameter.min);
      const value = values[parameter.name] ?? parameter.default;
      const defaultRatio = (parameter.default - parameter.min) / span;
      const valueRatio = (value - parameter.min) / span;
      return Math.min(1, Math.abs(valueRatio - defaultRatio) * 2);
    });
    const stress = normalized.reduce((sum, value) => sum + value, 0) / Math.max(1, normalized.length);
    const margin = values.safety_margin ?? 0.5;
    return {
      stress,
      margin,
      status: stress <= margin ? "정상" : "실패 경계",
    };
  }, [spec.parameters, values]);

  return (
    <div className="cheat-card visualization-spec-card">
      <span>개념 태그 · {spec.conceptTag}</span>
      <strong>{spec.title}</strong>
      <code>{spec.connectedEquation}</code>
      <small>연결 코드랩: {spec.connectedCodeLab}</small>
      <div className="spec-interactive-grid">
        <div className="control-stack spec-control-stack">
          {spec.parameters.map((parameter) => (
            <Slider
              key={`${spec.id}-${parameter.name}`}
              label={parameter.name}
              max={parameter.max}
              min={parameter.min}
              onChange={(value) => setValues((current) => ({ ...current, [parameter.name]: value }))}
              step={Math.max((parameter.max - parameter.min) / 100, 0.001)}
              value={values[parameter.name] ?? parameter.default}
            />
          ))}
        </div>
        <svg className="plot spec-plot" role="img" viewBox="0 0 360 180">
          <line className="axis" x1="40" x2="330" y1="140" y2="140" />
          <line className="axis" x1="40" x2="40" y1="24" y2="150" />
          <rect className="bar-primary" height={metrics.stress * 96} width="70" x="86" y={140 - metrics.stress * 96} />
          <rect className={metrics.status === "정상" ? "bar-secondary" : "bar-alert"} height={metrics.margin * 96} width="70" x="204" y={140 - metrics.margin * 96} />
          <line className="threshold-line" x1="54" x2="318" y1={140 - metrics.margin * 96} y2={140 - metrics.margin * 96} />
          <text x="82" y="162">stress</text>
          <text x="202" y="162">margin</text>
        </svg>
      </div>
      <div className={metrics.status === "정상" ? "spec-status" : "spec-status is-alert"}>
        <strong>{metrics.status}</strong>
        <small>stress {metrics.stress.toFixed(2)} · margin {metrics.margin.toFixed(2)}</small>
      </div>
      <div className="parameter-table compact-table">
        {spec.parameters.map((parameter) => (
          <div className="parameter-row" key={`${spec.id}-${parameter.name}`}>
            <span>{parameter.name}</span>
            <span>{parameter.symbol}={values[parameter.name]?.toFixed(3) ?? parameter.default}</span>
            <span>{parameter.description}</span>
          </div>
        ))}
      </div>
      <small>정상: {spec.normalCase}</small>
      <small>실패: {spec.failureCase}</small>
    </div>
  );
}

function VisualizationSpecCards({ section, availableIds }: { section: LessonSection, availableIds: string[] }) {
  const specs = section.v2Session?.visualizations ?? [];
  const implementedSpecs = specs.filter(spec => availableIds.includes(spec.id));
  if (implementedSpecs.length === 0) return null;
  return (
    <section className="panel visual-panel">
      <div className="panel-heading">
        <Workflow size={18} aria-hidden />
        <h2>시각화 연결 정보</h2>
      </div>
      <div className="cheat-grid">
        {implementedSpecs.map((spec) => <VisualizationSpecInteractiveCard key={spec.id} spec={spec} />)}
      </div>
    </section>
  );
}

function OpenCVThresholdVisualizer() {
  const [threshold, setThreshold] = useState(127);
  const [noise, setNoise] = useState(0.05);
  const rectIntensity = 210;
  const bgIntensity = Math.round(noise * 180);
  const foreground = rectIntensity > threshold ? 1 : 0;
  const noiseHits = bgIntensity > threshold ? 18 : Math.round(noise * 8);
  const bboxVisible = foreground === 1;
  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["foreground", bboxVisible ? "1 contour" : "0 contours"],
        ["noise hits", String(noiseHits)],
        ["bbox", bboxVisible ? "(40,30,61,51)" : "-"],
      ]}
      title="OpenCV Threshold / Contour"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="threshold" max={255} min={0} onChange={setThreshold} step={1} value={threshold} />
          <Slider label="noise" max={0.5} min={0} onChange={setNoise} step={0.01} value={noise} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 420 250">
          <rect className="workspace-ring" height="170" width="260" x="80" y="40" />
          {Array.from({ length: noiseHits }).map((_, index) => (
            <circle className="workspace-sample" cx={95 + (index * 37) % 220} cy={55 + (index * 53) % 140} key={index} r="2.5" />
          ))}
          <rect className={bboxVisible ? "heat-cell active" : "heat-cell"} height="82" width="100" x="160" y="82" />
          {bboxVisible && <rect className="selection-box" height="82" width="100" x="160" y="82" />}
          <text x="154" y="190">binary mask → contour → bbox</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function PoseEstimationVisualizer() {
  const [noise, setNoise] = useState(1);
  const [depth, setDepth] = useState(1);
  const scale = 72 / depth;
  const reprojection = Math.max(0.1, noise * 0.8 + Math.abs(depth - 1) * 1.2);
  return (
    <VisualFrame
      icon={<Crosshair size={18} aria-hidden />}
      metrics={[
        ["depth", `${depth.toFixed(2)} m`],
        ["reprojection", `${reprojection.toFixed(2)} px`],
        ["pose", reprojection < 3 ? "usable" : "reject"],
      ]}
      title="PnP 6D Pose"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="pixel noise" max={5} min={0} onChange={setNoise} step={0.1} suffix=" px" value={noise} />
          <Slider label="depth Z" max={2} min={0.4} onChange={setDepth} step={0.05} suffix=" m" value={depth} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 420 250">
          <line className="axis" x1="70" x2="350" y1="200" y2="200" />
          <line className="axis" x1="210" x2="210" y1="30" y2="220" />
          <polygon className="uncertainty-fill" points={`${210 - scale},${125 - scale} ${210 + scale},${125 - scale} ${210 + scale},${125 + scale} ${210 - scale},${125 + scale}`} />
          <polygon className="path-line" points={`${210 - scale + noise},${125 - scale - noise} ${210 + scale - noise},${125 - scale + noise} ${210 + scale + noise},${125 + scale - noise} ${210 - scale - noise},${125 + scale + noise}`} />
          <line className="velocity-arrow" x1="210" x2={210 + 45 / depth} y1="125" y2="95" />
          <text x="230" y="92">R,t</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function DepthMapVisualizer() {
  const [disparity, setDisparity] = useState(50);
  const [baselineCm, setBaselineCm] = useState(10);
  const z = (500 * (baselineCm / 100)) / Math.max(1e-6, disparity);
  return (
    <VisualFrame
      icon={<Activity size={18} aria-hidden />}
      metrics={[
        ["Z", `${z.toFixed(2)} m`],
        ["baseline", `${baselineCm.toFixed(0)} cm`],
        ["valid", disparity > 5 ? "yes" : "near infinity"],
      ]}
      title="Stereo Depth Map"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="disparity" max={100} min={5} onChange={setDisparity} step={1} suffix=" px" value={disparity} />
          <Slider label="baseline" max={20} min={3} onChange={setBaselineCm} step={1} suffix=" cm" value={baselineCm} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 420 250">
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 8 }).map((__, col) => {
              const shade = Math.max(20, Math.min(90, 110 - z * 20 - row * 4 + col * 2));
              return <rect fill={`hsl(205 70% ${shade}%)`} height="28" key={`${row}-${col}`} width="32" x={82 + col * 34} y={48 + row * 30} />;
            }),
          )}
          <text x="128" y="220">Z = fB / d · smaller d means farther depth</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function BackpropChainVisualizer() {
  const [gate, setGate] = useState(1);
  const [error, setError] = useState(-0.75);
  const gradOut = 2 * error;
  const gradHidden = gradOut * gate;
  const nodes = [
    ["x", "input"],
    ["W1", `grad ${gradHidden.toFixed(2)}`],
    ["ReLU", `gate ${gate.toFixed(2)}`],
    ["W2", `grad ${gradOut.toFixed(2)}`],
    ["L", `err ${error.toFixed(2)}`],
  ];
  return (
    <VisualFrame
      icon={<Workflow size={18} aria-hidden />}
      metrics={[
        ["dL/dy", gradOut.toFixed(2)],
        ["dL/dW1 scale", gradHidden.toFixed(2)],
        ["status", Math.abs(gradHidden) < 0.05 ? "dead gradient" : "flowing"],
      ]}
      title="Backprop Chain Rule"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="ReLU gate" max={1} min={0} onChange={setGate} step={0.05} value={gate} />
          <Slider label="output error" max={2} min={-2} onChange={setError} step={0.05} value={error} />
        </div>
        <div className="flow-visual">
          {nodes.map(([label, value], index) => (
            <div className="flow-step-wrap" key={label}>
              <div className="flow-step">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
              {index < nodes.length - 1 && <div className="flow-arrow">←</div>}
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  );
}

function SVDJacobianVisualizer() {
  const [q2, setQ2] = useState(10);
  const [damping, setDamping] = useState(0.1);
  const q = (q2 * Math.PI) / 180;
  const sigmaMin = Math.max(0.001, Math.abs(Math.sin(q)) * 0.45);
  const sigmaMax = 1.6 + 0.2 * Math.cos(q);
  const condition = sigmaMax / sigmaMin;
  const dampedGain = sigmaMin / (sigmaMin * sigmaMin + damping * damping);
  return (
    <VisualFrame
      icon={<Sigma size={18} aria-hidden />}
      metrics={[
        ["sigma max", sigmaMax.toFixed(2)],
        ["sigma min", sigmaMin.toFixed(3)],
        ["condition", condition.toFixed(1)],
        ["DLS gain", dampedGain.toFixed(2)],
      ]}
      title="SVD Jacobian Spectrum"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="q2" max={180} min={-180} onChange={setQ2} step={1} suffix="°" value={q2} />
          <Slider label="damping" max={0.5} min={0} onChange={setDamping} step={0.01} value={damping} />
        </div>
        <svg className="plot" role="img" viewBox="0 0 420 250">
          <rect className="bar-primary" height={sigmaMax * 70} width="70" x="135" y={205 - sigmaMax * 70} />
          <rect className="bar-secondary" height={sigmaMin * 260} width="70" x="230" y={205 - sigmaMin * 260} />
          <line className="axis" x1="100" x2="330" y1="205" y2="205" />
          <text x="148" y="225">σmax</text>
          <text x="244" y="225">σmin</text>
        </svg>
      </div>
    </VisualFrame>
  );
}

function FoundationModelVisualizer() {
  const [confidence, setConfidence] = useState(0.8);
  const [actionNorm, setActionNorm] = useState(0.02);
  const blocked = confidence < 0.55 || actionNorm > 0.08;
  const nodes = [
    ["Vision", "image tokens"],
    ["Language", "task tokens"],
    ["RFM", "action token"],
    ["Safety", blocked ? "stop" : "pass"],
    ["ROS2", blocked ? "hold" : "execute"],
  ];
  return (
    <VisualFrame
      icon={<Workflow size={18} aria-hidden />}
      metrics={[
        ["confidence", confidence.toFixed(2)],
        ["action norm", `${actionNorm.toFixed(3)} m`],
        ["decision", blocked ? "blocked" : "execute"],
      ]}
      title="Robot Foundation Model Pipeline"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="confidence" max={1} min={0} onChange={setConfidence} step={0.01} value={confidence} />
          <Slider label="action norm" max={0.2} min={0} onChange={setActionNorm} step={0.005} suffix=" m" value={actionNorm} />
        </div>
        <div className="flow-visual">
          {nodes.map(([label, value], index) => (
            <div className="flow-step-wrap" key={label}>
              <div className={label === "Safety" && blocked ? "flow-step is-alert" : "flow-step"}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
              {index < nodes.length - 1 && <div className="flow-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  );
}

export function VisualizerHub({ id, section }: VisualizerHubProps) {
  if (!id) return <EmptyVisualizer section={section} />;
  const visualizers: Record<VisualizerId, ReactNode> = {
    "linear-algebra": <LinearAlgebraVisualizer />,
    kalman: <KalmanVisualizer />,
    manipulator: <ManipulatorVisualizer />,
    "matrix-grid": <MatrixGridVisualizer />,
    "jacobian-singularity": <ManipulatorVisualizer />,
    "mobile-odom": (
      <div className="visual-stack">
        <MobileOdomVisualizer />
        <KalmanVisualizer />
      </div>
    ),
    astar: <AStarVisualizer />,
    "pure-pursuit": <PurePursuitVisualizer />,
    "bicycle-stanley": <BicycleStanleyVisualizer />,
    "ai-metrics": <AiMetricsVisualizer />,
    latency: <LatencyVisualizer />,
    sweep: <SweepVisualizer />,
    "retrieval-flow": <RetrievalFlowVisualizer />,
    "physical-ai-flow": <PhysicalAIFlowVisualizer />,
    "dynamics-torque": <DynamicsTorqueVisualizer />,
    "ekf-covariance": <EKFCovarianceVisualizer />,
    "sim2real-gap": <Sim2RealGapVisualizer />,
    "so3-rotation": <SO3RotationVisualizer />,
    "quaternion-slerp": <QuaternionSlerpVisualizer />,
    "pid-step-response": <PIDStepResponseVisualizer />,
    "particle-filter": <ParticleFilterVisualizer />,
    "mpc-horizon": <MPCHorizonVisualizer />,
    "trajectory-profile": <TrajectoryProfileVisualizer />,
    "cnn-feature-map": <CNNFeatureMapVisualizer />,
    "rl-reward": <RLRewardVisualizer />,
    "fft-spectrum": <FFTSpectrumVisualizer />,
    "pose-graph": <PoseGraphVisualizer />,
    "dwa-velocity": <DWAVisualizer />,
    "camera-projection": <CameraProjectionVisualizer />,
    "segmentation-mask": <SegmentationMaskVisualizer />,
    "vla-architecture": <VLAArchitectureVisualizer />,
    "world-model": <WorldModelVisualizer />,
    "lyapunov-energy": <LyapunovEnergyVisualizer />,
    "sensor-fusion": <SensorFusionVisualizer />,
    "ros2-loop": <ROS2LoopVisualizer />,
    "robot-arm-3d": <ThreeRobotArmVisualizer />,
    "opencv-threshold": <OpenCVThresholdVisualizer />,
    "pose-estimation": <PoseEstimationVisualizer />,
    "depth-map": <DepthMapVisualizer />,
    "backprop-chain": <BackpropChainVisualizer />,
    "svd-jacobian": <SVDJacobianVisualizer />,
    "foundation-model": <FoundationModelVisualizer />,
    "cross-product-3d": <CrossProduct3DVisualizer />,
    "loss-landscape": <LossLandscapeVisualizer />,
    "bayes-gaussian": <GaussianBayesVisualizer />,
    "ode-finite-diff": <OdeFiniteDiffVisualizer />,
    "prompt-eval-harness": <RetrievalFlowVisualizer />,
  };
  const visualizer = visualizers[id];
  if (section?.v2Session) {
    return (
      <div className="visual-stack">
        {visualizer}
        <VisualizationSpecCards section={section} availableIds={Object.keys(visualizers)} />
      </div>
    );
  }
  return visualizer;
}
