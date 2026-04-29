import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform, defaultObstacles, runAStar } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function AStarVisualizer() {
  const [obstacles, setObstacles] = useState(defaultObstacles);
  const width = 10;
  const height = 8;
  const path = useMemo(() => runAStar(width, height, obstacles), [obstacles]);
  const toggle = (x: number, y: number) => {
    const id = `${x},${y}`;
    if (id === "0,0" || id === `${width - 1},${height - 1}`) return;
    setObstacles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["grid", `${width} x ${height}`],
        ["obstacles", String(obstacles.size)],
        ["path length", path.length ? String(path.length - 1) : "blocked"],
      ]}
      title="A* Grid Planner"
    >
      <div className="grid-visual" style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
        {Array.from({ length: width * height }, (_, index) => {
          const x = index % width;
          const y = Math.floor(index / width);
          const id = `${x},${y}`;
          const className = [
            "grid-cell",
            obstacles.has(id) ? "is-obstacle" : "",
            path.includes(id) ? "is-path" : "",
            id === "0,0" ? "is-start" : "",
            id === `${width - 1},${height - 1}` ? "is-goal" : "",
          ].join(" ");
          return (
            <button aria-label={`cell ${id}`} className={className} key={id} onClick={() => toggle(x, y)} type="button" />
          );
        })}
      </div>
      <div className="visual-actions">
        <button className="text-button" onClick={() => setObstacles(defaultObstacles)} type="button">
          기본 장애물
        </button>
        <button className="text-button" onClick={() => setObstacles(new Set())} type="button">
          장애물 지우기
        </button>
      </div>
    </VisualFrame>
  );
}
