import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route, FileCode2 } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform, defaultUrdf } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function URDFXacroBuilderVisualizer() {
  const [urdfText, setUrdfText] = useState(defaultUrdf);
  const parsed = useMemo(() => {
    const doc = new DOMParser().parseFromString(urdfText, "application/xml");
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      return { error: "XML parser error", links: [] as string[], joints: [] as Array<{ name: string; type: string; parent: string; child: string; xyz: [number, number, number]; axis: string }> };
    }
    const links = Array.from(doc.querySelectorAll("link")).map((link) => link.getAttribute("name") ?? "unnamed_link");
    const parseXyz = (value: string | null): [number, number, number] => {
      const nums = (value ?? "0.7 0 0").trim().split(/\s+/).map(Number);
      return [
        Number.isFinite(nums[0]) ? nums[0] : 0.7,
        Number.isFinite(nums[1]) ? nums[1] : 0,
        Number.isFinite(nums[2]) ? nums[2] : 0,
      ];
    };
    const joints = Array.from(doc.querySelectorAll("joint")).map((joint) => ({
      name: joint.getAttribute("name") ?? "unnamed_joint",
      type: joint.getAttribute("type") ?? "fixed",
      parent: joint.querySelector("parent")?.getAttribute("link") ?? "missing_parent",
      child: joint.querySelector("child")?.getAttribute("link") ?? "missing_child",
      xyz: parseXyz(joint.querySelector("origin")?.getAttribute("xyz") ?? null),
      axis: joint.querySelector("axis")?.getAttribute("xyz") ?? "0 0 0",
    }));
    return { error: "", links, joints };
  }, [urdfText]);
  const width = 430;
  const height = 300;
  const scale = 88;
  const frames = parsed.joints.reduce<Array<{ name: string; point: Point3; type: string }>>(
    (items, joint) => {
      const previous = items[items.length - 1].point;
      items.push({
        name: joint.child,
        point: { x: previous.x + joint.xyz[0], y: previous.y + joint.xyz[1], z: previous.z + joint.xyz[2] },
        type: joint.type,
      });
      return items;
    },
    [{ name: parsed.joints[0]?.parent ?? parsed.links[0] ?? "base_link", point: { x: 0, y: 0, z: 0 }, type: "base" }],
  );
  const projected = frames.map((frame) => project3D(frame.point, width, height, scale));
  const controllable = parsed.joints.filter((joint) => joint.type === "revolute" || joint.type === "continuous");
  const fixed = parsed.joints.length - controllable.length;

  return (
    <VisualFrame
      icon={<FileCode2 size={18} aria-hidden />}
      metrics={[
        ["links", String(parsed.links.length)],
        ["controllable joints", String(controllable.length)],
        ["fixed joints", String(fixed)],
      ]}
      title="URDF/Xacro Browser Builder"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <textarea className="text-area code-textarea" onChange={(event) => setUrdfText(event.target.value)} spellCheck={false} value={urdfText} />
          <div className="visual-actions">
            <button className="text-button" onClick={() => setUrdfText(defaultUrdf)} type="button">
              <RotateCcw size={16} aria-hidden />
              reset
            </button>
          </div>
          {parsed.error && <div className="singularity-banner">{parsed.error}</div>}
          <div className="hint-box">URDF XML을 수정하면 link/joint tree와 controller에 넣을 수 있는 revolute/continuous joint 목록이 바로 갱신됩니다.</div>
        </div>
        <div className="visual-stack">
          <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
            <line className="axis" x1="34" x2={width - 34} y1={height / 2 + 54} y2={height / 2 - 44} />
            {projected.slice(1).map((point, index) => {
              const prev = projected[index];
              return <line className={frames[index + 1].type === "fixed" ? "link ghost" : "link"} key={index} x1={prev.x} x2={point.x} y1={prev.y} y2={point.y} />;
            })}
            {projected.map((point, index) => (
              <g key={`${frames[index].name}-${index}`}>
                <circle className={index === 0 ? "joint" : "point result"} cx={point.x} cy={point.y} r="6" />
                <text x={point.x + 8} y={point.y - 8}>{frames[index].name}</text>
              </g>
            ))}
            <text x="24" y="28">URDF joint origin xyz -&gt; link chain preview</text>
          </svg>
          <div className="matrix-step-grid">
            <div className="matrix-card">
              <span>controller joints</span>
              <code>{controllable.map((joint) => joint.name).join("\n") || "No controllable joints"}</code>
            </div>
            <div className="matrix-card">
              <span>joint tree</span>
              <code>{parsed.joints.map((joint) => `${joint.parent} -> ${joint.child} (${joint.type}, axis ${joint.axis})`).join("\n") || "No joints parsed"}</code>
            </div>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
