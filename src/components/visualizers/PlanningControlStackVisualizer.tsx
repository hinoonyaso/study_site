import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function PlanningControlStackVisualizer() {
  const [heuristicWeight, setHeuristicWeight] = useState(1);
  const [turnRadius, setTurnRadius] = useState(1.2);
  const [clearanceWeight, setClearanceWeight] = useState(1.4);
  const [pathWeight, setPathWeight] = useState(0.9);
  const [temperature, setTemperature] = useState(0.8);
  const width = 9;
  const height = 7;
  const obstacles = new Set(["2,1", "2,2", "2,3", "4,3", "5,3", "6,3", "6,4", "3,5"]);
  const search = (useHeuristic: boolean) => {
    const start = "0,0";
    const goal = `${width - 1},${height - 1}`;
    const parse = (id: string) => id.split(",").map(Number) as [number, number];
    const h = (id: string) => {
      const [x, y] = parse(id);
      return Math.abs(width - 1 - x) + Math.abs(height - 1 - y);
    };
    const open = new Set([start]);
    const came: Record<string, string> = {};
    const g: Record<string, number> = { [start]: 0 };
    let expansions = 0;
    while (open.size > 0) {
      const current = [...open].sort((a, b) => (g[a] ?? Infinity) + (useHeuristic ? heuristicWeight * h(a) : 0) - ((g[b] ?? Infinity) + (useHeuristic ? heuristicWeight * h(b) : 0)))[0];
      expansions += 1;
      if (current === goal) {
        const path = [current];
        while (came[path[0]]) path.unshift(came[path[0]]);
        return { path, expansions };
      }
      open.delete(current);
      const [cx, cy] = parse(current);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const nx = cx + dx;
        const ny = cy + dy;
        const id = `${nx},${ny}`;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height || obstacles.has(id)) return;
        const tentative = (g[current] ?? Infinity) + 1;
        if (tentative < (g[id] ?? Infinity)) {
          came[id] = current;
          g[id] = tentative;
          open.add(id);
        }
      });
    }
    return { path: [] as string[], expansions };
  };
  const astar = search(true);
  const dijkstra = search(false);
  const obstacle = { x: 1.05, y: 0.28 };
  const dwaCandidates = Array.from({ length: 24 }, (_, index) => {
    const v = 0.15 + (index % 8) * 0.11;
    const w = -1 + Math.floor(index / 8);
    const end = { x: v * 2.1, y: w * 0.34 * v };
    const clearance = Math.hypot(end.x - obstacle.x, end.y - obstacle.y);
    const pathDist = Math.abs(end.y);
    const score = clearanceWeight * clearance - pathWeight * pathDist + v * 0.35;
    return { v, w, end, clearance, pathDist, score, collides: clearance < 0.25 };
  });
  const bestDwa = dwaCandidates.filter((candidate) => !candidate.collides).reduce((best, candidate) => candidate.score > best.score ? candidate : best, dwaCandidates[0]);
  const mppiSamples = Array.from({ length: 18 }, (_, index) => {
    const bend = Math.sin(index * 1.9) * 0.55;
    const points = Array.from({ length: 9 }, (_, stepIndex) => {
      const t = stepIndex / 8;
      return { x: 26 + t * 370, y: 210 - t * 140 + bend * Math.sin(t * Math.PI) * 70 };
    });
    const minDist = Math.min(...points.map((point) => Math.hypot(point.x - 232, point.y - 130))) / 70;
    const cost = (1 / Math.max(0.1, minDist)) + Math.abs(bend) * 1.4 + index * 0.01;
    const weight = Math.exp(-(cost - 1) / Math.max(0.1, temperature));
    return { points, cost, weight };
  });
  const weightSum = mppiSamples.reduce((sum, sample) => sum + sample.weight, 0);
  const bestSample = mppiSamples.reduce((best, sample) => sample.cost < best.cost ? sample : best, mppiSamples[0]);

  return (
    <VisualFrame
      icon={<Route size={18} aria-hidden />}
      metrics={[
        ["A* expansions", String(astar.expansions)],
        ["Dijkstra expansions", String(dijkstra.expansions)],
        ["Hybrid radius", `${turnRadius.toFixed(1)} m`],
        ["DWB best cmd", `v=${bestDwa.v.toFixed(2)}, w=${bestDwa.w.toFixed(0)}`],
      ]}
      title="A* vs Dijkstra / Hybrid A* / DWA-DWB-MPPI"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="A* heuristic weight" max={2} min={0} onChange={setHeuristicWeight} step={0.05} value={heuristicWeight} />
          <Slider label="Hybrid A* turn radius" max={3} min={0.5} onChange={setTurnRadius} step={0.1} suffix=" m" value={turnRadius} />
          <Slider label="DWB obstacle critic" max={4} min={0} onChange={setClearanceWeight} step={0.1} value={clearanceWeight} />
          <Slider label="DWB path critic" max={3} min={0} onChange={setPathWeight} step={0.1} value={pathWeight} />
          <Slider label="MPPI temperature" max={3} min={0.1} onChange={setTemperature} step={0.05} value={temperature} />
          <div className="hint-box">Dijkstra는 모든 방향을 균일 확장하고, A*는 heuristic으로 goal 쪽을 우선합니다. Hybrid A*는 heading/turn radius까지 상태로 봅니다.</div>
        </div>
        <div className="visual-stack">
          <div className="auto-grid" style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
            {Array.from({ length: width * height }, (_, index) => {
              const x = index % width;
              const y = Math.floor(index / width);
              const id = `${x},${y}`;
              const className = [
                "auto-cell",
                obstacles.has(id) ? "is-obstacle" : "",
                dijkstra.path.includes(id) ? "is-dijkstra" : "",
                astar.path.includes(id) ? "is-path" : "",
                id === "0,0" ? "is-start" : "",
                id === `${width - 1},${height - 1}` ? "is-goal" : "",
              ].join(" ");
              return <div className={className} key={id} />;
            })}
          </div>
          <svg className="plot compact-plot" role="img" viewBox="0 0 430 250">
            <circle className="point target" cx="232" cy="130" r="18" />
            {mppiSamples.map((sample, index) => (
              <polyline
                className={sample === bestSample ? "estimate-line" : "grid-line-soft"}
                key={index}
                opacity={Math.max(0.15, sample.weight / weightSum * 6)}
                points={polyline(sample.points)}
              />
            ))}
            {dwaCandidates.map((candidate, index) => (
              <line
                className={candidate === bestDwa ? "velocity-arrow" : candidate.collides ? "cross-track-line" : "grid-line-soft"}
                key={index}
                x1="32"
                x2={32 + candidate.end.x * 130}
                y1="210"
                y2={210 - candidate.end.y * 130}
              />
            ))}
            <path className="path-line" d={`M 30 216 C ${110 + turnRadius * 25} ${230 - turnRadius * 18}, ${230 - turnRadius * 20} 92, 400 48`} fill="none" />
            <text x="26" y="28">Hybrid A* curve + DWA rollouts + MPPI weighted samples</text>
          </svg>
          <div className="matrix-step-grid">
            <div className="matrix-card">
              <span>DWB critics</span>
              <code>obstacle={bestDwa.clearance.toFixed(2)} path_dist={bestDwa.pathDist.toFixed(2)} velocity={bestDwa.v.toFixed(2)}</code>
            </div>
            <div className="matrix-card">
              <span>MPPI update</span>
              <code>weighted samples={mppiSamples.length}, best cost={bestSample.cost.toFixed(2)}</code>
            </div>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
