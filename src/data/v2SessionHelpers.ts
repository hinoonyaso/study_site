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
  cli_command: "code_logic_error",
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

const counterexampleQuiz = (seed: QuizSeed): QuizQuestionV2 => ({
  id: `${seed.id}_q12_counterexample`,
  type: "counterexample",
  difficulty: "hard",
  conceptTag: seed.conceptTag,
  question: `${seed.reviewSession}에서 "시뮬레이션이나 손계산이 맞았으니 실제 로봇에서도 바로 안전하다"는 주장에 대한 반례를 들어라.`,
  expectedAnswer:
    "모델 오차, 센서 outlier, actuator saturation, latency, 접촉 조건이 바뀌면 같은 수식도 실제 로봇에서 실패할 수 있으므로 safety gate와 재검증이 필요하다.",
  explanation:
    "반례 문제는 암기 답안을 줄이고 같은 개념을 수식, 코드, 시각화, 로봇 실패 조건으로 다시 연결하게 만든다.",
  counterexampleHint: "정상 코드 출력과 실제 하드웨어 제약이 서로 어긋나는 상황을 하나 고른다.",
  expectedFailureMode: "model mismatch, saturation, stale sensor, unsafe contact, solver infeasibility",
  wrongAnswerAnalysis: {
    commonWrongAnswer: "테스트가 통과했으니 반례가 없다고 답함",
    whyWrong: "로봇 시스템은 테스트 입력 밖의 분포 변화와 안전 제약에서 실패한다.",
    errorType: "safety_misjudgment",
    reviewSession: seed.reviewSession,
    retryQuestionType: "safety_analysis",
    recommendedReview: [seed.reviewSession],
    severity: "high",
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
  quiz(
    seed,
    "derivation",
    "q08_derivation",
    `${seed.reviewSession}의 핵심 식을 한 단계 유도하고 어떤 가정이 들어가는지 설명하라.`,
    `${seed.calculationAnswer} 유도에서는 선형화, 독립 잡음, rigid body, convex constraint 같은 가정을 명시해야 한다.`,
    "calculation",
    "hard",
  ),
  quiz(
    seed,
    "code_trace",
    "q09_code_trace",
    `${seed.reviewSession} 코드랩에서 정상 입력을 넣었을 때 어떤 중간 변수 또는 출력 shape를 먼저 확인하는가?`,
    `${seed.codeAnswer}를 실행한 뒤 핵심 중간값이 finite인지, shape와 단위가 수식의 항과 일치하는지 확인한다.`,
    "code_debug",
  ),
  quiz(
    seed,
    "safety_analysis",
    "q10_safety",
    `${seed.reviewSession} 결과가 좋아 보여도 실제 로봇에 보내기 전 막아야 하는 위험 조건은 무엇인가?`,
    "센서 outlier, actuator limit, solver infeasibility, stale timestamp, contact force 초과를 확인하고 실패 시 stop/fallback으로 보내야 한다.",
    "robot_scenario",
    "hard",
  ),
  quiz(
    seed,
    "integration_pipeline",
    "q11_integration",
    `${seed.reviewSession}을 ROS2/실험 파이프라인에 넣을 때 입력, 계산, 출력, 로그를 어떤 순서로 검증하는가?`,
    "입력 timestamp와 frame, 수식 계산값, actuator/action limit, visualization metric, 실패 로그와 fallback 동작 순서로 검증한다.",
    "system_design",
    "hard",
  ),
  counterexampleQuiz(seed),
  quiz(
    seed,
    "safety_analysis",
    "q13_deadline",
    `${seed.reviewSession}을 50Hz 제어 루프에 넣었는데 추론/계산 시간이 35ms이고 deadline이 20ms라면 어떻게 판단하는가?`,
    "deadline을 넘었으므로 stale command로 취급하고 비동기화, rate 감소, fallback controller, timeout stop 중 하나로 안전하게 처리해야 한다.",
    "integration_pipeline",
    "hard",
  ),
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
