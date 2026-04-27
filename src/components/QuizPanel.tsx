import { useEffect, useMemo, useState } from "react";
import { Award, RotateCcw } from "lucide-react";
import { DifficultyBadge, FormulaInputToolbar, FormulaPreview } from "./FormulaTools";
import { MathText } from "./KatexRenderer";
import type { LessonSection, QuizQuestionV2, WrongAnswerEntry } from "../types";

type QuizPanelProps = {
  section: LessonSection;
  bestScore: number;
  onSaveScore: (score: number) => void;
  savedAnswers: Record<string, string>;
  onSaveAnswer: (questionId: string, answer: string) => void;
  onResetAnswers: () => void;
  onRecordWrongAnswers?: (entries: WrongAnswerEntry[]) => void;
};

const normalizeExpression = (value: string) =>
  value
    .toLowerCase()
    .replace(/θ/g, "theta")
    .replace(/λ/g, "lambda")
    .replace(/ω/g, "omega")
    .replace(/μ/g, "mu")
    .replace(/∂/g, "d")
    .replace(/π/g, "pi")
    .replace(/ /g, "")
    .replace(/\*/g, "")
    .replace(/·/g, "")
    .replace(/_/g, "")
    .replace(/[{}[\](),]/g, "");

const v2QuestionPoints = (question: QuizQuestionV2) =>
  question.points ?? (question.type === "system_design" || question.type === "robot_scenario" ? 2 : 1);

const v2QuestionTypeLabel: Record<QuizQuestionV2["type"], string> = {
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

const v2DifficultyLabel: Record<QuizQuestionV2["difficulty"], "기초" | "계산" | "전문"> = {
  easy: "기초",
  medium: "계산",
  hard: "전문",
};

const v2ErrorTypeLabel: Record<QuizQuestionV2["wrongAnswerAnalysis"]["errorType"], string> = {
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

const gradeV2Question = (question: QuizQuestionV2, answer: string) => {
  const normalized = normalizeExpression(answer);
  if (question.choices?.length) return answer.trim() === question.expectedAnswer.trim() ? v2QuestionPoints(question) : 0;
  const expectedTokens = question.expectedAnswer
    .split(/[\s,./()=]+/)
    .map(normalizeExpression)
    .filter((token) => token.length >= 3);
  const hits = expectedTokens.filter((token) => normalized.includes(token)).length;
  if (normalized.length >= 12 && hits >= Math.min(3, expectedTokens.length)) return v2QuestionPoints(question);
  return normalized === normalizeExpression(question.expectedAnswer) ? v2QuestionPoints(question) : 0;
};

function QuizPanelV2({
  section,
  bestScore,
  onSaveScore,
  savedAnswers,
  onSaveAnswer,
  onResetAnswers,
  onRecordWrongAnswers,
}: QuizPanelProps) {
  const questions = section.v2Session?.quizzes ?? [];
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers);
  const [submitted, setSubmitted] = useState(false);
  const [retryFilter, setRetryFilter] = useState<{
    conceptTag: string;
    retryTypes: string[];
    reviews: string[];
  } | null>(null);

  useEffect(() => {
    setAnswers(savedAnswers);
    setSubmitted(false);
    setRetryFilter(null);
  }, [savedAnswers, section.id]);

  const activeQuestions = useMemo(() => {
    if (!retryFilter) return questions;
    const retryTypes = new Set(retryFilter.retryTypes);
    const exact = questions.filter(
      (question) => question.conceptTag === retryFilter.conceptTag && (retryTypes.size === 0 || retryTypes.has(question.type)),
    );
    const sameConcept = questions.filter(
      (question) => question.conceptTag === retryFilter.conceptTag && !exact.some((item) => item.id === question.id),
    );
    const sameType = questions.filter(
      (question) =>
        retryTypes.has(question.type) &&
        question.conceptTag !== retryFilter.conceptTag &&
        !exact.some((item) => item.id === question.id) &&
        !sameConcept.some((item) => item.id === question.id),
    );
    const ordered = [...exact, ...sameConcept, ...sameType];
    return ordered.length > 0 ? ordered : questions;
  }, [questions, retryFilter]);

  const score = useMemo(() => {
    const earned = activeQuestions.reduce((sum, question) => sum + gradeV2Question(question, answers[question.id] ?? ""), 0);
    const total = activeQuestions.reduce((sum, question) => sum + v2QuestionPoints(question), 0);
    return total === 0 ? 0 : Math.round((earned / total) * 100);
  }, [answers, activeQuestions]);

  const setAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    onSaveAnswer(questionId, answer);
  };

  const submit = () => {
    setSubmitted(true);
    onSaveScore(score);
    const today = new Date().toISOString().slice(0, 10);
    const wrongAnswers = activeQuestions
      .filter((question) => gradeV2Question(question, answers[question.id] ?? "") < v2QuestionPoints(question))
      .map((question) => ({
        date: today,
        sectionId: section.id,
        questionId: question.id,
        questionPrompt: question.question,
        myAnswer: answers[question.id] ?? "",
        correctAnswer: question.expectedAnswer,
        explanation: [
          question.explanation,
          ...(question.stepByStepExplanation ?? []),
          question.wrongAnswerAnalysis.whyWrong,
        ].join(" "),
        conceptTag: question.conceptTag,
        errorType: question.wrongAnswerAnalysis.errorType,
        severity: question.wrongAnswerAnalysis.severity ?? "medium",
        recommendedReview: question.wrongAnswerAnalysis.recommendedReview ?? [question.wrongAnswerAnalysis.reviewSession],
        retryPlan: {
          step1: "더 쉬운 수식 해석 문제",
          step2: "손계산 문제",
          step3: "시각화 해석 문제",
          step4: "로봇 상황 판단 문제",
        },
        retryQuestionType: question.wrongAnswerAnalysis.retryQuestionType,
      }));
    onRecordWrongAnswers?.(wrongAnswers);
  };

  useEffect(() => {
    const handler = () => submit();
    window.addEventListener("physical-ai:submit-quiz", handler);
    return () => window.removeEventListener("physical-ai:submit-quiz", handler);
  }, [answers, score, section, activeQuestions]);

  useEffect(() => {
    const handler = () => {
      setAnswers({});
      setSubmitted(false);
      setRetryFilter(null);
      onResetAnswers();
      window.requestAnimationFrame(() => document.querySelector(".quiz-list")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    window.addEventListener("physical-ai:reset-quiz", handler);
    return () => window.removeEventListener("physical-ai:reset-quiz", handler);
  }, [onResetAnswers, section.id]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ conceptTag?: string; retryTypes?: string[]; reviews?: string[] }>).detail;
      if (!detail?.conceptTag) return;
      setAnswers({});
      setSubmitted(false);
      setRetryFilter({
        conceptTag: detail.conceptTag,
        retryTypes: detail.retryTypes ?? [],
        reviews: detail.reviews ?? [],
      });
      window.requestAnimationFrame(() => document.querySelector(".quiz-list")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    window.addEventListener("physical-ai:start-adaptive-retry", handler);
    return () => window.removeEventListener("physical-ai:start-adaptive-retry", handler);
  }, [onResetAnswers]);

  return (
    <section className="panel">
      <div className="quiz-header">
        <div className="panel-heading">
          <Award size={18} aria-hidden />
          <h2>시험</h2>
        </div>
        <div className="score-pill">최고 {bestScore}점</div>
      </div>
      {retryFilter && (
        <div className="hint-box">
          맞춤 재시험 · {retryFilter.conceptTag} · {activeQuestions.length}/{questions.length}문항
          {retryFilter.reviews.length > 0 && <small>추천 복습: {retryFilter.reviews.join(" / ")}</small>}
          <button className="text-button" onClick={() => setRetryFilter(null)} type="button">
            전체 문제로 돌아가기
          </button>
        </div>
      )}
      <div className="quiz-list">
        {activeQuestions.map((question, index) => {
          const answer = answers[question.id] ?? "";
          const earned = gradeV2Question(question, answer);
          const maxPoints = v2QuestionPoints(question);
          const isCorrect = earned === maxPoints;
          return (
            <div className="quiz-item" key={question.id}>
              <div className="question-title">
                <span>{index + 1}</span>
                <div>
                  <div className="question-meta">
                    <DifficultyBadge difficulty={v2DifficultyLabel[question.difficulty]} />
                    <small className="question-type-tag">{v2QuestionTypeLabel[question.type]}</small>
                    <small>{maxPoints}점</small>
                  </div>
                  <strong><MathText text={question.question} /></strong>
                </div>
              </div>
              {question.codeSnippet && (
                <pre className="code-block quiz-code">
                  <code>{question.codeSnippet}</code>
                </pre>
              )}
              {question.type === "counterexample" && question.counterexampleHint && (
                <div className="hint-box">
                  반례 힌트: <MathText text={question.counterexampleHint} />
                </div>
              )}
              {question.choices?.length ? (
                <div className="choice-list">
                  {question.choices.map((choice) => (
                    <label className="choice" key={choice}>
                      <input checked={answer === choice} name={question.id} onChange={() => setAnswer(question.id, choice)} type="radio" />
                      <span><MathText text={choice} /></span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  aria-label={`${index + 1}번 답`}
                  className="text-area"
                  onChange={(event) => setAnswer(question.id, event.target.value)}
                  placeholder="원인 → 수식/코드 → 로봇 적용 순서로 답하세요"
                  value={answer}
                />
              )}
              {submitted && (
                <div className={isCorrect ? "feedback is-correct" : "feedback is-wrong"}>
                  <strong>
                    {isCorrect ? `정답 · ${maxPoints}점` : `부분/오답 · ${earned.toFixed(1)}/${maxPoints}점 · 기준답: ${question.expectedAnswer}`}
                  </strong>
                  <span><MathText text={question.explanation} /></span>
                  {(question.stepByStepExplanation?.length ?? 0) > 0 && (
                    <ol className="step-list compact-list">
                      {question.stepByStepExplanation?.map((step) => (
                        <li key={step}><MathText text={step} /></li>
                      ))}
                    </ol>
                  )}
                  {question.expectedFailureMode && (
                    <small>실패 모드: <MathText text={question.expectedFailureMode} /></small>
                  )}
                  {!isCorrect && (
                    <small>
                      오답 유형: {v2ErrorTypeLabel[question.wrongAnswerAnalysis.errorType]} · 복습: {question.wrongAnswerAnalysis.reviewSession}
                    </small>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="quiz-actions">
        <button className="primary-button" onClick={submit} type="button">채점하기</button>
        <button className="icon-button text-button" onClick={() => { setAnswers({}); setSubmitted(false); onResetAnswers(); }} type="button">
          <RotateCcw size={16} aria-hidden />
          다시 풀기
        </button>
        {submitted && <strong className="score-result">이번 점수 {score}점</strong>}
      </div>
    </section>
  );
}

export function QuizPanel(props: QuizPanelProps) {
  if (props.section.v2Session) return <QuizPanelV2 {...props} />;
  return <QuizPanelLegacy {...props} />;
}

function QuizPanelLegacy({
  section,
  bestScore,
  onSaveScore,
  savedAnswers,
  onSaveAnswer,
  onResetAnswers,
  onRecordWrongAnswers,
}: QuizPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers(savedAnswers);
    setSubmitted(false);
  }, [savedAnswers, section.id]);

  const questionPoints = (question: (typeof section.quiz)[number]) => question.points ?? 1;

  const gradeQuestion = (question: (typeof section.quiz)[number], answer: string) => {
    const normalized = answer.trim().toLowerCase();
    if (question.type === "numeric" && typeof question.numericAnswer === "number") {
      const value = Number(normalized);
      if (!Number.isFinite(value)) return 0;
      return Math.abs(value - question.numericAnswer) <= (question.tolerance ?? 0) ? questionPoints(question) : 0;
    }
    if (question.type === "derivationStep" && question.expectedSteps?.length) {
      const normalizedAnswer = normalizeExpression(answer);
      const hitCount = question.expectedSteps.filter((step) => {
        const key = normalizeExpression(step.split("=")[0] || step);
        return key.length > 1 && normalizedAnswer.includes(key.slice(0, Math.min(key.length, 8)));
      }).length;
      return (hitCount / question.expectedSteps.length) * questionPoints(question);
    }
    if (question.type === "codeTrace" && question.expectedTrace) {
      const hits = question.expectedTrace
        .toLowerCase()
        .split(/\s+/)
        .filter((token) => token.length > 3)
        .filter((token) => normalized.includes(token)).length;
      return hits >= 2 || normalized === question.answer.trim().toLowerCase() ? questionPoints(question) : 0;
    }
    if (question.type === "formulaBlank" || question.type === "blank") {
      const accepted = [question.answer, ...(question.acceptedExpressions ?? [])].map(normalizeExpression);
      return accepted.includes(normalizeExpression(answer)) ? questionPoints(question) : 0;
    }
    return normalized === question.answer.trim().toLowerCase() ? questionPoints(question) : 0;
  };

  const score = useMemo(() => {
    const earned = section.quiz.reduce((sum, question) => sum + gradeQuestion(question, answers[question.id] ?? ""), 0);
    const total = section.quiz.reduce((sum, question) => sum + questionPoints(question), 0);
    return Math.round((earned / total) * 100);
  }, [answers, section.quiz]);

  const setAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    onSaveAnswer(questionId, answer);
  };

  const submit = () => {
    setSubmitted(true);
    onSaveScore(score);
    const today = new Date().toISOString().slice(0, 10);
    const relatedFormula = section.theory.flatMap((unit) => unit.formulas)[0]?.expression;
    const wrongAnswers = section.quiz
      .filter((question) => gradeQuestion(question, answers[question.id] ?? "") < questionPoints(question))
      .map((question) => ({
        date: today,
        sectionId: section.id,
        questionId: question.id,
        questionPrompt: question.prompt,
        myAnswer: answers[question.id] ?? "",
        correctAnswer: question.answer,
        explanation: question.explanation,
        relatedFormula,
      }));
    onRecordWrongAnswers?.(wrongAnswers);
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    onResetAnswers();
  };

  useEffect(() => {
    const handler = () => submit();
    window.addEventListener("physical-ai:submit-quiz", handler);
    return () => window.removeEventListener("physical-ai:submit-quiz", handler);
  }, [answers, score, section]);

  return (
    <section className="panel">
      <div className="quiz-header">
        <div className="panel-heading">
          <Award size={18} aria-hidden />
          <h2>시험</h2>
        </div>
        <div className="score-pill">최고 {bestScore}점</div>
      </div>

      <div className="quiz-list">
        {section.quiz.map((question, index) => {
          const answer = answers[question.id] ?? "";
          const earned = gradeQuestion(question, answer);
          const maxPoints = questionPoints(question);
          const isCorrect = earned === maxPoints;
          return (
            <div className="quiz-item" key={question.id}>
              <div className="question-title">
                <span>{index + 1}</span>
                <div>
                  <div className="question-meta">
                    <DifficultyBadge difficulty={question.difficulty} />
                    <small>{maxPoints}점</small>
                  </div>
                  <strong><MathText text={question.prompt} /></strong>
                </div>
              </div>

              {question.hint && <div className="hint-box">힌트: <MathText text={question.hint} /></div>}

              {question.codeSnippet && (
                <pre className="code-block quiz-code">
                  <code>{question.codeSnippet}</code>
                </pre>
              )}

              {question.type === "blank" || question.type === "numeric" || question.type === "formulaBlank" ? (
                <div className="formula-answer">
                  <FormulaInputToolbar onInsert={(token) => setAnswer(question.id, `${answer}${token}`)} />
                  {question.formulaSymbols && (
                    <div className="symbol-row">
                      {question.formulaSymbols.map((symbol) => (
                        <button key={symbol} onClick={() => setAnswer(question.id, `${answer}${symbol}`)} type="button">
                          {symbol}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    aria-label={`${index + 1}번 답`}
                    className="text-input"
                    onChange={(event) => setAnswer(question.id, event.target.value)}
                    placeholder="답 입력"
                    value={answer}
                  />
                  <FormulaPreview value={answer} />
                </div>
              ) : question.type === "derivationStep" || question.type === "codeTrace" ? (
                <div className="formula-answer">
                  <FormulaInputToolbar onInsert={(token) => setAnswer(question.id, `${answer}${token}`)} />
                  <textarea
                    aria-label={`${index + 1}번 풀이`}
                    className="text-area"
                    onChange={(event) => setAnswer(question.id, event.target.value)}
                    placeholder="풀이 단계 또는 추적 결과 입력"
                    value={answer}
                  />
                  <FormulaPreview value={answer} />
                </div>
              ) : (
                <div className="choice-list">
                  {question.choices?.map((choice) => (
                    <label className="choice" key={choice}>
                      <input
                        checked={answer === choice}
                        name={question.id}
                        onChange={() => setAnswer(question.id, choice)}
                        type="radio"
                      />
                      <span><MathText text={choice} /></span>
                    </label>
                  ))}
                </div>
              )}

              {submitted && (
                <div className={isCorrect ? "feedback is-correct" : "feedback is-wrong"}>
                  <strong>
                    {isCorrect
                      ? `정답 · ${maxPoints}점`
                      : `부분/오답 · ${earned.toFixed(1)}/${maxPoints}점 · 기준답: ${question.answer}`}
                  </strong>
                  <span><MathText text={question.explanation} /></span>
                  {question.expectedSteps && (
                    <ol className="step-list compact-list">
                      {question.expectedSteps.map((step) => (
                        <li key={step}><MathText text={step} /></li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="quiz-actions">
        <button className="primary-button" onClick={submit} type="button">
          채점하기
        </button>
        <button className="icon-button text-button" onClick={reset} type="button">
          <RotateCcw size={16} aria-hidden />
          다시 풀기
        </button>
        {submitted && <strong className="score-result">이번 점수 {score}점</strong>}
      </div>
    </section>
  );
}
