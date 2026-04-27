import { useEffect, useRef, useState } from "react";
import type { LessonSection } from "../../types";

type KinematicsSimulatorProps = {
  section: LessonSection;
};

export function KinematicsSimulator({ section }: KinematicsSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theta1, setTheta1] = useState(0);
  const [theta2, setTheta2] = useState(0);

  // Link Lengths
  const L1 = 150;
  const L2 = 120;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Coordinate offset (center origin at 50% width, 80% height)
    const ox = canvas.width / 2;
    const oy = canvas.height * 0.8;

    // Calculate Forward Kinematics
    const rT1 = (theta1 * Math.PI) / 180;
    const rT2 = (theta2 * Math.PI) / 180;

    const j1x = ox + L1 * Math.cos(rT1);
    const j1y = oy - L1 * Math.sin(rT1); // Canvas y is flipped

    const eex = j1x + L2 * Math.cos(rT1 + rT2);
    const eey = j1y - L2 * Math.sin(rT1 + rT2);

    // Draw base
    ctx.fillStyle = "var(--primary)";
    ctx.fillRect(ox - 30, oy, 60, 20);

    // Draw Link 1
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(j1x, j1y);
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.strokeStyle = "var(--teal-2)";
    ctx.stroke();

    // Draw Link 2
    ctx.beginPath();
    ctx.moveTo(j1x, j1y);
    ctx.lineTo(eex, eey);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "var(--peach-2)";
    ctx.stroke();

    // Joints
    ctx.beginPath();
    ctx.arc(ox, oy, 10, 0, 2 * Math.PI);
    ctx.arc(j1x, j1y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "var(--foreground)";
    ctx.fill();

    // End Effector
    ctx.beginPath();
    ctx.arc(eex, eey, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "var(--red)";
    ctx.fill();
  }, [theta1, theta2]);

  return (
    <div className="kinematics-simulator" style={{ border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden", background: "var(--surface)" }}>
      <div style={{ padding: "12px", borderBottom: "1px solid var(--line)" }}>
        <h3>2-Link Robot Arm (Forward / Inverse Kinematics)</h3>
        <p style={{ margin: "4px 0", fontSize: "0.9em", color: "var(--muted)" }}>
          슬라이더를 조절해 Joint Space와 Task Space 간의 매핑을 실시간으로 확인하세요.
        </p>
      </div>
      <div style={{ display: "flex", gap: "12px", padding: "16px" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          <label>
            <span style={{ display: "inline-block", width: "90px" }}>Theta 1 ({theta1}°)</span>
            <input type="range" min="-180" max="180" value={theta1} onChange={(e) => setTheta1(Number(e.target.value))} style={{ width: "200px" }} />
          </label>
          <label>
            <span style={{ display: "inline-block", width: "90px" }}>Theta 2 ({theta2}°)</span>
            <input type="range" min="-180" max="180" value={theta2} onChange={(e) => setTheta2(Number(e.target.value))} style={{ width: "200px" }} />
          </label>
        </div>
        <div style={{ flex: 2 }}>
          <canvas
            ref={canvasRef}
            width={500}
            height={400}
            style={{ width: "100%", height: "auto", background: "var(--bg)", borderRadius: "4px" }}
          />
        </div>
      </div>
    </div>
  );
}
