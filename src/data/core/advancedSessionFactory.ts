import type { CodeLab, Session, VisualizationSpec } from "../../types";
import {
  ensureCodeLabShape,
  makeCoreQuizzes,
  makeEquation,
  makeVisualization,
  makeWrongTags,
  session,
  step,
} from "./v2SessionHelpers";

type EquationSpec = {
  label: string;
  expression: string;
  terms: Array<[string, string]>;
  explanation: string;
};

type QuizSpec = {
  id: string;
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

type AdvancedSessionSpec = {
  id: string;
  part: string;
  title: string;
  level?: Session["level"];
  difficulty?: Session["difficulty"];
  estimatedMinutes?: number;
  prerequisites: string[];
  objectives: string[];
  definition: string;
  whyItMatters: string;
  intuition: string;
  equations: EquationSpec[];
  derivation: Array<[string, string, string?]>;
  handCalculation: Session["theory"]["handCalculation"];
  robotApplication: string;
  lab: CodeLab;
  visualization: {
    id: string;
    title: string;
    equation: string;
    parameters: VisualizationSpec["parameters"];
    normalCase: string;
    failureCase: string;
  };
  quiz: QuizSpec;
  wrongTagLabel: string;
  wrongTagReviews?: string[];
  nextSessions: string[];
};

export const makeAdvancedSession = (spec: AdvancedSessionSpec): Session =>
  session({
    id: spec.id,
    part: spec.part,
    title: spec.title,
    level: spec.level ?? "intermediate",
    difficulty: spec.difficulty ?? "medium",
    estimatedMinutes: spec.estimatedMinutes ?? 80,
    prerequisites: spec.prerequisites,
    learningObjectives: spec.objectives,
    theory: {
      definition: spec.definition,
      whyItMatters: spec.whyItMatters,
      intuition: spec.intuition,
      equations: spec.equations.map((equation) =>
        makeEquation(equation.label, equation.expression, equation.terms, equation.explanation),
      ),
      derivation: spec.derivation.map(([title, detail, equation]) => step(title, detail, equation)),
      handCalculation: spec.handCalculation,
      robotApplication: spec.robotApplication,
    },
    codeLabs: [ensureCodeLabShape(spec.lab)],
    visualizations: [
      makeVisualization(
        spec.visualization.id,
        spec.visualization.title,
        spec.id,
        spec.visualization.equation,
        spec.lab.id,
        spec.visualization.parameters,
        spec.visualization.normalCase,
        spec.visualization.failureCase,
      ),
    ],
    quizzes: makeCoreQuizzes({
      id: spec.quiz.id,
      conceptTag: spec.id,
      reviewSession: spec.title,
      conceptQuestion: spec.quiz.conceptQuestion,
      conceptAnswer: spec.quiz.conceptAnswer,
      calculationQuestion: spec.quiz.calculationQuestion,
      calculationAnswer: spec.quiz.calculationAnswer,
      codeQuestion: spec.quiz.codeQuestion,
      codeAnswer: spec.quiz.codeAnswer,
      debugQuestion: spec.quiz.debugQuestion,
      debugAnswer: spec.quiz.debugAnswer,
      visualQuestion: spec.quiz.visualQuestion,
      visualAnswer: spec.quiz.visualAnswer,
      robotQuestion: spec.quiz.robotQuestion,
      robotAnswer: spec.quiz.robotAnswer,
      designQuestion: spec.quiz.designQuestion,
      designAnswer: spec.quiz.designAnswer,
    }),
    wrongAnswerTags: makeWrongTags(spec.id, spec.wrongTagLabel, spec.wrongTagReviews ?? spec.prerequisites),
    nextSessions: spec.nextSessions,
  });

