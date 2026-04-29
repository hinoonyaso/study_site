import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";

export function LossLandscapeVisualizer() {
  const [alpha, setAlpha] = useState(0.2);
  const [initialX, setInitialX] = useState(-1);
  const [initialY, setInitialY] = useState(1);
  const width = 430;
  const height = 300;
  const scale = 55;
  const center = { x: 1, y: -0.5 };
  const loss = (x: number, y: number) => (x - 1) ** 2 + 0.5 * (y + 0.5) ** 2;
  const grad = (x: number, y: number) => ({ x: 2 * (x - 1), y: y + 0.5 });
  const path = [{ x: initialX, y: initialY }];
  for (let i = 0; i < 18; i += 1) {
    const last = path[path.length - 1];
    const g = grad(last.x, last.y);
    const next = {
      x: Math.max(-3.5, Math.min(3.5, last.x - alpha * g.x)),
      y: Math.max(-3.5, Math.min(3.5, last.y - alpha * g.y)),
    };
    path.push(next);
  }
  const final = path[path.length - 1];
  const finalGrad = grad(final.x, final.y);
  const contourLevels = [0.25, 0.75, 1.5, 3, 5.5, 8];
  const contour = (level: number) =>
    Array.from({ length: 80 }, (_, index) => {
      const t = (index / 79) * Math.PI * 2;
      return worldToSvg(
        {
          x: center.x + Math.sqrt(level) * Math.cos(t),
          y: center.y + Math.sqrt(2 * level) * Math.sin(t),
        },
        width,
        height,
        scale,
      );
    });
  const svgPath = path.map((point) => worldToSvg(point, width, height, scale));

  return (
    <VisualFrame
      icon={<LineChart size={18} aria-hidden />}
      metrics={[
        ["final loss", loss(final.x, final.y).toFixed(3)],
        ["grad norm", Math.hypot(finalGrad.x, finalGrad.y).toFixed(3)],
        ["status", alpha > 0.95 ? "unstable risk" : "descent"],
      ]}
      title="Gradient Descent Loss Landscape"
    >
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="learning rate" max={1.2} min={0.01} onChange={setAlpha} step={0.01} value={alpha} />
          <Slider label="initial x" max={3} min={-3} onChange={setInitialX} step={0.05} value={initialX} />
          <Slider label="initial y" max={3} min={-3} onChange={setInitialY} step={0.05} value={initialY} />
        </div>
        <svg className="plot" role="img" viewBox={`0 0 ${width} ${height}`}>
          {contourLevels.map((level) => (
            <polyline className="grid-line-soft" fill="none" key={level} points={polyline(contour(level))} />
          ))}
          <polyline className="vector result" fill="none" points={polyline(svgPath)} />
          {svgPath.map((point, index) => (
            <circle className={index === 0 ? "point original" : "point result"} cx={point.x} cy={point.y} key={`${point.x}-${point.y}-${index}`} r={index === 0 ? 5 : 3} />
          ))}
          <circle className="joint" cx={worldToSvg(center, width, height, scale).x} cy={worldToSvg(center, width, height, scale).y} r="5" />
          <text x={worldToSvg(center, width, height, scale).x + 8} y={worldToSvg(center, width, height, scale).y - 8}>minimum</text>
        </svg>
      </div>
    </VisualFrame>
  );
}
