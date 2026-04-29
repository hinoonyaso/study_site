import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function MoveItPlanPreviewVisualizer() {
  const [goalX, setGoalX] = useState(1.05);
  const [goalY, setGoalY] = useState(0.62);
  const [obstacleX, setObstacleX] = useState(0.78);
  const [obstacleY, setObstacleY] = useState(0.32);
  const l1 = 0.9;
  const l2 = 0.72;
  const start = [(-35 * Math.PI) / 180, (75 * Math.PI) / 180];
  const solveIk = (x: number, y: number) => {
    const dist = Math.max(0.05, Math.min(l1 + l2 - 0.02, Math.hypot(x, y)));
    const c2 = Math.max(-1, Math.min(1, (dist * dist - l1 * l1 - l2 * l2) / (2 * l1 * l2)));
    const q2 = Math.acos(c2);
    const q1 = Math.atan2(y, x) - Math.atan2(l2 * Math.sin(q2), l1 + l2 * Math.cos(q2));
    return [q1, q2];
  };
  const goal = solveIk(goalX, goalY);
  const fk2 = (qA: number, qB: number) => {
    const joint = { x: l1 * Math.cos(qA), y: l1 * Math.sin(qA) };
    const ee = { x: joint.x + l2 * Math.cos(qA + qB), y: joint.y + l2 * Math.sin(qA + qB) };
    return { joint, ee };
  };
  const waypoints = Array.from({ length: 12 }, (_, index) => {
    const t = index / 11;
    const qA = start[0] + (goal[0] - start[0]) * t;
    const qB = start[1] + (goal[1] - start[1]) * t;
    return { t, q: [qA, qB], pose: fk2(qA, qB) };
  });
  const clearance = Math.min(...waypoints.map((point) => Math.hypot(point.pose.ee.x - obstacleX, point.pose.ee.y - obstacleY))) - 0.18;
  const width = 430;
  const height = 310;
  const scale = 92;
  const origin = worldToSvg({ x: 0, y: 0 }, width, height, scale);
  const toSvg = (point: Point) => worldToSvg(point, width, height, scale);
  const pathPoints = waypoints.map((point) => toSvg(point.pose.ee));
  const obstacle = toSvg({ x: obstacleX, y: obstacleY });
  const pipeline = [
    ["PlanningScene", "robot + obstacle"],
    ["IK samples", "goal pose -> joint goal"],
    ["collision check", clearance < 0 ? "blocked" : `${clearance.toFixed(2)} m`],
    ["time parameter", "12 waypoints"],
  ];

  return (
    <VisualFrame
      icon={<Route size={18} aria-hidden />}
      metrics={[
        ["goal q", `${((goal[0] * 180) / Math.PI).toFixed(0)}°, ${((goal[1] * 180) / Math.PI).toFixed(0)}°`],
        ["waypoints", String(waypoints.length)],
        ["clearance", `${clearance.toFixed(2)} m`],
      ]}
      title="MoveIt 2 Planning Path Preview"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="goal x" max={1.5} min={0.1} onChange={setGoalX} step={0.03} value={goalX} />
          <Slider label="goal y" max={1.2} min={-0.6} onChange={setGoalY} step={0.03} value={goalY} />
          <Slider label="obstacle x" max={1.4} min={0.1} onChange={setObstacleX} step={0.03} value={obstacleX} />
          <Slider label="obstacle y" max={1.0} min={-0.4} onChange={setObstacleY} step={0.03} value={obstacleY} />
          {clearance < 0 && <div className="singularity-banner">collision check failed · obstacle과 경로가 겹칩니다.</div>}
          <div className="hint-box">브라우저 미리보기는 MoveIt 2의 PlanningScene/IK/collision/time-parameterization 흐름을 축소해서 보여줍니다.</div>
        </div>
        <div className="visual-stack">
          <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
            <circle className="workspace-ring" cx={origin.x} cy={origin.y} r={(l1 + l2) * scale} />
            <circle className="point target" cx={obstacle.x} cy={obstacle.y} r={0.18 * scale} />
            <polyline className="ik-trace-line" points={polyline(pathPoints)} />
            {waypoints.map((point, index) => {
              const joint = toSvg(point.pose.joint);
              const eePoint = toSvg(point.pose.ee);
              const isLast = index === waypoints.length - 1;
              return (
                <g key={index} opacity={isLast ? 1 : 0.18 + index * 0.04}>
                  <line className={isLast ? "link" : "link ghost"} x1={origin.x} x2={joint.x} y1={origin.y} y2={joint.y} />
                  <line className={isLast ? "link" : "link ghost"} x1={joint.x} x2={eePoint.x} y1={joint.y} y2={eePoint.y} />
                  <circle className={isLast ? "point result" : "workspace-sample"} cx={eePoint.x} cy={eePoint.y} r={isLast ? 6 : 3} />
                </g>
              );
            })}
            <circle className="joint" cx={origin.x} cy={origin.y} r="6" />
            <text x="24" y="28">joint-space interpolation + collision preview</text>
          </svg>
          <div className="flow-visual">
            {pipeline.map(([label, value], index) => (
              <div className="flow-step-wrap" key={label}>
                <div className={label === "collision check" && clearance < 0 ? "flow-step is-alert" : "flow-step"}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
                {index < pipeline.length - 1 && <div className="flow-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
