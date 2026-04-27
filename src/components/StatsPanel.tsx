import { useMemo } from "react";
import { BarChart3, Flame, TrendingUp, AlertTriangle } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { CurriculumModule, ProgressState } from "../types";

type StatsPanelProps = {
  modules: CurriculumModule[];
  progress: ProgressState;
};

function getStreak(studyLog: Array<{ date: string }>): number {
  if (studyLog.length === 0) return 0;
  const dates = [...new Set(studyLog.map((e) => e.date))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);

  // If no study today yet, check from yesterday
  let start = today;
  if (dates[0] !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    start = yesterday.toISOString().slice(0, 10);
    if (dates[0] !== start) return 0;
  }

  let streak = 0;
  const d = new Date(start);
  for (let i = 0; i < 365; i++) {
    const iso = d.toISOString().slice(0, 10);
    if (dates.includes(iso)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getHeatmapData(studyLog: Array<{ date: string }>): Array<{ date: string; count: number }> {
  const counts: Record<string, number> = {};
  for (const entry of studyLog) {
    counts[entry.date] = (counts[entry.date] ?? 0) + 1;
  }
  // Last 90 days
  const result: Array<{ date: string; count: number }> = [];
  const d = new Date();
  for (let i = 89; i >= 0; i--) {
    const dt = new Date(d);
    dt.setDate(dt.getDate() - i);
    const iso = dt.toISOString().slice(0, 10);
    result.push({ date: iso, count: counts[iso] ?? 0 });
  }
  return result;
}

export function StatsPanel({ modules, progress }: StatsPanelProps) {
  const streak = useMemo(() => getStreak(progress.studyLog ?? []), [progress.studyLog]);
  const heatmap = useMemo(() => getHeatmapData(progress.studyLog ?? []), [progress.studyLog]);
  const totalMinutes = useMemo(
    () => Math.round(((progress.studyLog ?? []).reduce((sum, entry) => sum + (entry.durationMs ?? 0), 0) / 60000) * 10) / 10,
    [progress.studyLog],
  );

  const moduleScores = useMemo(() => {
    return modules.map((module) => {
      const scores = module.sections
        .map((s) => progress.quizScores[s.id])
        .filter((s): s is number => s !== undefined && s > 0);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return { title: module.title, avg, count: scores.length, total: module.sections.length };
    });
  }, [modules, progress.quizScores]);

  const weakModules = moduleScores
    .filter((m) => m.count > 0 && m.avg < 60)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3);

  const maxCount = Math.max(1, ...heatmap.map((d) => d.count));

  return (
    <section className="panel stats-panel">
      <div className="panel-heading">
        <TrendingUp size={18} aria-hidden />
        <h2>학습 통계</h2>
      </div>

      <div className="stats-cards">
        <div className="stat-card stat-streak">
          <Flame size={20} aria-hidden />
          <div>
            <strong>{streak}일</strong>
            <span>연속 학습</span>
          </div>
        </div>
        <div className="stat-card">
          <BarChart3 size={20} aria-hidden />
          <div>
            <strong>{totalMinutes}분</strong>
            <span>기록 학습량</span>
          </div>
        </div>
        <div className="stat-card">
          <BarChart3 size={20} aria-hidden />
          <div>
            <strong>{(progress.quizHistory ?? []).length}회</strong>
            <span>총 시험</span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="heatmap-section">
        <small>최근 90일 학습 기록</small>
        <div className="heatmap-grid">
          {heatmap.map((d) => (
            <div
              className="heatmap-cell"
              key={d.date}
              style={{ opacity: d.count > 0 ? 0.25 + (d.count / maxCount) * 0.75 : 0.08 }}
              title={`${d.date}: ${d.count}개 세션`}
            />
          ))}
        </div>
      </div>

      {/* Module scores */}
      {moduleScores.some((m) => m.count > 0) && (
        <div className="module-scores">
          <small>모듈별 약점 분석 (Score Radar)</small>
          <div style={{ width: "100%", height: "250px", marginTop: "12px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={moduleScores.filter(m => m.count > 0)}>
                <PolarGrid stroke="var(--line)" />
                <PolarAngleAxis dataKey="title" tick={{ fill: "var(--foreground)", fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--line)", color: "var(--foreground)" }} />
                <Radar name="평균 점수" dataKey="avg" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: "12px" }}>
            {moduleScores
              .filter((m) => m.count > 0)
              .map((m) => (
                <div className="module-score-row" key={m.title}>
                  <span>{m.title}</span>
                  <div className="score-bar-wrap">
                    <div className="score-bar" style={{ width: `${m.avg}%` }} />
                  </div>
                  <strong>{m.avg}점</strong>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Weak areas */}
      {weakModules.length > 0 && (
        <div className="weak-areas">
          <div className="weak-heading">
            <AlertTriangle size={14} aria-hidden />
            <small>약한 영역</small>
          </div>
          {weakModules.map((m) => (
            <div className="weak-item" key={m.title}>
              <span>{m.title}</span>
              <strong>{m.avg}점</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
