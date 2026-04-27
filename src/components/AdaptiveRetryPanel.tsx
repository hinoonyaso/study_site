import { RotateCcw } from "lucide-react";
import type { WrongAnswerEntry } from "../types";

const formatConceptTag = (tag?: string) => (tag === "legacy_unknown" || !tag ? "기존 문제" : tag);

const retryTypeLabel: Record<string, string> = {
  concept: "개념",
  calculation: "계산",
  derivation: "유도",
  code_completion: "코드 완성",
  code_debug: "디버깅",
  code_trace: "출력 예측",
  visualization_interpretation: "시각화 해석",
  robot_scenario: "로봇 상황",
  system_design: "시스템 설계",
  safety_analysis: "안전 판단",
  integration_pipeline: "통합 파이프라인",
  counterexample: "반례 찾기",
};

const errorTypeLabel: Record<string, string> = {
  concept_confusion: "개념 혼동",
  formula_misunderstanding: "수식 이해",
  calculation_error: "계산 오류",
  code_logic_error: "코드 로직",
  visualization_misread: "시각화 해석",
  robot_application_error: "로봇 적용",
  system_design_error: "시스템 설계",
  unit_error: "단위 오류",
  numerical_stability_error: "수치 안정성",
  safety_misjudgment: "안전 판단",
};

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
  const weakErrorTypes = [...entries.reduce((map, entry) => {
    const type = entry.errorType ?? "concept_confusion";
    const item = map.get(type) ?? {
      count: 0,
      high: 0,
      concepts: new Set<string>(),
      retryTypes: new Set<string>(),
    };
    item.count += 1;
    if (entry.severity === "high") item.high += 1;
    if (entry.conceptTag) item.concepts.add(entry.conceptTag);
    if (entry.retryQuestionType) item.retryTypes.add(String(entry.retryQuestionType));
    map.set(type, item);
    return map;
  }, new Map<string, { count: number; high: number; concepts: Set<string>; retryTypes: Set<string> }>()).entries()]
    .sort((a, b) => b[1].count + b[1].high - (a[1].count + a[1].high))
    .slice(0, 2);
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
        <strong>맞춤 재시험 · {formatConceptTag(weakConcepts[0]?.[0] ?? latest.conceptTag)}</strong>
        <div className="weak-areas">
          {weakConcepts.map(([tag, item]) => (
            <div className="weak-item" key={tag}>
              <span>{formatConceptTag(tag)}</span>
              <strong>
                {item.count}회 · 재시험 {[...item.retryTypes].slice(0, 2).map((type) => retryTypeLabel[type] ?? type).join(", ") || "계산"}
              </strong>
            </div>
          ))}
        </div>
        {weakErrorTypes.length > 0 && (
          <div className="weak-areas">
            {weakErrorTypes.map(([type, item]) => (
              <div className="weak-item" key={type}>
                <span>집중 유형 · {errorTypeLabel[type] ?? type}</span>
                <strong>
                  {item.count}회 · 관련 개념 {[...item.concepts].slice(0, 2).map(formatConceptTag).join(", ") || "기존 문제"}
                </strong>
              </div>
            ))}
          </div>
        )}
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
