import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform, defaultBtXml, defaultNav2Yaml, defaultSlamYaml, defaultRobotLocalizationYaml } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function Nav2WorkflowStackVisualizer() {
  const [btXml, setBtXml] = useState(defaultBtXml);
  const [nav2Yaml, setNav2Yaml] = useState(defaultNav2Yaml);
  const [slamYaml, setSlamYaml] = useState(defaultSlamYaml);
  const [robotLocalizationYaml, setRobotLocalizationYaml] = useState(defaultRobotLocalizationYaml);
  const [tfAge, setTfAge] = useState(42);
  const btDoc = useMemo(() => new DOMParser().parseFromString(btXml, "application/xml"), [btXml]);
  const btError = Boolean(btDoc.querySelector("parsererror"));
  const checks = [
    ["BT XML", !btError && /ComputePathToPose/.test(btXml) && /FollowPath/.test(btXml)],
    ["map server", /map_server/.test(nav2Yaml) && /yaml_filename/.test(nav2Yaml)],
    ["planner server", /planner_server/.test(nav2Yaml)],
    ["controller server", /controller_server/.test(nav2Yaml)],
    ["BT navigator", /bt_navigator/.test(nav2Yaml) && /default_bt_xml_filename/.test(nav2Yaml)],
    ["slam_toolbox frames", /map_frame:\s*map/.test(slamYaml) && /odom_frame:\s*odom/.test(slamYaml) && /base_frame:\s*base_link/.test(slamYaml)],
    ["robot_localization EKF", /ekf_filter_node/.test(robotLocalizationYaml) && /odom0:/.test(robotLocalizationYaml) && /imu0:/.test(robotLocalizationYaml)],
    ["TF freshness", tfAge < 150],
  ] as Array<[string, boolean]>;
  const ready = checks.every(([, ok]) => ok);
  const tMapOdom = { x: 0.35 + tfAge * 0.001, y: 0.12, yaw: 1.5 };
  const tOdomBase = { x: 1.25, y: 0.28, yaw: 8.0 };
  const tMapBase = {
    x: tMapOdom.x + tOdomBase.x,
    y: tMapOdom.y + tOdomBase.y,
    yaw: tMapOdom.yaw + tOdomBase.yaw,
  };
  const formatPose = (pose: { x: number; y: number; yaw: number }) => `x=${pose.x.toFixed(2)} y=${pose.y.toFixed(2)} yaw=${pose.yaw.toFixed(1)}deg`;
  const nav2Flow = [
    ["A 위치추정", "wheel/imu -> EKF -> odom"],
    ["B 지도작성", "LiDAR -> slam_toolbox -> map"],
    ["C 전역경로", "map server -> planner server"],
    ["D 로컬제어", "controller server -> cmd_vel"],
  ];
  const architecture = [
    ["map server", "OccupancyGrid"],
    ["BT navigator", "NavigateToPose"],
    ["planner server", "global path"],
    ["controller server", "DWB/MPPI"],
    ["costmap", "static + obstacle + inflation"],
    ["cmd_vel", ready ? "publish" : "blocked"],
  ];

  return (
    <VisualFrame
      icon={<Workflow size={18} aria-hidden />}
      metrics={[
        ["readiness", `${checks.filter(([, ok]) => ok).length}/${checks.length}`],
        ["TF age", `${tfAge} ms`],
        ["launch gate", ready ? "ready" : "blocked"],
      ]}
      title="Nav2 Pipeline / BT XML / YAML / TF Tree Lab"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="TF age" max={500} min={0} onChange={setTfAge} step={5} suffix=" ms" value={tfAge} />
          <label className="slider-row">
            <span>BT XML editor<strong>{btError ? "invalid" : "valid"}</strong></span>
            <textarea className="text-area code-textarea small-code-textarea" onChange={(event) => setBtXml(event.target.value)} spellCheck={false} value={btXml} />
          </label>
          <label className="slider-row">
            <span>Nav2 launch params<strong>{/bt_navigator/.test(nav2Yaml) ? "bt ok" : "missing bt"}</strong></span>
            <textarea className="text-area code-textarea small-code-textarea" onChange={(event) => setNav2Yaml(event.target.value)} spellCheck={false} value={nav2Yaml} />
          </label>
          <label className="slider-row">
            <span>slam_toolbox YAML<strong>{/resolution/.test(slamYaml) ? "map ok" : "missing"}</strong></span>
            <textarea className="text-area code-textarea small-code-textarea" onChange={(event) => setSlamYaml(event.target.value)} spellCheck={false} value={slamYaml} />
          </label>
          <label className="slider-row">
            <span>robot_localization YAML<strong>{/imu0:/.test(robotLocalizationYaml) ? "imu ok" : "missing"}</strong></span>
            <textarea className="text-area code-textarea small-code-textarea" onChange={(event) => setRobotLocalizationYaml(event.target.value)} spellCheck={false} value={robotLocalizationYaml} />
          </label>
        </div>
        <div className="visual-stack">
          <div className="flow-visual">
            {nav2Flow.map(([label, value], index) => (
              <div className="flow-step-wrap" key={label}>
                <div className="flow-step">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
                {index < nav2Flow.length - 1 && <div className="flow-arrow">→</div>}
              </div>
            ))}
          </div>
          <div className="flow-visual">
            {architecture.map(([label, value], index) => (
              <div className="flow-step-wrap" key={label}>
                <div className={label === "cmd_vel" && !ready ? "flow-step is-alert" : "flow-step"}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
                {index < architecture.length - 1 && <div className="flow-arrow">→</div>}
              </div>
            ))}
          </div>
          <svg className="plot compact-plot" role="img" viewBox="0 0 430 250">
            {[
              ["map", 70, 54],
              ["odom", 190, 112],
              ["base_link", 315, 170],
              ["laser", 315, 70],
              ["camera_link", 190, 200],
            ].map(([label, x, y]) => (
              <g key={String(label)}>
                <circle className={tfAge < 150 ? "point result" : "point target"} cx={Number(x)} cy={Number(y)} r="8" />
                <text x={Number(x) + 10} y={Number(y) - 8}>{label}</text>
              </g>
            ))}
            <line className="link ghost" x1="70" x2="190" y1="54" y2="112" />
            <line className={tfAge < 150 ? "link" : "cross-track-line"} x1="190" x2="315" y1="112" y2="170" />
            <line className="link ghost" x1="315" x2="315" y1="170" y2="70" />
            <line className="link ghost" x1="315" x2="190" y1="170" y2="200" />
            <text x="26" y="28">TF tree: map -&gt; odom -&gt; base_link -&gt; sensors</text>
          </svg>
          <div className="matrix-step-grid">
            <div className="matrix-card">
              <span>T_map_odom</span>
              <code>{formatPose(tMapOdom)}</code>
            </div>
            <div className="matrix-card">
              <span>T_odom_base</span>
              <code>{formatPose(tOdomBase)}</code>
            </div>
            <div className={tfAge < 150 ? "matrix-card is-pass" : "matrix-card is-fail"}>
              <span>T_map_base</span>
              <code>{`T_map_odom x T_odom_base\n${formatPose(tMapBase)}`}</code>
            </div>
            {checks.map(([label, ok]) => (
              <div className={ok ? "matrix-card is-pass" : "matrix-card is-fail"} key={label}>
                <span>{label}</span>
                <code>{ok ? "OK" : "check config"}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
