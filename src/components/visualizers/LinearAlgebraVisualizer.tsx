import { useState } from "react";
import { Sigma } from "lucide-react";
import { Slider, worldToSvg, VisualFrame, project3D } from "./VisualizerUtils";
import type { Point } from "./VisualizerUtils";

type Mode = "2d" | "3d";

export function LinearAlgebraVisualizer() {
  const [mode, setMode] = useState<Mode>("2d");

  // 2D state
  const [angle, setAngle] = useState(35);
  const [vx, setVx] = useState(1.3);
  const [vy, setVy] = useState(0.5);

  // 3D state
  const [v3x, setV3x] = useState(1.2);
  const [v3y, setV3y] = useState(0.8);
  const [v3z, setV3z] = useState(0.6);
  const [pitch, setPitch] = useState(20);
  const [yaw, setYaw] = useState(30);

  const width = 420;
  const height = 280;
  const scale = 72;

  // ── 2D ──
  const theta2d = (angle * Math.PI) / 180;
  const rotated = {
    x: Math.cos(theta2d) * vx - Math.sin(theta2d) * vy,
    y: Math.sin(theta2d) * vx + Math.cos(theta2d) * vy,
  };
  const origin2d = worldToSvg({ x: 0, y: 0 }, width, height, scale);
  const v2d = worldToSvg({ x: vx, y: vy }, width, height, scale);
  const rv2d = worldToSvg(rotated, width, height, scale);

  // ── 3D ──
  // rotate the view by pitch/yaw so the user can orbit the scene
  const p = (pitch * Math.PI) / 180;
  const y3 = (yaw * Math.PI) / 180;

  const rotateView = (px: number, py: number, pz: number): { x: number; y: number; z: number } => {
    // yaw around Z
    const x1 = px * Math.cos(y3) - py * Math.sin(y3);
    const y1 = px * Math.sin(y3) + py * Math.cos(y3);
    const z1 = pz;
    // pitch around X
    const x2 = x1;
    const y2 = y1 * Math.cos(p) - z1 * Math.sin(p);
    const z2 = y1 * Math.sin(p) + z1 * Math.cos(p);
    return { x: x2, y: y2, z: z2 };
  };

  const proj = (px: number, py: number, pz: number): Point => {
    const rv = rotateView(px, py, pz);
    return project3D({ x: rv.x, y: rv.y, z: rv.z }, width, height, 60);
  };

  const o3 = proj(0, 0, 0);
  const ex = proj(1.5, 0, 0);
  const ey = proj(0, 1.5, 0);
  const ez = proj(0, 0, 1.5);
  const vp = proj(v3x, v3y, v3z);

  // component projections (dashed lines)
  const vxEnd = proj(v3x, 0, 0);
  const vyEnd = proj(0, v3y, 0);
  const vzEnd = proj(0, 0, v3z);
  const vxyEnd = proj(v3x, v3y, 0);

  const norm3 = Math.hypot(v3x, v3y, v3z);
  const angleXY = (Math.atan2(v3y, v3x) * 180) / Math.PI;

  return (
    <VisualFrame
      icon={<Sigma size={18} aria-hidden />}
      metrics={
        mode === "2d"
          ? [
              ["cos θ", Math.cos(theta2d).toFixed(3)],
              ["sin θ", Math.sin(theta2d).toFixed(3)],
              ["Rv", `(${rotated.x.toFixed(2)}, ${rotated.y.toFixed(2)})`],
            ]
          : [
              ["‖v‖", norm3.toFixed(3)],
              ["angle XY", angleXY.toFixed(1) + "°"],
              ["v", `(${v3x.toFixed(1)}, ${v3y.toFixed(1)}, ${v3z.toFixed(1)})`],
            ]
      }
      title={mode === "2d" ? "2D 회전행렬" : "3D 벡터 시각화"}
    >
      <div className="visual-layout">
        <div className="control-stack">
          {/* mode toggle */}
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            {(["2d", "3d"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: "3px 12px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  background: mode === m ? "#047d7a" : "transparent",
                  color: mode === m ? "#fff" : undefined,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {mode === "2d" ? (
            <>
              <Slider label="각도" max={180} min={-180} onChange={setAngle} step={1} suffix="°" value={angle} />
              <Slider label="vx" max={2} min={-2} onChange={setVx} step={0.05} value={vx} />
              <Slider label="vy" max={2} min={-2} onChange={setVy} step={0.05} value={vy} />
            </>
          ) : (
            <>
              <Slider label="vx" max={2} min={-2} onChange={setV3x} step={0.05} value={v3x} />
              <Slider label="vy" max={2} min={-2} onChange={setV3y} step={0.05} value={v3y} />
              <Slider label="vz" max={2} min={-2} onChange={setV3z} step={0.05} value={v3z} />
              <Slider label="시점 pitch" max={60} min={-30} onChange={setPitch} step={1} suffix="°" value={pitch} />
              <Slider label="시점 yaw" max={180} min={-180} onChange={setYaw} step={1} suffix="°" value={yaw} />
            </>
          )}
        </div>

        {mode === "2d" ? (
          <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
            <line className="axis" x1="20" x2={width - 20} y1={origin2d.y} y2={origin2d.y} />
            <line className="axis" x1={origin2d.x} x2={origin2d.x} y1="20" y2={height - 20} />
            <line className="vector original" x1={origin2d.x} x2={v2d.x} y1={origin2d.y} y2={v2d.y} />
            <line className="vector result" x1={origin2d.x} x2={rv2d.x} y1={origin2d.y} y2={rv2d.y} />
            <circle className="point original" cx={v2d.x} cy={v2d.y} r="5" />
            <circle className="point result" cx={rv2d.x} cy={rv2d.y} r="5" />
            <text x={v2d.x + 8} y={v2d.y - 8}>v</text>
            <text x={rv2d.x + 8} y={rv2d.y - 8}>Rv</text>
          </svg>
        ) : (
          <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
            {/* coordinate axes */}
            <line stroke="#dc2626" strokeWidth="1.5" x1={o3.x} x2={ex.x} y1={o3.y} y2={ex.y} />
            <text x={ex.x + 4} y={ex.y} style={{ fontSize: 10, fill: "#dc2626" }}>X</text>
            <line stroke="#16a34a" strokeWidth="1.5" x1={o3.x} x2={ey.x} y1={o3.y} y2={ey.y} />
            <text x={ey.x + 4} y={ey.y} style={{ fontSize: 10, fill: "#16a34a" }}>Y</text>
            <line stroke="#2563eb" strokeWidth="1.5" x1={o3.x} x2={ez.x} y1={o3.y} y2={ez.y} />
            <text x={ez.x + 4} y={ez.y} style={{ fontSize: 10, fill: "#2563eb" }}>Z</text>

            {/* component projection lines (dashed) */}
            <line stroke="#aaa" strokeDasharray="3,2" strokeWidth="1" x1={o3.x} x2={vxEnd.x} y1={o3.y} y2={vxEnd.y} />
            <line stroke="#aaa" strokeDasharray="3,2" strokeWidth="1" x1={o3.x} x2={vyEnd.x} y1={o3.y} y2={vyEnd.y} />
            <line stroke="#aaa" strokeDasharray="3,2" strokeWidth="1" x1={o3.x} x2={vzEnd.x} y1={o3.y} y2={vzEnd.y} />
            <line stroke="#bbb" strokeDasharray="2,2" strokeWidth="1" x1={vxEnd.x} x2={vxyEnd.x} y1={vxEnd.y} y2={vxyEnd.y} />
            <line stroke="#bbb" strokeDasharray="2,2" strokeWidth="1" x1={vyEnd.x} x2={vxyEnd.x} y1={vyEnd.y} y2={vxyEnd.y} />
            <line stroke="#bbb" strokeDasharray="2,2" strokeWidth="1" x1={vxyEnd.x} x2={vp.x} y1={vxyEnd.y} y2={vp.y} />

            {/* vector v */}
            <line className="vector result" strokeWidth="2.5" x1={o3.x} x2={vp.x} y1={o3.y} y2={vp.y} />
            <circle cx={vp.x} cy={vp.y} fill="#047d7a" r="5" />
            <text x={vp.x + 7} y={vp.y - 7} style={{ fontSize: 11, fill: "#047d7a" }}>v</text>

            {/* origin */}
            <circle className="joint" cx={o3.x} cy={o3.y} r="4" />

            {/* norm label */}
            <text x="20" y={height - 10} style={{ fontSize: 10, fill: "#888" }}>
              ‖v‖ = √(vx²+vy²+vz²) = {norm3.toFixed(3)}
            </text>
          </svg>
        )}
      </div>
    </VisualFrame>
  );
}
