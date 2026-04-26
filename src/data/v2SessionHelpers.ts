import type {
  CodeLab,
  DerivationStep,
  EquationBlock,
  ErrorType,
  QuizQuestionTypeV2,
  QuizQuestionV2,
  Session,
  VisualizationSpec,
  WrongAnswerTag,
} from "../types";
import { attachCppCompanionLabs } from "./cppCompanionLabs";

type QuizSeed = {
  id: string;
  conceptTag: string;
  reviewSession: string;
  conceptQuestion: string;
  conceptAnswer: string;
  calculationQuestion: string;
  calculationAnswer: string;
  codeQuestion: string;
  codeAnswer: string;
  debugQuestion: string;
  debugAnswer: string;
  visualQuestion: string;
  visualAnswer: string;
  robotQuestion: string;
  robotAnswer: string;
  designQuestion: string;
  designAnswer: string;
};

const errorTypeByQuestionType: Record<Exclude<QuizQuestionTypeV2, "counterexample">, ErrorType> = {
  concept: "concept_confusion",
  calculation: "calculation_error",
  derivation: "formula_misunderstanding",
  code_completion: "code_logic_error",
  code_debug: "code_logic_error",
  code_trace: "code_logic_error",
  visualization_interpretation: "visualization_misread",
  robot_scenario: "robot_application_error",
  system_design: "system_design_error",
  safety_analysis: "safety_misjudgment",
  integration_pipeline: "system_design_error",
};

const quiz = (
  seed: QuizSeed,
  type: Exclude<QuizQuestionTypeV2, "counterexample">,
  suffix: string,
  question: string,
  expectedAnswer: string,
  retryQuestionType: QuizQuestionTypeV2,
  difficulty: QuizQuestionV2["difficulty"] = "medium",
): QuizQuestionV2 => ({
  id: `${seed.id}_${suffix}`,
  type,
  difficulty,
  conceptTag: seed.conceptTag,
  question,
  expectedAnswer,
  explanation: `${expectedAnswer} 이 답은 ${seed.reviewSession}의 핵심 식과 로봇 적용 조건을 함께 확인한다.`,
  wrongAnswerAnalysis: {
    commonWrongAnswer: "수식의 항을 하나의 숫자 계산으로만 보고 물리적 의미를 설명하지 않음",
    whyWrong: "Physical AI 실습에서는 숫자, 코드 출력, 시각화, 로봇 상황이 같은 개념 태그로 연결되어야 한다.",
    errorType: errorTypeByQuestionType[type],
    reviewSession: seed.reviewSession,
    retryQuestionType,
    recommendedReview: [seed.reviewSession],
    severity: type === "robot_scenario" || type === "system_design" ? "high" : "medium",
  },
});

export const makeCoreQuizzes = (seed: QuizSeed): QuizQuestionV2[] => [
  quiz(seed, "concept", "q01_concept", seed.conceptQuestion, seed.conceptAnswer, "calculation", "easy"),
  quiz(seed, "calculation", "q02_calculation", seed.calculationQuestion, seed.calculationAnswer, "calculation"),
  quiz(seed, "code_completion", "q03_code_completion", seed.codeQuestion, seed.codeAnswer, "code_debug"),
  quiz(seed, "code_debug", "q04_code_debug", seed.debugQuestion, seed.debugAnswer, "code_completion"),
  quiz(seed, "visualization_interpretation", "q05_visual", seed.visualQuestion, seed.visualAnswer, "calculation"),
  quiz(seed, "robot_scenario", "q06_robot", seed.robotQuestion, seed.robotAnswer, "visualization_interpretation", "hard"),
  quiz(seed, "system_design", "q07_design", seed.designQuestion, seed.designAnswer, "robot_scenario", "hard"),
];

export const makeWrongTags = (conceptTag: string, label: string, reviewSessions: string[]): WrongAnswerTag[] => [
  {
    conceptTag,
    label,
    errorTypes: [
      "concept_confusion",
      "formula_misunderstanding",
      "calculation_error",
      "code_logic_error",
      "visualization_misread",
      "robot_application_error",
      "system_design_error",
      "unit_error",
      "numerical_stability_error",
      "safety_misjudgment",
    ],
    reviewSessions,
    remediation: "정의와 수식 항 의미를 다시 읽고, 손계산 1회와 코드랩 테스트 1회를 같은 입력값으로 재실행한다.",
  },
];

export const makeVisualization = (
  id: string,
  title: string,
  conceptTag: string,
  connectedEquation: string,
  connectedCodeLab: string,
  parameters: VisualizationSpec["parameters"],
  normalCase: string,
  failureCase: string,
): VisualizationSpec => ({
  id,
  title,
  conceptTag,
  parameters,
  connectedEquation,
  connectedCodeLab,
  normalCase,
  failureCase,
  interpretationQuestions: [
    `${title}에서 정상 상황과 실패 상황을 가르는 파라미터 조합을 설명하라.`,
    `${connectedEquation}의 어떤 항이 슬라이더 변화와 직접 연결되는지 말하라.`,
  ],
});

export const makeEquation = (
  label: string,
  expression: string,
  terms: Array<[string, string]>,
  explanation: string,
): EquationBlock => ({
  label,
  expression,
  terms: terms.map(([symbol, meaning]) => ({ symbol, meaning })),
  explanation,
});

export const step = (title: string, detail: string, equation?: string): DerivationStep => ({
  title,
  detail,
  equation,
});

export const session = (item: Session): Session => attachCppCompanionLabs(item);

export const ensureCodeLabShape = (lab: CodeLab): CodeLab => lab;
