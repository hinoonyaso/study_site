export type VisualizerId =
  | "linear-algebra"
  | "kalman"
  | "manipulator"
  | "mobile-odom"
  | "astar"
  | "pure-pursuit"
  | "ai-metrics"
  | "latency"
  | "sweep"
  | "retrieval-flow"
  | "physical-ai-flow"
  | "dynamics-torque"
  | "ekf-covariance"
  | "sim2real-gap"
  | "so3-rotation"
  | "quaternion-slerp"
  | "pid-step-response"
  | "particle-filter"
  | "mpc-horizon"
  | "trajectory-profile"
  | "cnn-feature-map"
  | "rl-reward"
  | "fft-spectrum"
  | "pose-graph"
  | "dwa-velocity"
  | "camera-projection"
  | "segmentation-mask"
  | "vla-architecture"
  | "world-model"
  | "lyapunov-energy"
  | "sensor-fusion"
  | "ros2-loop"
  | "robot-arm-3d"
  | "opencv-threshold"
  | "pose-estimation"
  | "depth-map"
  | "backprop-chain"
  | "svd-jacobian"
  | "foundation-model";

export type TheoryGraphId =
  | "rotation-basis"
  | "gaussian-kf"
  | "gradient-descent"
  | "covariance-ellipse"
  | "trajectory-polynomial"
  | "astar-cost"
  | "confusion-matrix"
  | "state-machine"
  | "retrieval-pipeline";

export type ExecutableLabId =
  | "unit-circle-trig"
  | "rotation-2d"
  | "homogeneous-transform"
  | "svd-pseudoinverse"
  | "two-link-fk"
  | "kalman-1d"
  | "ekf-2d"
  | "diff-drive"
  | "occupancy-log-odds"
  | "astar-grid"
  | "pure-pursuit"
  | "stanley-controller"
  | "pid-response"
  | "lqr-step"
  | "mpc-rollout"
  | "camera-projection"
  | "convolution-kernel"
  | "ai-metrics"
  | "onnx-shape-contract"
  | "latency-stats"
  | "tf-tree-latency"
  | "rosbag-metric-analyzer"
  | "particle-filter-sir"
  | "mpc-1d"
  | "trajectory-quintic"
  | "conv2d-from-scratch"
  | "q-learning-gridworld"
  | "fft-lpf"
  | "pose-graph-loop"
  | "dwa-velocity"
  | "imu-bias"
  | "segmentation-iou"
  | "vla-action-token"
  | "world-model-rollout"
  | "ros2-sub-pub-loop"
  | "opencv-contour"
  | "pnp-pose"
  | "stereo-depth"
  | "backprop-numpy"
  | "svd-jacobian-condition"
  | "ros2-control-pid";

export type Formula = {
  label: string;
  expression: string;
  description: string;
};

export type WorkedExample = {
  prompt: string;
  steps: string[];
  result: string;
};

export type TheoryFigure = {
  id: TheoryGraphId;
  title: string;
  explanation: string;
};

export type TheoryUnit = {
  id: string;
  title: string;
  summary: string;
  intuition: string;
  assumptions: string[];
  details: string[];
  formulas: Formula[];
  derivation: string[];
  proof: string[];
  engineeringMeaning: string[];
  implementationNotes: string[];
  figures: TheoryFigure[];
  graphExplanations: string[];
  workedExample?: WorkedExample;
  commonMistakes: string[];
  sourceIds: string[];
  readingGuide?: string[];
};

export type QuizDifficulty = "기초" | "계산" | "유도" | "전문";

export type QuizQuestion = {
  id: string;
  type: "choice" | "trueFalse" | "blank" | "numeric" | "formulaBlank" | "derivationStep" | "codeTrace";
  prompt: string;
  difficulty?: QuizDifficulty;
  choices?: string[];
  answer: string;
  acceptedExpressions?: string[];
  numericAnswer?: number;
  tolerance?: number;
  expectedSteps?: string[];
  codeSnippet?: string;
  expectedTrace?: string;
  hint?: string;
  formulaSymbols?: string[];
  points?: number;
  explanation: string;
};

export type PracticeParameter = {
  name: string;
  defaultValue: string;
  unit: string;
  description: string;
};

export type CodeExample = {
  id: string;
  title: string;
  language: "cpp" | "python";
  starterCode: string;
  solutionCode: string;
  explanation: string;
  checks: string[];
  sourceIds: string[];
};

export type EquationBlock = {
  label: string;
  expression: string;
  terms: Array<{
    symbol: string;
    meaning: string;
  }>;
  explanation: string;
};

export type DerivationStep = {
  title: string;
  detail: string;
  equation?: string;
};

export type HandCalculation = {
  problem: string;
  given: Record<string, string | number>;
  steps: string[];
  answer: string;
};

export type CodeLab = {
  id: string;
  title: string;
  language: "python" | "cpp" | "javascript";
  theoryConnection: string;
  starterCode: string;
  solutionCode: string;
  testCode: string;
  expectedOutput: string;
  runCommand: string;
  commonBugs: string[];
  extensionTask: string;
};

export type QuizQuestionTypeV2 =
  | "concept"
  | "calculation"
  | "derivation"
  | "code_completion"
  | "code_debug"
  | "code_trace"
  | "visualization_interpretation"
  | "robot_scenario"
  | "system_design"
  | "safety_analysis"
  | "integration_pipeline"
  | "counterexample";

export type ErrorType =
  | "concept_confusion"
  | "formula_misunderstanding"
  | "calculation_error"
  | "code_logic_error"
  | "visualization_misread"
  | "robot_application_error"
  | "system_design_error"
  | "unit_error"
  | "numerical_stability_error"
  | "safety_misjudgment";

export type ErrorSeverity = "low" | "medium" | "high";

export type WrongAnswerAnalysis = {
  commonWrongAnswer: string;
  whyWrong: string;
  errorType: ErrorType;
  reviewSession: string;
  retryQuestionType: QuizQuestionTypeV2 | "calculation";
  recommendedReview?: string[];
  severity?: ErrorSeverity;
};

export type QuizQuestionV2 = {
  id: string;
  examId?: string;
  type: QuizQuestionTypeV2;
  difficulty: "easy" | "medium" | "hard";
  conceptTag: string;
  question: string;
  choices?: string[];
  expectedAnswer: string;
  explanation: string;
  stepByStepExplanation?: string[];
  codeSnippet?: string;
  points?: number;
  counterexampleHint?: string;
  expectedFailureMode?: string;
  wrongAnswerAnalysis: WrongAnswerAnalysis;
};

export type VisualizationSpec = {
  id: string;
  title: string;
  conceptTag: string;
  parameters: Array<{
    name: string;
    symbol: string;
    min: number;
    max: number;
    default: number;
    description: string;
  }>;
  connectedEquation: string;
  connectedCodeLab: string;
  normalCase: string;
  failureCase: string;
  interpretationQuestions: string[];
};

export type WrongAnswerTag = {
  conceptTag: string;
  label: string;
  errorTypes: ErrorType[];
  reviewSessions: string[];
  remediation: string;
};

export type SessionFlashcard = {
  id: string;
  front: string;
  back: string;
  conceptTag?: string;
};

export type Session = {
  id: string;
  part: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  difficulty?: "easy" | "medium" | "hard";
  estimatedMinutes?: number;
  prerequisites: string[];
  learningObjectives: string[];
  theory: {
    definition: string;
    whyItMatters: string;
    intuition: string;
    equations: EquationBlock[];
    derivation: DerivationStep[];
    handCalculation: HandCalculation;
    robotApplication: string;
  };
  codeLabs: CodeLab[];
  visualizations: VisualizationSpec[];
  quizzes: QuizQuestionV2[];
  wrongAnswerTags: WrongAnswerTag[];
  flashcards?: SessionFlashcard[];
  commonMistakes?: string[];
  realWorldUseCase?: string;
  extensionTask?: string;
  nextSessions: string[];
};

export type PracticeBlock = {
  goal: string;
  code: string;
  starterCode?: string;
  solutionCode?: string;
  expected: string;
  expectedOutput?: string;
  tasks: string[];
  parameters: PracticeParameter[];
  checks?: string[];
  simulationId?: VisualizerId;
  executableJsStarter?: string;
  executableJsSolution?: string;
  expectedResultShape?: string;
  examples?: CodeExample[];
};

export type ResourceLink = {
  title: string;
  url: string;
  domain: string;
  note: string;
};

export type SourceCatalogItem = {
  id: string;
  title: string;
  url: string;
  domain: string;
  level: "기초" | "중급" | "고급" | "레퍼런스";
  tags: string[];
  sourceType: "공식문서" | "교재" | "강의" | "튜토리얼" | "도구문서" | "제품문서";
  recommendedFor: string[];
  note: string;
};

export type CommandCheat = {
  label: string;
  command: string;
  description: string;
  domain: string;
};

export type KnowledgeEdge = {
  from: string;
  to: string;
  label: string;
};

export type LessonSection = {
  id: string;
  title: string;
  focus: string;
  level?: number;
  parentId?: string;
  groupTitle?: string;
  theory: TheoryUnit[];
  why: string[];
  cppPractice: PracticeBlock;
  pythonPractice: PracticeBlock;
  quiz: QuizQuestion[];
  visualizerId?: VisualizerId;
  graphIds?: TheoryGraphId[];
  executableLabId?: ExecutableLabId;
  v2Session?: Session;
  visualizationSpecs?: VisualizationSpec[];
  sourceIds?: string[];
  cheats?: CommandCheat[];
  prerequisiteIds?: string[];
  scenarioTags?: string[];
  checklist: string[];
  resources?: ResourceLink[];
};

export type CurriculumModule = {
  id: string;
  title: string;
  summary: string;
  sections: LessonSection[];
};

export type SrsCard = {
  ease: number;
  interval: number;
  nextReview: string;
  repetitions: number;
};

export type StudyLogEntry = {
  date: string;
  sectionId: string;
  durationMs: number;
};

export type QuizHistoryEntry = {
  date: string;
  sectionId: string;
  score: number;
};

export type WrongAnswerEntry = {
  date: string;
  sectionId: string;
  questionId: string;
  questionPrompt: string;
  myAnswer: string;
  correctAnswer: string;
  explanation: string;
  relatedFormula?: string;
  conceptTag?: string;
  errorType?: ErrorType;
  severity?: ErrorSeverity;
  recommendedReview?: string[];
  retryPlan?: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
  retryQuestionType?: QuizQuestionTypeV2 | string;
};

export type ProgressState = {
  completedSections: Record<string, boolean>;
  quizScores: Record<string, number>;
  checklist: Record<string, Record<string, boolean>>;
  userCode: Record<string, Record<string, string>>;
  quizAnswers: Record<string, Record<string, string>>;
  notes: Record<string, string>;
  srsCards: Record<string, SrsCard>;
  studyLog: StudyLogEntry[];
  quizHistory: QuizHistoryEntry[];
  wrongAnswers: WrongAnswerEntry[];
};

export const emptyProgress: ProgressState = {
  completedSections: {},
  quizScores: {},
  checklist: {},
  userCode: {},
  quizAnswers: {},
  notes: {},
  srsCards: {},
  studyLog: [],
  quizHistory: [],
  wrongAnswers: [],
};
