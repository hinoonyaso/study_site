import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function MappingCostmapStackVisualizer() {
  const [selected, setSelected] = useState("6,4");
  const [logOddsByCell, setLogOddsByCell] = useState<Record<string, number>>({ "6,4": 2.2, "8,5": 1.6, "3,2": -1.2 });
  const [hitLogOdds, setHitLogOdds] = useState(1.1);
  const [freeLogOdds, setFreeLogOdds] = useState(-0.45);
  const [inflationRadius, setInflationRadius] = useState(2);
  const [decay, setDecay] = useState(2.2);
  const [loopWeight, setLoopWeight] = useState(0.7);
  const cols = 12;
  const rows = 8;
  const updateCell = (delta: number) => setLogOddsByCell((current) => ({ ...current, [selected]: Math.max(-4, Math.min(4, (current[selected] ?? 0) + delta)) }));
  const probability = (logOdds: number) => 1 - 1 / (1 + Math.exp(logOdds));
  const obstacles = new Set(Object.entries(logOddsByCell).filter(([, value]) => probability(value) > 0.68).map(([key]) => key));
  const costFor = (x: number, y: number) => {
    if (obstacles.has(`${x},${y}`)) return 254;
    const distances = [...obstacles].map((key) => {
      const [ox, oy] = key.split(",").map(Number);
      return Math.hypot(ox - x, oy - y);
    });
    const d = Math.min(...distances, Infinity);
    if (d > inflationRadius) return 0;
    return Math.round(252 * Math.exp(-decay * Math.max(0, d - 0.7)));
  };
  const rawPath = Array.from({ length: 8 }, (_, index) => ({ x: 40 + index * 48, y: 210 - Math.sin(index * 0.8) * 34 - index * 10 }));
  const optimizedPath = rawPath.map((point, index) => ({ x: point.x, y: point.y + loopWeight * index * 10 }));
  const selectedLogOdds = logOddsByCell[selected] ?? 0;
  const selectedProb = probability(selectedLogOdds);

  return (
    <VisualFrame
      icon={<Grid3X3 size={18} aria-hidden />}
      metrics={[
        ["selected cell", selected],
        ["P(occupied)", selectedProb.toFixed(2)],
        ["inflation radius", `${inflationRadius.toFixed(1)} cells`],
        ["loop closure", `${Math.round(loopWeight * 100)}%`],
      ]}
      title="SLAM Map / Occupancy Grid / Costmap Inflation"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="hit log-odds" max={3} min={0.2} onChange={setHitLogOdds} step={0.1} value={hitLogOdds} />
          <Slider label="free log-odds" max={-0.05} min={-2} onChange={setFreeLogOdds} step={0.05} value={freeLogOdds} />
          <Slider label="inflation radius" max={4} min={0.5} onChange={setInflationRadius} step={0.25} value={inflationRadius} />
          <Slider label="cost decay" max={5} min={0.4} onChange={setDecay} step={0.1} value={decay} />
          <Slider label="loop closure weight" max={1} min={0} onChange={setLoopWeight} step={0.05} value={loopWeight} />
          <div className="visual-actions">
            <button className="text-button" onClick={() => updateCell(hitLogOdds)} type="button">hit</button>
            <button className="text-button" onClick={() => updateCell(freeLogOdds)} type="button">free</button>
            <button className="icon-button" onClick={() => setLogOddsByCell({ "6,4": 2.2, "8,5": 1.6, "3,2": -1.2 })} type="button">
              <RotateCcw size={16} aria-hidden />
            </button>
          </div>
          <div className="hint-box">셀을 클릭한 뒤 hit/free를 누르면 log-odds가 누적되고, 같은 occupied 셀에서 Nav2 costmap inflation이 계산됩니다.</div>
        </div>
        <div className="visual-stack">
          <div className="auto-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols * rows }, (_, index) => {
              const x = index % cols;
              const y = Math.floor(index / cols);
              const key = `${x},${y}`;
              const p = probability(logOddsByCell[key] ?? 0);
              const cost = costFor(x, y);
              const background = obstacles.has(key)
                ? "#c2413c"
                : cost > 0
                  ? `rgba(183, 121, 31, ${Math.min(0.84, 0.18 + cost / 300)})`
                  : `rgba(4, 125, 122, ${Math.max(0.05, p * 0.35)})`;
              return (
                <button
                  aria-label={`map cell ${key}`}
                  className={key === selected ? "auto-cell is-selected" : "auto-cell"}
                  key={key}
                  onClick={() => setSelected(key)}
                  style={{ background }}
                  type="button"
                />
              );
            })}
          </div>
          <svg className="plot compact-plot" role="img" viewBox="0 0 430 240">
            <polyline className="measurement-line" points={polyline(rawPath)} />
            <polyline className="estimate-line" points={polyline(optimizedPath)} />
            {optimizedPath.map((point, index) => <circle className="point result small" cx={point.x} cy={point.y} key={index} r="4" />)}
            <text x="28" y="28">SLAM map: odom trajectory vs loop-closed trajectory</text>
            <text x="28" y="48">grid above is the actual occupancy/costmap used by planning</text>
          </svg>
        </div>
      </div>
    </VisualFrame>
  );
}
