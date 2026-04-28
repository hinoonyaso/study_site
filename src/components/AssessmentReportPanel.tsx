import { ClipboardList, Target, TrendingDown, TrendingUp } from "lucide-react";
import type { CurriculumModule, ProgressState, WrongAnswerEntry } from "../types";

type AssessmentReportPanelProps = {
  modules: CurriculumModule[];
  progress: ProgressState;
  onOpenReviewTarget?: (target: string) => void;
};

const errorTypeLabel: Record<string, string> = {
  concept_confusion: "개념 혼동",
  formula_misunderstanding: "수식 해석 오류",
  calculation_error: "계산 오류",
  code_logic_error: "코드 로직 오류",
  visualization_misread: "시각화 해석 오류",
  robot_application_error: "로봇 적용 오류",
  system_design_error: "시스템 설계 오류",
  unit_error: "단위 오류",
  numerical_stability_error: "수치 안정성 오류",
  safety_misjudgment: "안전 판단 오류",
};

const shortTitle = (title: string) => title.replace(/^Part\s+\d+\.\s*/, "");

const isPresentString = (item: string | undefined): item is string => Boolean(item);

const unique = (items: Array<string | undefined>) => [...new Set(items.filter(isPresentString))];

const reviewTargetsFor = (entry: WrongAnswerEntry): string[] =>
  unique([...(entry.recommendedReview ?? []), entry.conceptTag, entry.sectionId]).filter((t): t is string => t != null);

export function AssessmentReportPanel({ modules, progress, onOpenReviewTarget }: AssessmentReportPanelProps) {
  const wrongAnswers = progress.wrongAnswers ?? [];
  const moduleReports = modules.map((module) => {
    const sectionIds = new Set(module.sections.map((section) => section.id));
    const scores = module.sections
      .map((section) => progress.quizScores[section.id])
      .filter((score): score is number => typeof score === "number" && score > 0);
    const completed = module.sections.filter((section) => progress.completedSections[section.id]).length;
    const wrongCount = wrongAnswers.filter((entry) => sectionIds.has(entry.sectionId)).length;
    const avg = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    const completion = Math.round((completed / module.sections.length) * 100);
    const coverage = Math.round((scores.length / module.sections.length) * 100);
    const status =
      scores.length === 0 ? "미응시" : avg >= 85 && wrongCount <= 3 ? "강점" : avg < 70 || wrongCount >= 8 ? "약점" : "보통";
    return {
      id: module.id,
      title: module.title,
      shortTitle: shortTitle(module.title),
      avg,
      completion,
      coverage,
      wrongCount,
      status,
    };
  });

  const attempted = moduleReports.filter((report) => report.coverage > 0);
  const strongest = [...attempted].sort((a, b) => b.avg - a.avg)[0];
  const weakest = [...attempted].sort((a, b) => a.avg - b.avg)[0];

  const weakByError = new Map<string, number>();
  for (const entry of wrongAnswers) {
    if (!entry.errorType) continue;
    weakByError.set(entry.errorType, (weakByError.get(entry.errorType) ?? 0) + 1);
  }
  const topErrorTypes = [...weakByError.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  const finalExamWrongs = wrongAnswers
    .filter((entry) => entry.sectionId.includes("exam_") || entry.questionId.includes("exam_"))
    .slice(-5)
    .reverse();
  const priorityReviews = unique(
    wrongAnswers
      .slice(-80)
      .reverse()
      .flatMap(reviewTargetsFor),
  ).slice(0, 6);

  if (attempted.length === 0 && wrongAnswers.length === 0) {
    return (
      <section className="panel assessment-report-panel">
        <div className="panel-heading">
          <ClipboardList size={18} aria-hidden />
          <h2>전체 진단 리포트</h2>
        </div>
        <div className="hint-box">
          퀴즈를 한 번 이상 채점하면 Part별 강점, 약점, 최종시험 복습 연결이 여기에 자동으로 쌓입니다.
        </div>
      </section>
    );
  }

  return (
    <section className="panel assessment-report-panel">
      <div className="panel-heading">
        <ClipboardList size={18} aria-hidden />
        <h2>전체 진단 리포트</h2>
      </div>

      <div className="diagnostic-summary-grid">
        <div className="diagnostic-summary-card">
          <TrendingUp size={16} aria-hidden />
          <span>강점</span>
          <strong>{strongest?.shortTitle ?? "아직 없음"}</strong>
          <small>{strongest ? `${strongest.avg}점 · ${strongest.coverage}% 응시` : "퀴즈 채점 후 표시"}</small>
        </div>
        <div className="diagnostic-summary-card is-weak">
          <TrendingDown size={16} aria-hidden />
          <span>약점</span>
          <strong>{weakest?.shortTitle ?? "아직 없음"}</strong>
          <small>{weakest ? `${weakest.avg}점 · 오답 ${weakest.wrongCount}개` : "퀴즈 채점 후 표시"}</small>
        </div>
      </div>

      <div className="diagnostic-module-list">
        {moduleReports.map((report) => (
          <div className={`diagnostic-module-row status-${report.status}`} key={report.id}>
            <div>
              <strong>{report.shortTitle}</strong>
              <small>
                {report.status} · 응시 {report.coverage}% · 완료 {report.completion}% · 오답 {report.wrongCount}개
              </small>
            </div>
            <span>{report.avg || "-"}점</span>
          </div>
        ))}
      </div>

      {topErrorTypes.length > 0 && (
        <div className="diagnostic-block">
          <div className="diagnostic-block-heading">
            <Target size={15} aria-hidden />
            <strong>반복 오답 패턴</strong>
          </div>
          {topErrorTypes.map(([type, count]) => (
            <div className="diagnostic-chip-row" key={type}>
              <span>{errorTypeLabel[type] ?? type}</span>
              <strong>{count}회</strong>
            </div>
          ))}
        </div>
      )}

      {finalExamWrongs.length > 0 && (
        <div className="diagnostic-block">
          <div className="diagnostic-block-heading">
            <Target size={15} aria-hidden />
            <strong>최종시험 복습 연결</strong>
          </div>
          {finalExamWrongs.map((entry) => (
            <div className="diagnostic-review-card" key={`${entry.questionId}-${entry.date}`}>
              <span>{entry.questionPrompt}</span>
              <div>
                {reviewTargetsFor(entry)
                  .slice(0, 3)
                  .map((target) => (
                    <button className="text-button" key={target} onClick={() => onOpenReviewTarget?.(target)} type="button">
                      {target}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {priorityReviews.length > 0 && (
        <div className="diagnostic-block">
          <div className="diagnostic-block-heading">
            <Target size={15} aria-hidden />
            <strong>우선 복습 세션</strong>
          </div>
          <div className="diagnostic-review-buttons">
            {priorityReviews.map((target) => (
              <button className="text-button" key={target} onClick={() => onOpenReviewTarget?.(target)} type="button">
                {target}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
