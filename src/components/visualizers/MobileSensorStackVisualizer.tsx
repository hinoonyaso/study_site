import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function MobileSensorStackVisualizer() {
  const [leftTicks, setLeftTicks] = useState(420);
  const [rightTicks, setRightTicks] = useState(510);
  const [ticksPerMeter, setTicksPerMeter] = useState(680);
  const [imuBias, setImuBias] = useState(0.035);
  const [syncSlop, setSyncSlop] = useState(18);
  const [extrinsicYaw, setExtrinsicYaw] = useState(6);
  const wheelBase = 0.46;
  const dl = leftTicks / ticksPerMeter;
  const dr = rightTicks / ticksPerMeter;
  const ds = (dl + dr) / 2;
  const dyaw = (dr - dl) / wheelBase;
  const pose = { x: ds * Math.cos(dyaw / 2), y: ds * Math.sin(dyaw / 2), yaw: dyaw };
  const drift = Array.from({ length: 80 }, (_, index) => {
    const t = (index / 79) * 10;
    const yaw = imuBias * t;
    return { x: t * 0.18, y: 0.5 * Math.sin(yaw) + imuBias * t * t * 0.18 };
  });
  const corrected = drift.map((point) => ({ x: point.x, y: point.y - imuBias * point.x * point.x * 1.6 }));
  const scanPoints = Array.from({ length: 52 }, (_, index) => {
    const angle = -1.9 + (3.8 * index) / 51;
    const wall = 1.9 + 0.18 * Math.sin(index * 0.8);
    const obstacle = Math.abs(angle - 0.35) < 0.28 ? 1.0 : wall;
    return { x: obstacle * Math.cos(angle), y: obstacle * Math.sin(angle) };
  });
  const imageStamps = Array.from({ length: 8 }, (_, index) => index * 100 + 7);
  const imuStamps = Array.from({ length: 36 }, (_, index) => index * 20 + 4 + extrinsicYaw * 0.8);
  const exactMatches = imageStamps.filter((imageStamp) => imuStamps.some((imuStamp) => Math.abs(imuStamp - imageStamp) <= 1)).length;
  const approxMatches = imageStamps.filter((imageStamp) => imuStamps.some((imuStamp) => Math.abs(imuStamp - imageStamp) <= syncSlop)).length;
  const width = 430;
  const height = 300;
  const map = (point: Point) => ({ x: 42 + point.x * 160, y: 150 - point.y * 110 });
  const driftLine = drift.map(map);
  const correctedLine = corrected.map(map);
  const scanSvg = scanPoints.map((point) => worldToSvg(point, width, height, 78));
  const calibrationErrorPx = Math.abs(Math.sin((extrinsicYaw * Math.PI) / 180)) * 180;

  return (
    <VisualFrame
      icon={<Route size={18} aria-hidden />}
      metrics={[
        ["encoder pose", `(${pose.x.toFixed(2)}, ${pose.y.toFixed(2)}, ${((pose.yaw * 180) / Math.PI).toFixed(1)} deg)`],
        ["IMU drift", `${(imuBias * 10 * 10 * 0.5).toFixed(2)} m proxy`],
        ["sync matches", `${exactMatches} exact / ${approxMatches} approx`],
        ["calib error", `${calibrationErrorPx.toFixed(1)} px`],
      ]}
      title="Encoder / IMU / LiDAR / Sync / Calibration Lab"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="left encoder ticks" max={1000} min={0} onChange={setLeftTicks} step={10} value={leftTicks} />
          <Slider label="right encoder ticks" max={1000} min={0} onChange={setRightTicks} step={10} value={rightTicks} />
          <Slider label="ticks per meter" max={1200} min={250} onChange={setTicksPerMeter} step={10} value={ticksPerMeter} />
          <Slider label="IMU accel bias" max={0.12} min={-0.12} onChange={setImuBias} step={0.005} suffix=" m/s2" value={imuBias} />
          <Slider label="Approx sync slop" max={60} min={0} onChange={setSyncSlop} step={1} suffix=" ms" value={syncSlop} />
          <Slider label="camera-LiDAR yaw" max={20} min={-20} onChange={setExtrinsicYaw} step={1} suffix=" deg" value={extrinsicYaw} />
          <div className="hint-box">encoder tick은 odom pose, IMU bias는 적분 drift, LiDAR scan은 occupancy update, timestamp slop은 approximate sync 성공률로 이어집니다.</div>
        </div>
        <div className="visual-stack">
          <svg className="plot compact-plot" role="img" viewBox={`0 0 ${width} ${height}`}>
            <line className="axis" x1="24" x2={width - 24} y1="150" y2="150" />
            <polyline className="measurement-line" points={polyline(driftLine)} />
            <polyline className="estimate-line" points={polyline(correctedLine)} />
            <circle className="point target" cx={42 + pose.x * 160} cy={150 - pose.y * 110} r="7" />
            <text x="28" y="28">encoder pose + IMU bias drift</text>
            <text x="28" y="48">orange: biased integration, teal: bias compensated</text>
          </svg>
          <svg className="plot compact-plot" role="img" viewBox={`0 0 ${width} ${height}`}>
            <circle className="workspace-ring" cx={width / 2} cy={height / 2} r="150" />
            <line className="axis" x1={width / 2} x2={width / 2 + 150} y1={height / 2} y2={height / 2} />
            {scanSvg.map((point, index) => (
              <circle className={index > 26 && index < 34 ? "point target small" : "point result small"} cx={point.x} cy={point.y} key={index} r="3" />
            ))}
            <line className="velocity-arrow" x1="214" x2={214 + Math.cos((extrinsicYaw * Math.PI) / 180) * 110} y1="150" y2={150 - Math.sin((extrinsicYaw * Math.PI) / 180) * 110} />
            <text x="24" y="28">LiDAR scan points + camera/LiDAR extrinsic yaw</text>
          </svg>
          <div className="matrix-step-grid">
            <div className="matrix-card">
              <span>exact sync</span>
              <code>{exactMatches}/{imageStamps.length} pairs within 1 ms</code>
            </div>
            <div className="matrix-card">
              <span>approximate sync</span>
              <code>{approxMatches}/{imageStamps.length} pairs within {syncSlop} ms</code>
            </div>
            <div className="matrix-card">
              <span>intrinsic/extrinsic check</span>
              <code>pixel residual ~= {calibrationErrorPx.toFixed(1)} px from yaw mismatch</code>
            </div>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
