import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync("src/data/curriculumV2.ts", "utf8");
const legacySource = fs.readFileSync("src/data/curriculum.ts", "utf8");
const types = fs.readFileSync("src/types.ts", "utf8");
const moduleCache = new Map();

const loadTsModule = (filePath) => {
  const absPath = path.resolve(filePath);
  if (moduleCache.has(absPath)) return moduleCache.get(absPath).exports;
  const module = { exports: {} };
  moduleCache.set(absPath, module);
  const moduleSource = fs.readFileSync(absPath, "utf8");
  const transpiled = ts.transpileModule(moduleSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      strict: false,
    },
  }).outputText;
  const localRequire = (specifier) => {
    if (specifier.startsWith(".")) {
      const resolved = path.resolve(path.dirname(absPath), specifier);
      const tsPath = fs.existsSync(`${resolved}.ts`) ? `${resolved}.ts` : fs.existsSync(path.join(resolved, "index.ts")) ? path.join(resolved, "index.ts") : resolved;
      return loadTsModule(tsPath);
    }
    return {};
  };
  vm.runInNewContext(
    transpiled,
    { module, exports: module.exports, require: localRequire, console, process },
    { filename: absPath },
  );
  return module.exports;
};

const curriculumModule = loadTsModule("src/data/curriculumV2.ts");
const curriculum = curriculumModule.curriculum;
const allSections = curriculum.flatMap((item) => item.sections);
const sections = allSections.filter((section) => !section.v2Session);
const v2Sections = allSections.filter((section) => section.v2Session);
const v2Sessions = curriculumModule.v2Sessions;
const v2VisualizationCatalog = curriculumModule.v2VisualizationCatalog;
const sourceCatalog = loadTsModule("src/data/sourceCatalog.ts").sourceCatalog;
const failed = [];

const assert = (name, ok, detail = "") => {
  console.log(`${ok ? "OK" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`);
  if (!ok) failed.push(name);
};

assert("module count", curriculum.length >= 13, `${curriculum.length} modules`);
assert("micro session count", sections.length >= 100, `${sections.length} sessions`);
assert("source catalog count", sourceCatalog.length >= 150, `${sourceCatalog.length} sources`);
const duplicateUrls = sourceCatalog
  .map((source) => source.url)
  .filter((url, index, all) => all.indexOf(url) !== index);
assert("source catalog has unique URLs", duplicateUrls.length === 0, duplicateUrls.slice(0, 4).join(", "));
assert(
  "v4 type fields",
  types.includes("TheoryGraphId") &&
    types.includes("ExecutableLabId") &&
    types.includes("figures") &&
    types.includes("executableJsStarter"),
);
assert(
  "v7 public types",
  types.includes("SourceCatalogItem") &&
    types.includes("CodeExample") &&
    types.includes("readingGuide") &&
    types.includes("sourceIds?: string[]"),
);
assert("section expansion enabled", legacySource.includes("microTopicsBySection") && legacySource.includes("flatMap(expandSections)"));
assert("mini graph component", fs.existsSync("src/components/MiniGraph.tsx"));
assert("executable lab component", fs.existsSync("src/components/ExecutableLab.tsx"));
assert("KaTeX renderer", fs.existsSync("src/components/KatexRenderer.tsx"));
assert("knowledge map component", fs.existsSync("src/components/KnowledgeMap.tsx"));
assert("source catalog panel", fs.existsSync("src/components/SourceCatalogPanel.tsx"));
assert("v2 session count", v2Sessions.length >= 12, `${v2Sessions.length} v2 sessions`);
assert("v2 sections are first-class", v2Sections.length >= 12, `${v2Sections.length} adapted sections`);
[
  "src/data/mathFoundationSessions.ts",
  "src/data/robotMathSessions.ts",
  "src/data/dynamicsControlSessions.ts",
  "src/data/autonomousDrivingSessions.ts",
  "src/data/robotVisionSessions.ts",
  "src/data/ros2Sessions.ts",
  "src/data/physicalAISessions.ts",
  "src/data/safetySystemSessions.ts",
  "src/data/integrationProjectSessions.ts",
  "src/data/finalExamQuestions.ts",
].forEach((file) => assert(`v2 data file exists: ${file}`, fs.existsSync(file)));

const coreQuizTypes = [
  "concept",
  "calculation",
  "code_completion",
  "code_debug",
  "visualization_interpretation",
  "robot_scenario",
  "system_design",
];
const badV2QuizTypes = v2Sessions.filter((session) => {
  const types = new Set(session.quizzes.map((question) => question.type));
  return !coreQuizTypes.every((type) => types.has(type));
});
assert("v2 sessions have 7 core quiz types", badV2QuizTypes.length === 0, badV2QuizTypes.map((session) => session.id).join(", "));

const badV2Labs = v2Sessions.flatMap((session) =>
  session.codeLabs
    .filter((lab) => !lab.testCode.trim() || lab.starterCode.trim() === lab.solutionCode.trim())
    .map((lab) => `${session.id}:${lab.id}`),
);
assert("v2 code labs split starter/solution/test", badV2Labs.length === 0, badV2Labs.slice(0, 4).join(", "));

const badV2ConceptTags = v2Sessions.filter(
  (session) =>
    session.quizzes.some((question) => !question.conceptTag || !question.wrongAnswerAnalysis?.errorType) ||
    session.wrongAnswerTags.length === 0,
);
assert("v2 conceptTag and errorType coverage", badV2ConceptTags.length === 0, badV2ConceptTags.map((session) => session.id).join(", "));

const badV2VisualLinks = v2Sessions.filter((session) =>
  session.visualizations.some(
    (visualization) =>
      !visualization.connectedCodeLab ||
      !session.codeLabs.some((lab) => lab.id === visualization.connectedCodeLab) ||
      !session.quizzes.some((quiz) => quiz.type === "visualization_interpretation" && quiz.conceptTag === visualization.conceptTag),
  ),
);
assert("v2 visualizations link to code labs and interpretation quiz", badV2VisualLinks.length === 0, badV2VisualLinks.map((session) => session.id).join(", "));
assert("v2 visualization catalog has 30 specs", v2VisualizationCatalog.length >= 30, `${v2VisualizationCatalog.length} specs`);
assert("v2 UI components exist", [
  "src/components/ConceptTheoryBlock.tsx",
  "src/components/EquationDerivationBlock.tsx",
  "src/components/HandCalculationBlock.tsx",
  "src/components/CodeLabBlock.tsx",
  "src/components/VisualizationLinkedQuiz.tsx",
  "src/components/WrongAnswerAnalyzer.tsx",
  "src/components/AdaptiveRetryPanel.tsx",
  "src/components/SessionPrerequisiteGraph.tsx",
  "src/components/visualizers/PhysicalAIFlowVisualizer.tsx",
  "src/components/visualizers/DynamicsTorqueVisualizer.tsx",
  "src/components/visualizers/EKFCovarianceVisualizer.tsx",
  "src/components/visualizers/Sim2RealGapVisualizer.tsx",
].every((file) => fs.existsSync(file)));

const badQuiz = sections.filter((section) => section.quiz.length < 12);
assert("all sessions have 12+ quiz questions", badQuiz.length === 0, badQuiz.map((section) => section.id).slice(0, 4).join(", "));

const badTheory = sections.filter((section) => section.theory.length < 4);
assert("all sessions have 4+ theory units", badTheory.length === 0, badTheory.map((section) => section.id).slice(0, 4).join(", "));

const missingTextbook = sections.filter((section) => !section.theory.some((unit) => unit.id.includes("textbook-foundation")));
assert(
  "all sessions have textbook foundation theory",
  missingTextbook.length === 0,
  missingTextbook.map((section) => section.id).slice(0, 4).join(", "),
);

const missingExamBridge = sections.filter((section) => !section.theory.some((unit) => unit.id.includes("exam-bridge")));
assert(
  "all sessions have exam bridge theory",
  missingExamBridge.length === 0,
  missingExamBridge.map((section) => section.id).slice(0, 4).join(", "),
);

const shallowTheory = sections.filter((section) => {
  const text = section.theory
    .map((unit) =>
      [
        unit.summary,
        unit.intuition,
        ...(unit.assumptions ?? []),
        ...(unit.details ?? []),
        ...(unit.derivation ?? []),
        ...(unit.proof ?? []),
        ...(unit.engineeringMeaning ?? []),
        ...(unit.implementationNotes ?? []),
        ...(unit.commonMistakes ?? []),
        unit.workedExample?.prompt ?? "",
        ...(unit.workedExample?.steps ?? []),
        unit.workedExample?.result ?? "",
      ].join(" "),
    )
    .join(" ");
  return text.length < 3000;
});
assert(
  "all sessions have textbook-depth theory text",
  shallowTheory.length === 0,
  shallowTheory.map((section) => `${section.id}(${section.theory.length})`).slice(0, 4).join(", "),
);

const weakWorkedExamples = sections.filter((section) => section.theory.filter((unit) => unit.workedExample).length < 2);
assert(
  "all sessions have multiple worked examples",
  weakWorkedExamples.length === 0,
  weakWorkedExamples.map((section) => section.id).slice(0, 4).join(", "),
);

const missingFormula = sections.filter((section) => section.theory.flatMap((unit) => unit.formulas ?? []).length < 4);
assert("all sessions have multiple formulas", missingFormula.length === 0, missingFormula.map((section) => section.id).slice(0, 4).join(", "));

const missingProof = sections.filter((section) => !section.theory.some((unit) => (unit.proof ?? []).length > 0));
assert("all sessions have proof or derivation proof blocks", missingProof.length === 0, missingProof.map((section) => section.id).slice(0, 4).join(", "));

const missingGraph = sections.filter(
  (section) => !(section.graphIds?.length > 0) || !section.theory.some((unit) => (unit.figures ?? []).length > 0),
);
assert("all sessions have theory graphs", missingGraph.length === 0, missingGraph.map((section) => section.id).slice(0, 4).join(", "));

const missingSources = sections.filter((section) => !section.theory.some((unit) => (unit.sourceIds ?? []).length > 0));
assert("all sessions have source ids", missingSources.length === 0, missingSources.map((section) => section.id).slice(0, 4).join(", "));

const missingSectionSources = sections.filter((section) => (section.sourceIds ?? []).length < 2);
assert(
  "all sessions have 2+ section source ids",
  missingSectionSources.length === 0,
  missingSectionSources.map((section) => section.id).slice(0, 4).join(", "),
);

const missingReadingGuide = sections.filter((section) => !section.theory.some((unit) => (unit.readingGuide ?? []).length >= 3));
assert("all sessions have reading guides", missingReadingGuide.length === 0, missingReadingGuide.map((section) => section.id).slice(0, 4).join(", "));

const missingCodeExamples = sections.filter(
  (section) => (section.cppPractice.examples ?? []).length < 2 || (section.pythonPractice.examples ?? []).length < 2,
);
assert(
  "all sessions have multiple C++ and Python examples",
  missingCodeExamples.length === 0,
  missingCodeExamples.map((section) => section.id).slice(0, 4).join(", "),
);

const badLabs = sections.filter(
  (section) =>
    section.executableLabId &&
    (!section.cppPractice.executableJsStarter ||
      !section.cppPractice.executableJsSolution ||
      !section.cppPractice.expectedResultShape),
);
assert("executable labs have starter, solution, result shape", badLabs.length === 0, badLabs.map((section) => section.id).slice(0, 4).join(", "));

const missingCheats = sections.filter((section) => !(section.cheats?.length > 0));
assert("all sessions have ROS 2 cheat cards", missingCheats.length === 0, missingCheats.map((section) => section.id).slice(0, 4).join(", "));

const missingScenario = sections.filter((section) => !section.quiz.some((question) => question.id.includes("scenario")));
assert("all sessions have scenario questions", missingScenario.length === 0, missingScenario.map((section) => section.id).slice(0, 4).join(", "));

const missingPrereq = sections.filter((section) => !(section.prerequisiteIds?.length > 0));
assert("all sessions have knowledge-map prerequisites", missingPrereq.length === 0, missingPrereq.map((section) => section.id).slice(0, 4).join(", "));

const theoryPanel = fs.readFileSync("src/components/TheoryPanel.tsx", "utf8");
const quizPanel = fs.readFileSync("src/components/QuizPanel.tsx", "utf8");
const visualizerHub = fs.readFileSync("src/components/visualizers/VisualizerHub.tsx", "utf8");
const searchBar = fs.readFileSync("src/components/SearchBar.tsx", "utf8");
const sidebar = fs.readFileSync("src/components/Sidebar.tsx", "utf8");
const practicePanel = fs.readFileSync("src/components/PracticePanel.tsx", "utf8");
assert("MathText used in theory and quiz", theoryPanel.includes("MathText") && quizPanel.includes("MathText"));
assert("wrong-answer recording wired", quizPanel.includes("onRecordWrongAnswers") && fs.readFileSync("src/App.tsx", "utf8").includes("recordWrongAnswers"));
assert("visual empty state shows mini graphs", visualizerHub.includes("EmptyVisualizer") && visualizerHub.includes("MiniGraph"));
assert("search includes source catalog", searchBar.includes("sourceCatalog"));
assert("sidebar has stage filter", sidebar.includes("stageFilter"));
assert("practice panel renders code examples", practicePanel.includes("practice-example-picker") && practicePanel.includes("examples"));

const questionTypes = new Set(sections.flatMap((section) => section.quiz.map((question) => question.type)));
assert(
  "professional quiz types present",
  ["choice", "numeric", "formulaBlank", "derivationStep", "codeTrace"].every((type) => questionTypes.has(type)),
  [...questionTypes].join(", "),
);

if (failed.length > 0) {
  process.exitCode = 1;
}
