import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function SVDJacobianVisualizer() {
  const [q2, setQ2] = useState(10);
  const [damping, setDamping] = useState(0.1);
  const [taskVelocity, setTaskVelocity] = useState(0.4);
  const q = (q2 * Math.PI) / 180;
  const sigmaMin = Math.max(0.001, Math.abs(Math.sin(q)) * 0.45);
  const sigmaMax = 1.6 + 0.2 * Math.cos(q);
  const condition = sigmaMax / sigmaMin;
  const dampedGain = sigmaMin / (sigmaMin * sigmaMin + damping * damping);
  const manipulability = sigmaMax * sigmaMin;
  const pinvQdot = taskVelocity / sigmaMin;
  const dlsQdot = taskVelocity * dampedGain;
  const ellipseRx = Math.max(8, sigmaMax * 38);
  const ellipseRy = Math.max(2, sigmaMin * 86);
  const ellipseAngle = q2 / 2;
  return (
    <VisualFrame
      icon={<Sigma size={18} aria-hidden />}
      metrics={[
        ["sigma max", sigmaMax.toFixed(2)],
        ["sigma min", sigmaMin.toFixed(3)],
        ["manipulability w", manipulability.toFixed(3)],
        ["condition", condition.toFixed(1)],
        ["DLS gain", dampedGain.toFixed(2)],
        ["pinv |qdot|", pinvQdot.toFixed(1)],
        ["DLS |qdot|", dlsQdot.toFixed(2)],
      ]}
      title="Jacobian Manipulability Ellipse and SVD Spectrum"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="q2" max={180} min={-180} onChange={setQ2} step={1} suffix="°" value={q2} />
          <Slider label="damping" max={0.5} min={0} onChange={setDamping} step={0.01} value={damping} />
          <Slider label="task velocity" max={1.5} min={0.05} onChange={setTaskVelocity} step={0.05} value={taskVelocity} />
          <div className="singularity-banner" style={{ display: sigmaMin < 0.04 ? "block" : "none" }}>
            det(J)→0: pseudoinverse 관절속도가 폭발하므로 IK damping이 필요합니다.
          </div>
        </div>
        <svg className="plot" role="img" viewBox="0 0 420 250">
          <line className="axis" x1="40" x2="180" y1="126" y2="126" />
          <line className="axis" x1="110" x2="110" y1="48" y2="204" />
          <ellipse
            className="manip-ellipse"
            cx="110"
            cy="126"
            rx={ellipseRx}
            ry={ellipseRy}
            transform={`rotate(${ellipseAngle} 110 126)`}
          />
          <text x="52" y="32">velocity ellipse</text>
          <text x="52" y="224">w=σ1σ2={manipulability.toFixed(3)}</text>
          <rect className="bar-primary" height={sigmaMax * 70} width="58" x="250" y={205 - sigmaMax * 70} />
          <rect className="bar-secondary" height={sigmaMin * 260} width="58" x="326" y={205 - sigmaMin * 260} />
          <line stroke="var(--red)" strokeLinecap="round" strokeWidth="5" x1="250" x2={Math.min(398, 250 + pinvQdot * 8)} y1="42" y2="42" />
          <line stroke="var(--teal)" strokeLinecap="round" strokeWidth="5" x1="250" x2={Math.min(398, 250 + dlsQdot * 28)} y1="62" y2="62" />
          <line className="axis" x1="226" x2="398" y1="205" y2="205" />
          <text x="250" y="34">pinv qdot</text>
          <text x="250" y="82">DLS qdot</text>
          <text x="256" y="225">σmax</text>
          <text x="332" y="225">σmin</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
