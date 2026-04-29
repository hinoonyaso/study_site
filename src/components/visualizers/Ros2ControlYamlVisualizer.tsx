import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route, FileCode2 } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform, defaultRos2ControlYaml } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function Ros2ControlYamlVisualizer() {
  const [yamlText, setYamlText] = useState(defaultRos2ControlYaml);
  const checks = [
    ["controller_manager", /controller_manager:\s*[\r\n]/.test(yamlText)],
    ["ros__parameters", /ros__parameters:\s*[\r\n]/.test(yamlText)],
    ["joint_state_broadcaster", /joint_state_broadcaster/.test(yamlText)],
    ["trajectory controller type", /joint_trajectory_controller\/JointTrajectoryController/.test(yamlText)],
    ["joints list", /joints:\s*[\r\n](?:\s*-\s*[\w_]+\s*[\r\n]?)+/.test(yamlText)],
    ["command_interfaces", /command_interfaces:\s*[\r\n](?:\s*-\s*\w+\s*[\r\n]?)+/.test(yamlText)],
    ["state_interfaces", /state_interfaces:\s*[\r\n](?:\s*-\s*\w+\s*[\r\n]?)+/.test(yamlText)],
  ] as Array<[string, boolean]>;
  const passed = checks.filter(([, ok]) => ok).length;
  const controllerName = yamlText.match(/\n([a-zA-Z0-9_]+):\s*\n\s+ros__parameters:\s*\n\s+joints:/)?.[1] ?? "arm_controller";
  const loadCommands = [
    "ros2 control list_hardware_interfaces",
    "ros2 control load_controller --set-state active joint_state_broadcaster",
    `ros2 control load_controller --set-state active ${controllerName}`,
    "ros2 control list_controllers",
  ];

  return (
    <VisualFrame
      icon={<FileCode2 size={18} aria-hidden />}
      metrics={[
        ["YAML checks", `${passed}/${checks.length}`],
        ["controller", controllerName],
        ["browser mode", "config validator"],
      ]}
      title="ros2_control YAML + Controller Load Lab"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <textarea className="text-area code-textarea" onChange={(event) => setYamlText(event.target.value)} spellCheck={false} value={yamlText} />
          <div className="visual-actions">
            <button className="text-button" onClick={() => setYamlText(defaultRos2ControlYaml)} type="button">
              <RotateCcw size={16} aria-hidden />
              reset
            </button>
          </div>
          <div className="hint-box">브라우저에서는 ROS 2 런타임을 실행하지 않고, 실제 실행 전에 YAML 구조와 controller load 순서를 점검합니다.</div>
        </div>
        <div className="visual-stack">
          <div className="matrix-step-grid">
            {checks.map(([label, ok]) => (
              <div className={ok ? "matrix-card is-pass" : "matrix-card is-fail"} key={label}>
                <span>{label}</span>
                <code>{ok ? "OK" : "missing"}</code>
              </div>
            ))}
          </div>
          <div className="matrix-step-grid">
            {loadCommands.map((command, index) => (
              <div className="matrix-card" key={command}>
                <span>load step {index + 1}</span>
                <code>{command}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
