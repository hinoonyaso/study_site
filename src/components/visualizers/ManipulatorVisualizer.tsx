import { useState, useEffect, useMemo, type MouseEvent } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function ManipulatorVisualizer() {
  const [q1, setQ1] = useState(35);
  const [q2, setQ2] = useState(55);
  const [q3, setQ3] = useState(-25);
  const [targetX, setTargetX] = useState(1.0);
  const [targetY, setTargetY] = useState(0.8);
  const [damping, setDamping] = useState(0.08);
  const [ikStepIndex, setIkStepIndex] = useState(0);
  const [isIkPlaying, setIsIkPlaying] = useState(false);
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
  const ikTrace = Array.from({ length: 10 }, (_, index) => index).reduce<Array<{ point: Point; ee: Point; error: number; q: number[] }>>((traceItems, index) => {
    const previousQ = index === 0 ? q : traceItems[traceItems.length - 1].q;
    const nextQ = index === 0 ? previousQ : dlsStep(previousQ, { x: targetX, y: targetY });
    const nextFk = fk3(nextQ);
    traceItems.push({
      point: worldToSvg(nextFk.ee, width, height, scale),
      ee: nextFk.ee,
      error: Math.hypot(targetX - nextFk.ee.x, targetY - nextFk.ee.y),
      q: nextQ,
    });
    return traceItems;
  }, []);
  const safeIkStepIndex = Math.min(ikStepIndex, ikTrace.length - 1);
  const visibleIkTrace = ikTrace.slice(0, safeIkStepIndex + 1);
  const activeIkStep = ikTrace[safeIkStepIndex];
  const finalIk = ikTrace[ikTrace.length - 1];
  const l23 = l2 + l3;
  const seedDistance = Math.max(0.001, Math.min(l1 + l23 - 0.001, targetDistance));
  const cosSeed = Math.max(-1, Math.min(1, (seedDistance * seedDistance - l1 * l1 - l23 * l23) / (2 * l1 * l23)));
  const elbowUpQ2 = Math.acos(cosSeed);
  const elbowDownQ2 = -elbowUpQ2;
  const seedQ1 = (seedQ2: number) => Math.atan2(targetY, targetX) - Math.atan2(l23 * Math.sin(seedQ2), l1 + l23 * Math.cos(seedQ2));
  useEffect(() => {
    if (!isIkPlaying) return;
    const timer = window.setInterval(() => {
      setIkStepIndex((current) => {
        if (current >= ikTrace.length - 1) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 520);
    return () => window.clearInterval(timer);
  }, [ikTrace.length, isIkPlaying]);

  useEffect(() => {
    if (ikStepIndex >= ikTrace.length - 1) setIsIkPlaying(false);
  }, [ikStepIndex, ikTrace.length]);

  useEffect(() => {
    setIkStepIndex(0);
    setIsIkPlaying(false);
  }, [damping, q1, q2, q3, targetX, targetY]);

  const T01 = planarLinkTransform(a1, l1);
  const T12 = planarLinkTransform(a2, l2);
  const T23 = planarLinkTransform(a3, l3);
  const T02 = multiplyMatrices(T01, T12);
  const T03 = multiplyMatrices(T02, T23);
  const link2Tip = { x: T02[0][2], y: T02[1][2] };
  const analyticUp = { q1: seedQ1(elbowUpQ2), q2: elbowUpQ2 };
  const analyticDown = { q1: seedQ1(elbowDownQ2), q2: elbowDownQ2 };
  const iterativeQ = activeIkStep.q;
  const toDeg = (value: number) => ((value * 180) / Math.PI).toFixed(1);
  const handlePlotClick = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * width;
    const svgY = ((event.clientY - rect.top) / rect.height) * height;
    setTargetX(Number(((svgX - width / 2) / scale).toFixed(2)));
    setTargetY(Number(((height / 2 - svgY) / scale).toFixed(2)));
  };
  const transformRows: Array<[string, Matrix]> = [
    ["T01", T01],
    ["T12", T12],
    ["T23", T23],
    ["T01 x T12 = T02", T02],
    ["T02 x T23 = T03", T03],
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
            <div className="hint-box">DLS lambda는 특이점 근처에서 q 변화량을 부드럽게 줄이는 damping입니다. 너무 작으면 튀고, 너무 크면 느리게 수렴합니다.</div>
            <button className="text-button" onClick={() => { setQ1(30); setQ2(45); setQ3(0); }} type="button">
              <Grid3X3 size={16} aria-hidden />
              FK 검사 30° / 45°
            </button>
            <div className="visual-actions">
              <button className="text-button" onClick={() => setIsIkPlaying((playing) => !playing)} type="button">
                {isIkPlaying ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
                {isIkPlaying ? "일시정지" : "재생"}
              </button>
              <button className="icon-button" onClick={() => setIkStepIndex((current) => Math.min(ikTrace.length - 1, current + 1))} type="button">
                <SkipForward size={16} aria-hidden />
              </button>
              <button className="icon-button" onClick={() => { setIsIkPlaying(false); setIkStepIndex(0); }} type="button">
                <RotateCcw size={16} aria-hidden />
              </button>
            </div>
            <div className="ik-step-readout">
              <strong>DLS/Newton step {safeIkStepIndex + 1}</strong>
              <span>ee=({activeIkStep.ee.x.toFixed(2)}, {activeIkStep.ee.y.toFixed(2)})</span>
              <span>error={activeIkStep.error.toFixed(3)}</span>
            </div>
            {isSingular && <div className="singularity-banner">singularity 근처 · manipulability ellipse가 선분으로 붕괴</div>}
            {!isReachable && <div className="singularity-banner">workspace 밖 target · DLS가 끝까지 도달하지 못함</div>}
          </div>
          <svg className="plot" onClick={handlePlotClick} role="img" style={{ cursor: "crosshair" }} viewBox={`0 0 ${width} ${height}`}>
            <circle className="workspace-ring" cx={origin.x} cy={origin.y} r={reachMax * scale} />
            <circle className="workspace-ring workspace-inner" cx={origin.x} cy={origin.y} r={Math.max(0.03, Math.abs(l1 - l2 - l3)) * scale} />
            {visibleIkTrace.map((item, index) => (
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
            <polyline className="ik-trace-line" points={polyline(visibleIkTrace.map((item) => item.point))} />
            {visibleIkTrace.map((item, index) => (
              <circle
                className={`ik-trace-dot ${index === safeIkStepIndex ? "is-active" : ""} ${item.error < 0.01 ? "is-converged" : ""}`}
                cx={item.point.x}
                cy={item.point.y}
                key={index}
                r={index === safeIkStepIndex ? 6 : 2.5 + index * 0.35}
              />
            ))}
            <circle className="joint" cx={origin.x} cy={origin.y} r="6" />
            <circle className="joint" cx={sJoint1.x} cy={sJoint1.y} r="6" />
            <circle className="joint" cx={sJoint2.x} cy={sJoint2.y} r="6" />
            <circle className="point result" cx={sEe.x} cy={sEe.y} r="6" />
            <circle className="point target" cx={sTarget.x} cy={sTarget.y} r="6" />
            <text x={sTarget.x + 8} y={sTarget.y - 8}>target</text>
            <text x="24" y="28">workspace ring</text>
            <text x="24" y="48">click plot: target, dots: replayed DLS/Newton IK steps</text>
          </svg>
        </div>
        <div className="matrix-step-grid">
          <div className="matrix-card">
            <span>2-link FK checkpoint</span>
            <code>{`theta1=${q1.toFixed(1)} deg, theta2=${q2.toFixed(1)} deg\nT02 tip=(${link2Tip.x.toFixed(3)}, ${link2Tip.y.toFixed(3)})`}</code>
          </div>
          {transformRows.map(([label, matrix]) => (
            <div className="matrix-card" key={label}>
              <span>{label}</span>
              <code>{formatMatrix(matrix)}</code>
            </div>
          ))}
        </div>
        <div className="ik-trace-summary">
          <strong>Analytic IK vs DLS/Newton iteration</strong>
          <span>analytic elbow-up seed: q1={toDeg(analyticUp.q1)}°, q2={toDeg(analyticUp.q2)}°</span>
          <span>analytic elbow-down seed: q1={toDeg(analyticDown.q1)}°, q2={toDeg(analyticDown.q2)}°</span>
          <span>DLS step {safeIkStepIndex + 1}: q=[{iterativeQ.map((value) => `${toDeg(value)}°`).join(", ")}]</span>
          <span>workspace: {isReachable ? "reachable" : "unreachable"}</span>
          {ikTrace.map((item, index) => (
            <span className={index === safeIkStepIndex ? "is-active" : ""} key={index}>Step {index + 1}: e={item.error.toFixed(3)}</span>
          ))}
        </div>
      </>
    </VisualFrame>
  );
}
