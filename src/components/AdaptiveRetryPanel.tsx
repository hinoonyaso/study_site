import { RotateCcw } from "lucide-react";
import type { WrongAnswerEntry } from "../types";

export function AdaptiveRetryPanel({ entries }: { entries: WrongAnswerEntry[] }) {
  const latest = entries[0];
  if (!latest?.conceptTag) return null;
  const weakConcepts = [...entries.reduce((map, entry) => {
    const tag = entry.conceptTag ?? "legacy_unknown";
    const item = map.get(tag) ?? {
      count: 0,
      high: 0,
      retryTypes: new Set<string>(),
      reviews: new Set<string>(),
    };
    item.count += 1;
    if (entry.severity === "high") item.high += 1;
    if (entry.retryQuestionType) item.retryTypes.add(String(entry.retryQuestionType));
    for (const review of entry.recommendedReview ?? []) item.reviews.add(review);
    map.set(tag, item);
    return map;
  }, new Map<string, { count: number; high: number; retryTypes: Set<string>; reviews: Set<string> }>()).entries()]
    .sort((a, b) => b[1].count + b[1].high - (a[1].count + a[1].high))
    .slice(0, 3);
  const retryPlan = latest.retryPlan ?? {
    step1: "더 쉬운 수식 해석 문제",
    step2: "손계산 문제",
    step3: "시각화 해석 문제",
    step4: "로봇 상황 판단 문제",
  };
  const resetCurrentQuiz = () => window.dispatchEvent(new Event("physical-ai:reset-quiz"));
  const startAdaptiveRetry = () => {
    const [conceptTag, item] = weakConcepts[0] ?? [latest.conceptTag, undefined];
    window.dispatchEvent(
      new CustomEvent("physical-ai:start-adaptive-retry", {
        detail: {
          conceptTag,
          retryTypes: item ? [...item.retryTypes] : [latest.retryQuestionType ?? "calculation"],
          reviews: item ? [...item.reviews] : latest.recommendedReview ?? [],
        },
      }),
    );
  };

  return (
    <div className="hint-box">
      <RotateCcw size={15} aria-hidden />
      <div>
        <strong>Adaptive retry · {weakConcepts[0]?.[0] ?? latest.conceptTag}</strong>
        <div className="weak-areas">
          {weakConcepts.map(([tag, item]) => (
            <div className="weak-item" key={tag}>
              <span>{tag}</span>
              <strong>
                {item.count}회 · retry {[...item.retryTypes].slice(0, 2).join(", ") || "calculation"}
              </strong>
            </div>
          ))}
        </div>
        <ol className="step-list compact-list">
          <li>{retryPlan.step1}</li>
          <li>{retryPlan.step2}</li>
          <li>{retryPlan.step3}</li>
          <li>{retryPlan.step4}</li>
        </ol>
        <div className="visual-actions">
          <button className="primary-button" onClick={startAdaptiveRetry} type="button">
            약점 문제만 다시 풀기
          </button>
          <button className="text-button" onClick={resetCurrentQuiz} type="button">
            현재 시험 다시 풀기
          </button>
          {weakConcepts[0] && (
            <small>추천 복습: {[...weakConcepts[0][1].reviews].join(" / ") || weakConcepts[0][0]}</small>
          )}
        </div>
      </div>
    </div>
  );
}
