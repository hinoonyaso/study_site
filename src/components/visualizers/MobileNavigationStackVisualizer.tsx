import { useMemo, useState } from "react";
import { Workflow } from "lucide-react";
import { Slider, VisualFrame, polyline } from "./VisualizerUtils";
import type { Point } from "./VisualizerUtils";

const GRID_W = 10;
const GRID_H = 7;
const baseObstacles = new Set(["3,1", "3,2", "3,3", "5,3", "6,3", "7,3", "6,4", "2,5"]);
const start = "0,0";
const goal = `${GRID_W - 1},${GRID_H - 1}`;

const parseCell = (id: string) => id.split(",").map(Number) as [number, number];
const cellId = (x: number, y: number) => `${x},${y}`;
const manhattan = (id: string) => {
  const [x, y] = parseCell(id);
  return Math.abs(GRID_W - 1 - x) + Math.abs(GRID_H - 1 - y);
};

const searchPath = (blocked: Set<string>, heuristicWeight: number) => {
  const open = new Set([start]);
  const came: Record<string, string> = {};
  const g: Record<string, number> = { [start]: 0 };
  let expansions = 0;
  while (open.size > 0) {
    const current = [...open].sort((a, b) => (g[a] ?? Infinity) + heuristicWeight * manhattan(a) - ((g[b] ?? Infinity) + heuristicWeight * manhattan(b)))[0];
    expansions += 1;
    if (current === goal) {
      const path = [current];
      while (came[path[0]]) path.unshift(came[path[0]]);
      return { path, expansions };
    }
    open.delete(current);
    const [cx, cy] = parseCell(current);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx;
      const ny = cy + dy;
      const id = cellId(nx, ny);
      if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H || blocked.has(id)) continue;
      const tentative = (g[current] ?? Infinity) + 1;
      if (tentative < (g[id] ?? Infinity)) {
        came[id] = current;
        g[id] = tentative;
        open.add(id);
      }
    }
  }
  return { path: [] as string[], expansions };
};

const inflateObstacles = (radius: number) => {
  const inflated = new Set(baseObstacles);
  const cells = Math.round(radius);
  for (const obstacle of baseObstacles) {
    const [ox, oy] = parseCell(obstacle);
    for (let dx = -cells; dx <= cells; dx += 1) {
      for (let dy = -cells; dy <= cells; dy += 1) {
        if (Math.abs(dx) + Math.abs(dy) > cells) continue;
        const nx = ox + dx;
        const ny = oy + dy;
        if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) inflated.add(cellId(nx, ny));
      }
    }
  }
  inflated.delete(start);
  inflated.delete(goal);
  return inflated;
};

export function MobileNavigationStackVisualizer() {
  const [odomDrift, setOdomDrift] = useState(0.25);
  const [inflationRadius, setInflationRadius] = useState(0.7);
  const [heuristicWeight, setHeuristicWeight] = useState(1.0);
  const [controllerAggression, setControllerAggression] = useState(0.55);
  const [tfAge, setTfAge] = useState(42);

  const inflated = useMemo(() => inflateObstacles(inflationRadius), [inflationRadius]);
  const plan = useMemo(() => searchPath(inflated, heuristicWeight), [heuristicWeight, inflated]);
  const pathPoints = plan.path.map((id) => {
    const [x, y] = parseCell(id);
    return { x: 24 + x * 42, y: 232 - y * 30 };
  });
  const localizationError = odomDrift * (tfAge > 150 ? 1.7 : 1.0);
  const localizationOk = localizationError < 0.8;
  const mapOk = inflated.size < 28;
  const pathOk = plan.path.length > 0;

  const localRollouts = Array.from({ length: 10 }, (_, index) => {
    const omega = -0.9 + index * 0.2;
    const bend = omega * (1.1 - controllerAggression);
    const points: Point[] = Array.from({ length: 8 }, (_, step) => {
      const t = step / 7;
      return { x: 36 + t * 340, y: 210 - t * 120 + Math.sin(t * Math.PI) * bend * 72 };
    });
    const clearance = Math.abs(bend - 0.18) + 0.24;
    const pathError = Math.abs(bend);
    const score = clearance * (1.2 - controllerAggression) - pathError * controllerAggression;
    return { omega, points, clearance, pathError, score };
  });
  const bestRollout = localRollouts.reduce((best, item) => item.score > best.score ? item : best, localRollouts[0]);
  const controllerOk = bestRollout.clearance > 0.32;
  const tfOk = tfAge < 150;
  const ready = localizationOk && mapOk && pathOk && controllerOk && tfOk;

  const stages = [
    ["1 Localization", localizationOk, `error=${localizationError.toFixed(2)}m`],
    ["2 Mapping", mapOk, `${inflated.size} cost cells`],
    ["3 Global Path", pathOk, pathOk ? `${plan.path.length} cells` : "blocked"],
    ["4 Local Control", controllerOk && tfOk, ready ? "cmd_vel" : "hold"],
  ] as const;

  return (
    <VisualFrame
      icon={<Workflow size={18} aria-hidden />}
      metrics={[
        ["localization error", `${localizationError.toFixed(2)} m`],
        ["path length", pathOk ? String(plan.path.length) : "blocked"],
        ["TF age", `${tfAge} ms`],
        ["gate", ready ? "publish cmd_vel" : "hold/recover"],
      ]}
      title="Integrated Mobile Navigation Stack"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="odom drift" max={1} min={0} onChange={setOdomDrift} step={0.01} suffix=" m" value={odomDrift} />
          <Slider label="costmap inflation" max={1.5} min={0.2} onChange={setInflationRadius} step={0.1} suffix=" cells" value={inflationRadius} />
          <Slider label="A* heuristic" max={2} min={0} onChange={setHeuristicWeight} step={0.05} value={heuristicWeight} />
          <Slider label="controller aggression" max={1} min={0} onChange={setControllerAggression} step={0.05} value={controllerAggression} />
          <Slider label="TF age" max={500} min={0} onChange={setTfAge} step={5} suffix=" ms" value={tfAge} />
          {!ready && <div className="singularity-banner">navigation gate blocked: stale or unsafe stage detected</div>}
        </div>
        <div className="visual-stack">
          <div className="flow-visual">
            {stages.map(([label, ok, value], index) => (
              <div className="flow-step-wrap" key={label}>
                <div className={ok ? "flow-step" : "flow-step is-alert"}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
                {index < stages.length - 1 && <div className="flow-arrow">→</div>}
              </div>
            ))}
          </div>
          <div className="auto-grid" style={{ gridTemplateColumns: `repeat(${GRID_W}, 1fr)` }}>
            {Array.from({ length: GRID_W * GRID_H }, (_, index) => {
              const x = index % GRID_W;
              const y = Math.floor(index / GRID_W);
              const id = cellId(x, y);
              const className = [
                "auto-cell",
                baseObstacles.has(id) ? "is-obstacle" : "",
                !baseObstacles.has(id) && inflated.has(id) ? "is-dijkstra" : "",
                plan.path.includes(id) ? "is-path" : "",
                id === start ? "is-start" : "",
                id === goal ? "is-goal" : "",
              ].join(" ");
              return <div className={className} key={id} />;
            })}
          </div>
          <svg className="plot compact-plot" role="img" viewBox="0 0 430 250">
            <polyline className="path-line" points={polyline(pathPoints)} />
            <circle className={localizationOk ? "manip-ellipse" : "point target"} cx="70" cy="184" r={Math.max(10, localizationError * 30)} />
            <circle className="point result" cx="70" cy="184" r="5" />
            <circle className="point target" cx="250" cy="112" r="18" />
            {localRollouts.map((rollout, index) => (
              <polyline
                className={rollout === bestRollout ? "estimate-line" : rollout.clearance < 0.32 ? "cross-track-line" : "grid-line-soft"}
                key={index}
                points={polyline(rollout.points)}
              />
            ))}
            <text x="24" y="28">map/odom/base_link: localization → map → path → cmd_vel</text>
            <text x="24" y="48">selected local rollout: omega={bestRollout.omega.toFixed(2)}</text>
          </svg>
          <div className="matrix-step-grid">
            <div className={localizationOk ? "matrix-card is-pass" : "matrix-card is-fail"}>
              <span>localization</span>
              <code>odom drift={odomDrift.toFixed(2)}m, tf={tfAge}ms</code>
            </div>
            <div className={mapOk ? "matrix-card is-pass" : "matrix-card is-fail"}>
              <span>mapping/costmap</span>
              <code>inflated cells={inflated.size}, obstacles={baseObstacles.size}</code>
            </div>
            <div className={pathOk ? "matrix-card is-pass" : "matrix-card is-fail"}>
              <span>global planner</span>
              <code>expansions={plan.expansions}, path={pathOk ? plan.path.length : 0}</code>
            </div>
            <div className={ready ? "matrix-card is-pass" : "matrix-card is-fail"}>
              <span>local controller</span>
              <code>clearance={bestRollout.clearance.toFixed(2)}, cmd={ready ? "publish" : "hold"}</code>
            </div>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
