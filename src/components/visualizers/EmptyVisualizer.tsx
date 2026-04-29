import { useState, useEffect, useMemo } from "react";
import { Sigma, Grid3X3, Crosshair, Activity, LineChart, Play, Pause, RotateCcw, SkipForward, Workflow, Gauge, Route } from "lucide-react";
import { Slider, worldToSvg, polyline, VisualFrame, project3D, multiplyMatrices, formatMatrix, planarLinkTransform, dhTransform } from "./VisualizerUtils";
import type { Point, Point3, Matrix } from "./VisualizerUtils";
import { MiniGraph } from "../MiniGraph";
import type { LessonSection, TheoryGraphId } from '../../types';


export function EmptyVisualizer({ section }: { section?: LessonSection }) {
  const figures = Array.from(
    new Map((section?.theory.flatMap((u) => u.figures) ?? []).map((figure) => [figure.id, figure])).values(),
  );
  const links = [
    ["rotation-basis", "선형대수 회전행렬 시각화"],
    ["gaussian-kf", "Kalman Filter 시각화"],
    ["trajectory-polynomial", "로봇팔/trajectory 시각화"],
    ["astar-cost", "A* / Pure Pursuit 시각화"],
    ["confusion-matrix", "AI metric 시각화"],
    ["retrieval-pipeline", "Retrieval flow 시각화"],
    ["state-machine", "Latency / safety 상태 흐름 시각화"],
  ].filter(([id]) => section?.graphIds?.includes(id as TheoryGraphId));
  return (
    <section className="panel visual-panel">
      <div className="panel-heading">
        <Activity size={18} aria-hidden />
        <h2>시각화</h2>
      </div>
      {figures.length > 0 ? (
        <>
          <p className="lead">이 섹션의 개념 그래프를 시각적으로 확인하세요.</p>
          <div className="mini-graph-grid">
            {figures.map((figure) => (
              <MiniGraph figure={figure} key={figure.id} />
            ))}
          </div>
          {links.length > 0 && (
            <div className="visual-crosslinks">
              {links.map(([id, label]) => (
                <span key={id}>{label}</span>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="lead">이 섹션은 이론, 코드 실습, 체크리스트 중심으로 진행합니다.</p>
      )}
    </section>
  );
}
