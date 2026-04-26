import { AlertCircle, BarChart3 } from "lucide-react";
import { AdaptiveRetryPanel } from "./AdaptiveRetryPanel";
import type { CurriculumModule, WrongAnswerEntry } from "../types";

type WrongAnswerAnalyzerProps = {
  modules: CurriculumModule[];
  wrongAnswers: WrongAnswerEntry[];
};

export function WrongAnswerAnalyzer({ modules, wrongAnswers }: WrongAnswerAnalyzerProps) {
  if (wrongAnswers.length === 0) return null;
  const sectionMap = new Map<string, string>();
  for (const module of modules) {
    for (const section of module.sections) sectionMap.set(section.id, section.title);
  }
  const recent = [...wrongAnswers].slice(-50).reverse();
  const byTag = new Map<string, { count: number; severity: string; reviews: Set<string> }>();
  for (const entry of recent) {
    const tag = entry.conceptTag ?? "legacy_unknown";
    const item = byTag.get(tag) ?? { count: 0, severity: entry.severity ?? "medium", reviews: new Set<string>() };
    item.count += 1;
    for (const review of entry.recommendedReview ?? []) item.reviews.add(review);
    if (entry.severity === "high") item.severity = "high";
    byTag.set(tag, item);
  }
  const topWeakTags = [...byTag.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 5);

  return (
    <section className="panel wrong-answer-panel">
      <div className="panel-heading">
        <AlertCircle size={18} aria-hidden />
        <h2>오답 분석</h2>
        <span className="wrong-count">{recent.length}개</span>
      </div>
      <div className="metrics-grid">
        {topWeakTags.map(([tag, item], index) => (
          <div className="metric-card" key={tag}>
            <span>TOP {index + 1} · {tag}</span>
            <strong>{item.count}회 · {Math.round((item.count / recent.length) * 100)}% · {item.severity}</strong>
            <small>복습: {[...item.reviews].join(" / ") || "reviewSession 확인"}</small>
          </div>
        ))}
      </div>
      <div className="hint-box">
        <BarChart3 size={15} aria-hidden />
        같은 conceptTag가 반복되면 더 어려운 문제로 가기보다 해당 세션의 손계산, 코드랩, 시각화 해석을 같은 숫자로 다시 연결한다.
      </div>
      <AdaptiveRetryPanel entries={recent} />
      <div className="wrong-list">
        {recent.slice(0, 10).map((entry, index) => (
          <div className="wrong-item" key={`${entry.questionId}-${index}`}>
            <div className="wrong-meta">
              <small>{entry.date}</small>
              <span>{sectionMap.get(entry.sectionId) ?? entry.sectionId}</span>
              <span>{entry.errorType ?? "legacy"}</span>
            </div>
            <p className="wrong-prompt">{entry.questionPrompt}</p>
            <div className="wrong-answers">
              <div className="wrong-my">
                <small>내 답</small>
                <code>{entry.myAnswer || "-"}</code>
              </div>
              <div className="wrong-correct">
                <small>정답</small>
                <code>{entry.correctAnswer}</code>
              </div>
            </div>
            <small className="wrong-explain">{entry.explanation}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
