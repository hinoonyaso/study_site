import { ReactNode } from "react";
import { Sigma, Grid3X3, Crosshair } from "lucide-react";

export type Point = { x: number; y: number };
export type Point3 = { x: number; y: number; z: number };
export type Matrix = number[][];
export type DhRow = { theta: number; a: number; d: number; alpha: number };
export type DetectionBox = { id: string; x: number; y: number; w: number; h: number; score: number };

export function Slider({
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", color: "var(--fg-muted)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "bold" }}>{value}{suffix}</span>
      </div>
      <input
        aria-label={label}
        aria-valuetext={`${value}${suffix}`}
        max={max}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        type="range"
        value={value}
        style={{ width: "100%", height: "4px", accentColor: "var(--primary)", cursor: "pointer" }}
      />
    </label>
  );
}

export function worldToSvg(point: Point, width: number, height: number, scale: number): Point {
  return {
    x: width / 2 + point.x * scale,
    y: height / 2 - point.y * scale,
  };
}

export function polyline(points: Point[]) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

export function VisualFrame({
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

export function project3D(point: Point3, width: number, height: number, scale: number): Point {
  return {
    x: width / 2 + (point.x - point.y) * scale * 0.72,
    y: height / 2 - point.z * scale - (point.x + point.y) * scale * 0.28,
  };
}

export function multiplyMatrices(left: Matrix, right: Matrix): Matrix {
  return left.map((row) =>
    right[0].map((_, colIndex) => row.reduce((sum, value, rowIndex) => sum + value * right[rowIndex][colIndex], 0)),
  );
}

export function formatMatrix(matrix: Matrix, digits = 2) {
  return matrix.map((row) => `[${row.map((value) => value.toFixed(digits).padStart(6, " ")).join(" ")}]`).join("\n");
}

export function planarLinkTransform(theta: number, length: number): Matrix {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [
    [c, -s, length * c],
    [s, c, length * s],
    [0, 0, 1],
  ];
}

export function dhTransform(theta: number, a: number, d: number, alpha: number): Matrix {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const ca = Math.cos(alpha);
  const sa = Math.sin(alpha);
  return [
    [c, -s * ca, s * sa, a * c],
    [s, c * ca, -c * sa, a * s],
    [0, sa, ca, d],
    [0, 0, 0, 1],
  ];
}

export const defaultObstacles = new Set(["2,2", "2,3", "2,4", "3,2", "4,2", "6,5", "6,6", "7,5"]);

export function runAStar(width: number, height: number, obstacles: Set<string>): string[] {
  const start = "0,0";
  const goal = `${width - 1},${height - 1}`;
  const queue = [[start]];
  const visited = new Set([start]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    if (current === goal) return path;

    const [x, y] = current.split(",").map(Number);
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];

    for (const [nx, ny] of neighbors) {
      const nid = `${nx},${ny}`;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && !obstacles.has(nid) && !visited.has(nid)) {
        visited.add(nid);
        queue.push([...path, nid]);
      }
    }
  }
  return [];
}

export const defaultBtXml = `<root main_tree_to_execute="MainTree">
  <BehaviorTree ID="MainTree">
    <RecoveryNode number_of_retries="6">
      <PipelineSequence>
        <RateController hz="1.0">
          <DistanceController distance="0.5">
            <ComputePathToPose goal="{goal}"/>
          </DistanceController>
        </RateController>
        <FollowPath path="{path}" controller_id="FollowPath"/>
      </PipelineSequence>
      <ClearEntireCostmap service_name="local_costmap/clear_entirely_local_costmap"/>
    </RecoveryNode>
  </BehaviorTree>
</root>`;

export const defaultRos2ControlYaml = `controller_manager:
  ros__parameters:
    update_rate: 100
    joint_state_broadcaster:
      type: joint_state_broadcaster/JointStateBroadcaster
    diff_drive_controller:
      type: diff_drive_controller/DiffDriveController

diff_drive_controller:
  ros__parameters:
    left_wheel_names: ["left_wheel_joint"]
    right_wheel_names: ["right_wheel_joint"]
    wheel_separation: 0.5
    wheel_radius: 0.1`;

export const defaultNav2Yaml = `nav2_params:
  ros__parameters:
    use_sim_time: true`;

export const defaultSlamYaml = `slam_params:
  ros__parameters:
    use_sim_time: true`;

export const defaultRobotLocalizationYaml = `ekf_params:
  ros__parameters:
    use_sim_time: true`;

export const defaultUrdf = `<robot name="physics_arm">
  <link name="base_link">
    <visual>
      <geometry><cylinder length="0.1" radius="0.2"/></geometry>
    </visual>
  </link>
  <joint name="joint1" type="revolute">
    <parent link="base_link"/>
    <child link="link1"/>
    <axis xyz="0 0 1"/>
  </joint>
</robot>`;

export function iou(box1: any, box2: any): number {
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.w, box2.x + box2.w);
  const y2 = Math.min(box1.y + box1.h, box2.y + box2.h);
  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = box1.w * box1.h + box2.w * box2.h - intersection;
  return union > 0 ? intersection / union : 0;
}

export function nms(boxes: any[], threshold: number): any[] {
  const sorted = [...boxes].sort((a, b) => b.score - a.score);
  const result: any[] = [];
  while (sorted.length > 0) {
    const current = sorted.shift()!;
    result.push(current);
    for (let i = 0; i < sorted.length; i++) {
      if (iou(current, sorted[i]) > threshold) {
        sorted.splice(i, 1);
        i--;
      }
    }
  }
  return result;
}

export function drawBox(ctx: CanvasRenderingContext2D, box: any, color: string, label: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x, box.y, box.w, box.h);
  ctx.fillStyle = color;
  ctx.fillRect(box.x, box.y - 20, 60, 20);
  ctx.fillStyle = "white";
  ctx.fillText(label, box.x + 5, box.y - 5);
}
