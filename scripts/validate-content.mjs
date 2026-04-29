import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync("src/data/core/curriculumV2.ts", "utf8");
const legacySource = fs.readFileSync("src/data/legacy/legacySections.ts", "utf8");
const types = fs.readFileSync("src/types.ts", "utf8");
const packageJson = fs.readFileSync("package.json", "utf8");
const readmeSource = fs.readFileSync("readme.md", "utf8");
const pyodideRunnerSource = fs.readFileSync("src/utils/pyodideRunner.ts", "utf8");
const executableLabSource = fs.readFileSync("src/components/ExecutableLab.tsx", "utf8");
const pytorchBCSource = fs.readFileSync("src/data/vision_ai/pytorchBCSessions.ts", "utf8");
const promptContextHarnessSource = fs.readFileSync("src/data/eval_deployment/promptContextHarnessSessions.ts", "utf8");
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

const curriculumModule = loadTsModule("src/data/core/curriculumV2.ts");
const curriculum = curriculumModule.curriculum;
const allSections = curriculum.flatMap((item) => item.sections);
const sections = allSections.filter((section) => !section.v2Session);
const v2Sections = allSections.filter((section) => section.v2Session);
const v2Sessions = curriculumModule.v2Sessions;
const v2VisualizationCatalog = curriculumModule.v2VisualizationCatalog;
const assessmentCoverageChecklist = curriculumModule.assessmentCoverageChecklist;
const finalImprovementRoadmap = curriculumModule.finalImprovementRoadmap;
const contentQualityRemediationChecklist = curriculumModule.contentQualityRemediationChecklist;
const mathFoundationAuditChecklist = curriculumModule.mathFoundationAuditChecklist;
const physicalAICoreAuditChecklist = curriculumModule.physicalAICoreAuditChecklist;
const promptContextHarnessFeatureAudit = curriculumModule.promptContextHarnessFeatureAudit;
const structuralQualityRemediationChecklist = curriculumModule.structuralQualityRemediationChecklist;
const sourceCatalog = loadTsModule("src/data/core/sourceCatalog.ts").sourceCatalog;
const failed = [];

const assert = (name, ok, detail = "") => {
  console.log(`${ok ? "OK" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`);
  if (!ok) failed.push(name);
};

assert("part-centered module count", curriculum.length >= 10, `${curriculum.length} modules`);
assert(
  "legacy numeric modules are merged into parts",
  curriculum.every((module) => !/^\d+\./.test(module.title)),
  curriculum.filter((module) => /^\d+\./.test(module.title)).map((module) => module.title).join(", "),
);
assert("merged legacy micro session count", sections.length >= 75, `${sections.length} sessions`);
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
assert("legacy sections extracted into data module", legacySource.includes("export const legacySections") && sections.length >= 75);
assert("mini graph component", fs.existsSync("src/components/MiniGraph.tsx"));
assert("executable lab component", fs.existsSync("src/components/ExecutableLab.tsx"));
assert("KaTeX renderer", fs.existsSync("src/components/KatexRenderer.tsx"));
assert("knowledge map component", fs.existsSync("src/components/KnowledgeMap.tsx"));
assert("source catalog panel", fs.existsSync("src/components/SourceCatalogPanel.tsx"));
assert(
  "always-on study site service scripts exist",
  fs.existsSync("scripts/serve-static.mjs") &&
    fs.existsSync("scripts/install-study-site-service.sh") &&
    fs.existsSync("scripts/share-study-site.mjs") &&
    packageJson.includes("install:service") &&
    packageJson.includes("serve:study") &&
    packageJson.includes("share:study"),
);
assert(
  "README documents LAN and internet access",
  readmeSource.includes("http://localhost:4173/study_site/") &&
    readmeSource.includes("같은 Wi-Fi") &&
    readmeSource.includes("https://hinoonyaso.github.io/study_site/"),
);
assert("v2 session count", v2Sessions.length >= 12, `${v2Sessions.length} v2 sessions`);
assert("v2 sections are first-class", v2Sections.length >= 12, `${v2Sections.length} adapted sections`);
const criticalGapSessionIds = [
  "laplace_z_bode_pid_design",
  "robot_dynamics_newton_euler_recursive",
  "robot_dynamics_feedforward_gravity_compensation",
  "ukf_sigma_point_localization",
  "nav2_behavior_tree_action_server",
  "tensorrt_onnx_quantization_pipeline",
  "cpp_realtime_control_loop_jitter",
  "cbf_qp_safety_filter",
  "rl_ppo_sac_reward_shaping",
  "vlm_architecture_to_vla_bridge",
];
const v2SessionIds = new Set(v2Sessions.map((session) => session.id));
const missingCriticalGaps = criticalGapSessionIds.filter((id) => !v2SessionIds.has(id));
assert("physical-ai report critical gap sessions present", missingCriticalGaps.length === 0, missingCriticalGaps.join(", "));
const criticalGapSessions = v2Sessions.filter((session) => criticalGapSessionIds.includes(session.id));
const criticalGapQuizTypes = new Set(criticalGapSessions.flatMap((session) => session.quizzes.map((question) => question.type)));
const requiredCriticalQuizTypes = ["derivation", "counterexample", "safety_analysis", "integration_pipeline"];
const missingCriticalQuizTypes = requiredCriticalQuizTypes.filter((type) => !criticalGapQuizTypes.has(type));
assert("critical gap sessions include advanced quiz types", missingCriticalQuizTypes.length === 0, missingCriticalQuizTypes.join(", "));
const criticalGapLabs = criticalGapSessions.flatMap((session) => session.codeLabs.map((lab) => `${lab.language}:${lab.id}`));
assert(
  "critical gap sessions include C++ and Python labs",
  criticalGapLabs.some((lab) => lab.startsWith("cpp:")) && criticalGapLabs.some((lab) => lab.startsWith("python:")),
  criticalGapLabs.join(", "),
);
const criticalGapVisualizations = new Set(v2VisualizationCatalog.map((visualization) => visualization.conceptTag));
const missingCriticalVisualSpecs = criticalGapSessionIds.filter((id) => !criticalGapVisualizations.has(id));
assert("critical gap visualization catalog coverage", missingCriticalVisualSpecs.length === 0, missingCriticalVisualSpecs.join(", "));
const genericCriticalQuizAnswers = criticalGapSessions.flatMap((session) =>
  session.quizzes
    .filter((question) => question.id.includes("q01_concept") || question.id.includes("q02_calculation"))
    .map((question) => question.expectedAnswer),
);
const duplicateCriticalQuizAnswers = genericCriticalQuizAnswers.filter((answer, index, all) => all.indexOf(answer) !== index);
assert(
  "critical gap core quizzes are session-specific",
  duplicateCriticalQuizAnswers.length === 0 &&
    !genericCriticalQuizAnswers.some((answer) =>
      answer.includes("계산값이 맞아도 pole 위치, torque limit, confidence threshold, deadline") ||
      answer.includes("수식과 코드만이 아니라 실제 로봇의 시간 예산"),
    ),
  duplicateCriticalQuizAnswers.slice(0, 2).join(" / "),
);
const remainingGapSessionIds = [
  "null_space_redundancy_resolution",
  "contact_dynamics_friction_cone_grasp",
  "ilqr_trajectory_optimization_receding_horizon",
  "dagger_dataset_aggregation_imitation_learning",
  "dreamer_rssm_world_model_implementation",
];
const missingRemainingGaps = remainingGapSessionIds.filter((id) => !v2SessionIds.has(id));
assert("remaining weakness closure sessions present", missingRemainingGaps.length === 0, missingRemainingGaps.join(", "));
const remainingGapSessions = v2Sessions.filter((session) => remainingGapSessionIds.includes(session.id));
const missingRemainingVisualSpecs = remainingGapSessionIds.filter((id) => !criticalGapVisualizations.has(id));
assert("remaining weakness visualization catalog coverage", missingRemainingVisualSpecs.length === 0, missingRemainingVisualSpecs.join(", "));
const remainingLabs = remainingGapSessions.flatMap((session) => session.codeLabs.map((lab) => `${session.id}:${lab.id}`));
const missingRemainingLabs = remainingGapSessions.filter((session) => session.codeLabs.length === 0);
assert("remaining weakness sessions have executable labs", missingRemainingLabs.length === 0, remainingLabs.join(", "));
const depthGapSessionIds = [
  "antiwindup_derivative_kick_pid",
  "impedance_control_contact_depth",
];
const missingDepthGaps = depthGapSessionIds.filter((id) => !v2SessionIds.has(id));
assert(
  "depth gap sessions present (antiwindup + impedance)",
  missingDepthGaps.length === 0,
  missingDepthGaps.join(", "),
);
const depthGapVisuals = depthGapSessionIds.filter((id) => !criticalGapVisualizations.has(id));
assert(
  "depth gap sessions have visualization catalog entries",
  depthGapVisuals.length === 0,
  depthGapVisuals.join(", "),
);
const finalImprovementSessionIds = [
  "dh_craig_spong_convention_guard",
  "ik_solution_selection_joint_limit_continuity",
  "rank_nullity_pseudoinverse_ik",
  "kkt_osqp_active_constraints",
  "se3_lie_algebra_expmap_twist",
  "geometric_vs_analytic_jacobian",
  "spatial_rnea_6dof_backward_pass",
  "feedforward_model_error_robustness",
  "controllability_gramian_numeric",
  "lqr_bryson_rule_pole_design",
  "back_calculation_antiwindup_control",
  "admittance_vs_impedance_control",
  "preempt_rt_kernel_jitter_comparison",
  "clip_contrastive_temperature_loss",
  "llava_cross_attention_vla_grounding",
  "ppo_gae_sac_entropy_tuning",
  "rssm_elbo_kl_world_model",
  "pi0_openvla_diffusion_token_policy",
  "ekf_chi_squared_outlier_rejection",
  "fisher_information_observability",
  "ukf_alpha_beta_kappa_tuning",
  "particle_filter_resampling_comparison",
  "imu_camera_tight_coupling_factor",
  "orca_velocity_obstacle_avoidance",
  "isam2_incremental_factor_graph",
  "domain_randomization_adr_gap_design",
  "mpc_soft_constraint_infeasibility",
  "clf_cbf_qp_priority_resolution",
  "laplace_final_value_bode_margin",
  "butterworth_filter_order_design",
  "chebyshev_butterworth_filter_design",
  "jerk_continuous_quintic_trajectory",
  "tensorrt_real_onnx_inference_calibration",
  "vlm_vla_lora_finetuning_dataset",
  "system_parameter_selection_report",
];
const missingFinalImprovements = finalImprovementSessionIds.filter((id) => !v2SessionIds.has(id));
assert(
  "final sufficient coverage sessions present",
  missingFinalImprovements.length === 0,
  missingFinalImprovements.join(", "),
);
const missingFinalVisualSpecs = finalImprovementSessionIds.filter((id) => !criticalGapVisualizations.has(id));
assert(
  "final sufficient visualization catalog coverage",
  missingFinalVisualSpecs.length === 0,
  missingFinalVisualSpecs.join(", "),
);
const structuralImprovementSessionIds = [
  "vector_matrix_inverse_cross_product_basics",
  "fk_matrix_ik_singularity_visual_lab",
  "bicycle_model_stanley_controller",
  "dataset_label_split_confusion_matrix_practice",
  "ros2_cli_command_diagnostics_lab",
  "prompt_context_eval_harness_engineering",
];
const missingStructuralImprovements = structuralImprovementSessionIds.filter((id) => !v2SessionIds.has(id));
assert(
  "structural audit improvement sessions present",
  missingStructuralImprovements.length === 0,
  missingStructuralImprovements.join(", "),
);
const missingStructuralVisualSpecs = structuralImprovementSessionIds.filter((id) => !criticalGapVisualizations.has(id));
assert(
  "structural audit visualization catalog coverage",
  missingStructuralVisualSpecs.length === 0,
  missingStructuralVisualSpecs.join(", "),
);
const foundationGapSessionIds = [
  "matrix_multiplication_grid_basics",
  "pseudoinverse_rank_deficient_basics",
  "partial_derivative_gradient_tangent_plane",
  "gradient_descent_loss_landscape",
  "gaussian_bayes_update_distribution",
  "finite_difference_ode_solver_basics",
];
const missingFoundationGaps = foundationGapSessionIds.filter((id) => !v2SessionIds.has(id));
assert(
  "foundation math gap sessions present",
  missingFoundationGaps.length === 0,
  missingFoundationGaps.join(", "),
);
const missingFoundationVisualSpecs = foundationGapSessionIds.filter((id) => !criticalGapVisualizations.has(id));
assert(
  "foundation math gap visualization catalog coverage",
  missingFoundationVisualSpecs.length === 0,
  missingFoundationVisualSpecs.join(", "),
);
assert(
  "prompt/context/eval harness has its own curriculum part",
  curriculum.some((module) => module.id === "v2-part-10-prompt-context-harness" && module.sections.length > 0),
);
const promptContextHarnessPart = curriculum.find((module) => module.id === "v2-part-10-prompt-context-harness");
const requiredPromptHarnessFeatures = [
  "프롬프트 템플릿",
  "역할/목표/제약/출력형식",
  "few-shot",
  "JSON/YAML 출력 강제",
  "hallucination 줄이기",
  "context window / chunking",
  "retrieval / grounding",
  "evaluation harness",
  "golden output 비교",
  "latency logging / tracing",
];
const promptHarnessAuditFeatures = new Set((promptContextHarnessFeatureAudit ?? []).map((row) => row.feature));
assert(
  "prompt/context/harness audit covers requested feature table",
  Array.isArray(promptContextHarnessFeatureAudit) &&
    requiredPromptHarnessFeatures.every((feature) => promptHarnessAuditFeatures.has(feature)),
  requiredPromptHarnessFeatures.filter((feature) => !promptHarnessAuditFeatures.has(feature)).join(", "),
);
const promptHarnessEvidenceSessionIds = (promptContextHarnessFeatureAudit ?? []).flatMap(
  (row) => row.evidenceSessionIds ?? [],
);
const promptHarnessEvidenceLabIds = (promptContextHarnessFeatureAudit ?? []).flatMap((row) => row.evidenceLabIds ?? []);
const v2CodeLabIds = new Set(v2Sessions.flatMap((session) => session.codeLabs.map((lab) => lab.id)));
const missingPromptHarnessEvidenceSessions = promptHarnessEvidenceSessionIds.filter((id) => !v2SessionIds.has(id));
const missingPromptHarnessEvidenceLabs = promptHarnessEvidenceLabIds.filter((id) => !v2CodeLabIds.has(id));
assert(
  "prompt/context/harness audit evidence sessions exist",
  missingPromptHarnessEvidenceSessions.length === 0 &&
    Boolean(promptContextHarnessPart) &&
    promptHarnessEvidenceSessionIds.every((id) => promptContextHarnessPart.sections.some((section) => section.id === id)),
  missingPromptHarnessEvidenceSessions.join(", "),
);
assert(
  "prompt/context/harness audit evidence labs exist",
  missingPromptHarnessEvidenceLabs.length === 0,
  missingPromptHarnessEvidenceLabs.join(", "),
);
assert(
  "prompt/context/harness examples practice eval and logs are explicit",
  promptContextHarnessSource.includes("selected_example_ids") &&
    promptContextHarnessSource.includes("context_tokens") &&
    promptContextHarnessSource.includes("retrieved_chunk_ids") &&
    promptContextHarnessSource.includes("eval_run_id") &&
    promptContextHarnessSource.includes("golden_id") &&
    promptContextHarnessSource.includes("trace_id") &&
    promptContextHarnessSource.includes("latency") &&
    promptContextHarnessSource.includes("schema_ok"),
);
assert(
  "assessment coverage checklist covers requested weak quiz areas",
  Array.isArray(assessmentCoverageChecklist) &&
    ["편미분 전용 문제", "IK 문제", "Nav2 스택 문제", "프롬프트 엔지니어링 문제"].every((topic) =>
      assessmentCoverageChecklist.some((item) => item.topic === topic),
    ),
  JSON.stringify(assessmentCoverageChecklist ?? []),
);
const assessmentEvidenceSessionIds = (assessmentCoverageChecklist ?? []).flatMap((item) => item.evidenceSessionIds ?? []);
const missingAssessmentEvidenceSessions = assessmentEvidenceSessionIds.filter((id) => !v2SessionIds.has(id));
assert(
  "assessment coverage evidence sessions exist",
  missingAssessmentEvidenceSessions.length === 0,
  missingAssessmentEvidenceSessions.join(", "),
);
const allV2Questions = v2Sessions.flatMap((session) =>
  session.quizzes.map((question) => ({
    session,
    question,
    text: `${session.id} ${session.title} ${question.id} ${question.conceptTag} ${question.question} ${question.expectedAnswer} ${question.codeSnippet ?? ""}`.toLowerCase(),
  })),
);
const topicQuestionCount = (patterns) =>
  allV2Questions.filter(({ text }) => patterns.some((pattern) => pattern.test(text))).length;
const partialDerivativeQuestionCount = topicQuestionCount([/partial_derivative/, /편미분/, /df\/dx/, /\\partial/]);
const ikQuestionCount = topicQuestionCount([/\bik\b/, /inverse_kinematics/, /역기구학/, /elbow/, /dls/, /singularity/]);
const nav2QuestionCount = topicQuestionCount([/nav2/, /bt_navigator/, /controller_server/, /costmap/, /lifecycle/, /launch file/]);
const promptEngineeringQuestionCount = topicQuestionCount([
  /prompt/,
  /프롬프트/,
  /few-shot/,
  /schema_ok/,
  /golden/,
  /grounding/,
  /retrieval/,
  /latency tracing/,
]);
assert("partial derivative dedicated questions meet recommendation", partialDerivativeQuestionCount >= 5, `${partialDerivativeQuestionCount}/5`);
assert("IK dedicated questions meet recommendation", ikQuestionCount >= 10, `${ikQuestionCount}/10`);
assert("Nav2 stack questions meet recommendation", nav2QuestionCount >= 8, `${nav2QuestionCount}/8`);
assert("prompt engineering questions meet recommendation", promptEngineeringQuestionCount >= 15, `${promptEngineeringQuestionCount}/15`);
assert(
  "required assessment problem forms are present",
  allV2Questions.some(({ question }) => question.type === "derivation" && question.question.includes("순서")) &&
    allV2Questions.some(
      ({ question }) =>
        question.type === "code_completion" &&
        /launch|LaunchDescription|launch_ros|Node/.test(`${question.question} ${question.codeSnippet ?? ""}`) &&
        `${question.question} ${question.codeSnippet ?? ""}`.includes("____"),
    ) &&
    allV2Questions.some(({ question }) => question.type === "visualization_interpretation" && question.question.includes("파라미터 추정")),
);
const aiDeploymentPipelineSessionIds = [
  "pytorch_bc_onnx_export_contract",
  "onnxruntime_cpp_policy_inference",
  "ros2_image_inference_latency_node",
  "camera_to_cmd_vel_inference_pipeline",
];
const aiDeploymentPart = curriculum.find((module) => module.id === "v2-part-11-ai-deployment-pipeline");
assert(
  "AI deployment pipeline has dedicated ONNX to C++ to ROS 2 part",
  Boolean(aiDeploymentPart) &&
    aiDeploymentPipelineSessionIds.every((id) => aiDeploymentPart.sections.some((section) => section.id === id)),
  aiDeploymentPart?.sections.map((section) => section.id).join(", "),
);
assert(
  "PyTorch BC links forward into ONNX export deployment chain",
  pytorchBCSource.includes("pytorch_bc_onnx_export_contract") &&
    aiDeploymentPipelineSessionIds.every((id) => v2SessionIds.has(id)),
  aiDeploymentPipelineSessionIds.filter((id) => !v2SessionIds.has(id)).join(", "),
);
assert(
  "browser Python runner supports SciPy/Matplotlib with explicit unsupported-package messaging",
  pyodideRunnerSource.includes("\"scipy\"") &&
    pyodideRunnerSource.includes("\"matplotlib\"") &&
    pyodideRunnerSource.includes("getBrowserPythonSupport") &&
    pyodideRunnerSource.includes("unsupportedImports") &&
    pyodideRunnerSource.includes("Python 실행 시간이") &&
    executableLabSource.includes("JS_LAB_TIMEOUT_MS = 5_000") &&
    packageJson.includes("\"pyodide\"") &&
    packageJson.includes("vendor-pyodide"),
);
assert(
  "six-stage reinforcement roadmap is exported",
  Array.isArray(finalImprovementRoadmap) && finalImprovementRoadmap.length === 6,
  `${finalImprovementRoadmap?.length ?? 0} stages`,
);
const roadmapSessionIds = (finalImprovementRoadmap ?? []).flatMap((stage) => stage.sessionIds ?? []);
const missingRoadmapSessions = roadmapSessionIds.filter((id) => !v2SessionIds.has(id));
assert(
  "six-stage roadmap sessions exist in v2 curriculum",
  missingRoadmapSessions.length === 0,
  missingRoadmapSessions.join(", "),
);
const roadmapVisualizationIds = (finalImprovementRoadmap ?? []).flatMap((stage) => stage.visualizationIds ?? []);
const catalogVisualizationIds = new Set(v2VisualizationCatalog.map((visualization) => visualization.id));
const missingRoadmapVisualizations = roadmapVisualizationIds.filter((id) => !catalogVisualizationIds.has(id));
assert(
  "six-stage roadmap visualizations exist in catalog",
  missingRoadmapVisualizations.length === 0,
  missingRoadmapVisualizations.join(", "),
);
const roadmapText = JSON.stringify(finalImprovementRoadmap ?? []);
const finalImprovementSource = fs.readFileSync("src/data/eval_deployment/finalImprovementSessions.ts", "utf8");
assert(
  "six-stage roadmap includes requested concrete labs",
  roadmapText.includes("scipy.stats.chi2.ppf") &&
    roadmapText.includes("scipy.signal.bode") &&
    roadmapText.includes("scipy.signal.butter") &&
    roadmapText.includes("scipy.signal.cheb1ord") &&
    roadmapText.includes("osqp.OSQP") &&
    roadmapText.includes("Rodrigues formula") &&
    roadmapText.includes("rank-deficient null-space IK") &&
    roadmapText.includes("3-link spatial RNEA") &&
    roadmapText.includes("PyTorch RSSM"),
);
assert(
  "math foundation audit checklist covers 6 foundation fields",
  Array.isArray(mathFoundationAuditChecklist) && mathFoundationAuditChecklist.length === 6,
  `${mathFoundationAuditChecklist?.length ?? 0} fields`,
);
const mathAuditSessionIds = (mathFoundationAuditChecklist ?? []).flatMap((item) => item.evidenceSessionIds ?? []);
const missingMathAuditSessions = mathAuditSessionIds.filter((id) => !v2SessionIds.has(id));
assert(
  "math foundation audit checklist sessions exist",
  missingMathAuditSessions.length === 0,
  missingMathAuditSessions.join(", "),
);
const mathAuditVisualizationIds = (mathFoundationAuditChecklist ?? []).flatMap((item) => item.evidenceVisualizationIds ?? []);
const missingMathAuditVisualizations = mathAuditVisualizationIds.filter((id) => !catalogVisualizationIds.has(id));
assert(
  "math foundation audit checklist visualizations exist",
  missingMathAuditVisualizations.length === 0,
  missingMathAuditVisualizations.join(", "),
);
const weakMathAuditScores = (mathFoundationAuditChecklist ?? []).filter(
  (item) => item.depthScore < 10 || item.practiceScore < 10,
);
assert(
  "math foundation audit scores are fully sufficient",
  weakMathAuditScores.length === 0,
  weakMathAuditScores.map((item) => `${item.field}:${item.depthScore}/${item.practiceScore}`).join(", "),
);
assert(
  "math foundation gaps include concrete implementations",
  finalImprovementSource.includes("rank-nullity theorem") &&
    finalImprovementSource.includes("scipy.signal.bode") &&
    finalImprovementSource.includes("initial value") &&
    finalImprovementSource.includes("scipy.stats.chi2.ppf") &&
    finalImprovementSource.includes("Fisher Information Matrix") &&
    finalImprovementSource.includes("KKT complementarity") &&
    finalImprovementSource.includes("osqp.OSQP") &&
    finalImprovementSource.includes("Rodrigues formula") &&
    finalImprovementSource.includes("cheb1ord"),
);
assert(
  "physical-ai core audit checklist covers all critical weaknesses",
  Array.isArray(physicalAICoreAuditChecklist) && physicalAICoreAuditChecklist.length === 24,
  `${physicalAICoreAuditChecklist?.length ?? 0} items`,
);
const unresolvedPhysicalCoreGaps = (physicalAICoreAuditChecklist ?? []).filter((item) => item.status !== "resolved");
assert(
  "physical-ai core audit has no unresolved gaps",
  unresolvedPhysicalCoreGaps.length === 0,
  unresolvedPhysicalCoreGaps.map((item) => item.previousGap).join(", "),
);
const physicalCoreSessionIds = (physicalAICoreAuditChecklist ?? []).flatMap((item) => item.evidenceSessionIds ?? []);
const missingPhysicalCoreSessions = physicalCoreSessionIds.filter((id) => !v2SessionIds.has(id));
assert(
  "physical-ai core audit sessions exist",
  missingPhysicalCoreSessions.length === 0,
  missingPhysicalCoreSessions.join(", "),
);
const physicalCoreVisualizationIds = (physicalAICoreAuditChecklist ?? []).flatMap((item) => item.evidenceVisualizationIds ?? []);
const missingPhysicalCoreVisualizations = physicalCoreVisualizationIds.filter((id) => !catalogVisualizationIds.has(id));
assert(
  "physical-ai core audit visualizations exist",
  missingPhysicalCoreVisualizations.length === 0,
  missingPhysicalCoreVisualizations.join(", "),
);
assert(
  "physical-ai core gaps include concrete implementations",
  finalImprovementSource.includes("Craig/Spong") &&
    finalImprovementSource.includes("elbow flip") &&
    finalImprovementSource.includes("Feedforward Gravity Model Error Robustness") &&
    finalImprovementSource.includes("Controllability Gramian") &&
    finalImprovementSource.includes("PREEMPT_RT") &&
    finalImprovementSource.includes("systematic_resample") &&
    finalImprovementSource.includes("IMU-Camera Tight Coupling") &&
    finalImprovementSource.includes("GAE lambda"),
);
assert(
  "content quality remediation checklist covers 8 known weak spots",
  Array.isArray(contentQualityRemediationChecklist) && contentQualityRemediationChecklist.length === 8,
  `${contentQualityRemediationChecklist?.length ?? 0} items`,
);
const checklistSessionIds = (contentQualityRemediationChecklist ?? []).flatMap((item) => item.evidenceSessionIds ?? []);
const missingChecklistSessions = checklistSessionIds.filter((id) => !v2SessionIds.has(id));
assert(
  "content quality remediation checklist sessions exist",
  missingChecklistSessions.length === 0,
  missingChecklistSessions.join(", "),
);
const checklistVisualizationIds = (contentQualityRemediationChecklist ?? []).flatMap((item) => item.evidenceVisualizationIds ?? []);
const missingChecklistVisualizations = checklistVisualizationIds.filter((id) => !catalogVisualizationIds.has(id));
assert(
  "content quality remediation checklist visualizations exist",
  missingChecklistVisualizations.length === 0,
  missingChecklistVisualizations.join(", "),
);
assert(
  "structural quality remediation checklist covers UX/code/mobile gaps",
  Array.isArray(structuralQualityRemediationChecklist) && structuralQualityRemediationChecklist.length >= 6,
  `${structuralQualityRemediationChecklist?.length ?? 0} items`,
);
const unresolvedStructuralGaps = (structuralQualityRemediationChecklist ?? []).filter(
  (item) => !["resolved", "mitigated"].includes(item.status),
);
assert(
  "structural quality remediation has no untracked gaps",
  unresolvedStructuralGaps.length === 0,
  unresolvedStructuralGaps.map((item) => item.issue).join(", "),
);
const structuralChecklistSessionIds = (structuralQualityRemediationChecklist ?? []).flatMap((item) => item.evidenceSessionIds ?? []);
const missingStructuralChecklistSessions = structuralChecklistSessionIds.filter((id) => !v2SessionIds.has(id));
assert(
  "structural quality remediation sessions exist",
  missingStructuralChecklistSessions.length === 0,
  missingStructuralChecklistSessions.join(", "),
);
const structuralChecklistVisualizationIds = (structuralQualityRemediationChecklist ?? []).flatMap((item) => item.evidenceVisualizationIds ?? []);
const missingStructuralChecklistVisualizations = structuralChecklistVisualizationIds.filter((id) => !catalogVisualizationIds.has(id));
assert(
  "structural quality remediation visualizations exist",
  missingStructuralChecklistVisualizations.length === 0,
  missingStructuralChecklistVisualizations.join(", "),
);
const laplaceBodeVisual = v2VisualizationCatalog.find((visualization) => visualization.id === "vis_laplace_z_bode_pid");
assert(
  "Bode PID visualization has meaningful third parameter",
  laplaceBodeVisual?.parameters.some((parameter) => parameter.name === "phase_margin_target"),
  laplaceBodeVisual?.parameters.map((parameter) => parameter.name).join(", "),
);
const criticalGapSource = fs.readFileSync("src/data/gap_reinforcement/criticalGapSessions.ts", "utf8");
assert(
  "TensorRT contract lab clearly marked as CPU mock with GPU deployment guide",
  criticalGapSource.includes("CPU mock") &&
    criticalGapSource.includes("실제 Jetson/NVIDIA GPU 배포") &&
    criticalGapSource.includes("trtexec/polygraphy"),
);
const shallowFinalQuizPools = v2Sessions.filter(
  (session) => finalImprovementSessionIds.includes(session.id) && session.quizzes.length < 13,
);
assert(
  "final sufficient sessions have expanded adaptive retry pools",
  shallowFinalQuizPools.length === 0,
  shallowFinalQuizPools.map((session) => `${session.id}:${session.quizzes.length}`).join(", "),
);
const deadlineQuestionSessions = v2Sessions.filter((session) =>
  session.quizzes.some((question) => question.id.includes("q13_deadline") && question.expectedAnswer.includes("deadline")),
);
const finalSessionsMissingDeadlineQuestions = v2Sessions.filter(
  (session) =>
    finalImprovementSessionIds.includes(session.id) &&
    !session.quizzes.some((question) => question.id.includes("q13_deadline") && question.expectedAnswer.includes("deadline")),
);
assert(
  "v2 sessions include explicit deadline safety questions",
  deadlineQuestionSessions.length >= 100 && finalSessionsMissingDeadlineQuestions.length === 0,
  finalSessionsMissingDeadlineQuestions.map((session) => session.id).slice(0, 4).join(", ") ||
    `${deadlineQuestionSessions.length} sessions`,
);
const adaptiveRetrySource = fs.readFileSync("src/components/AdaptiveRetryPanel.tsx", "utf8");
assert(
  "adaptive retry groups weak areas by concept and error type",
  adaptiveRetrySource.includes("weakErrorTypes") && adaptiveRetrySource.includes("errorTypeLabel"),
);
const appSource = fs.readFileSync("src/App.tsx", "utf8");
const codeLabBlockSource = fs.readFileSync("src/components/CodeLabBlock.tsx", "utf8");
const quizPanelSource = fs.readFileSync("src/components/QuizPanel.tsx", "utf8");
const assessmentReportSource = fs.readFileSync("src/components/AssessmentReportPanel.tsx", "utf8");
const visualizerHubSource = [
  "src/components/visualizers/VisualizerHub.tsx",
  "src/components/visualizers/ManipulatorVisualizer.tsx",
  "src/components/visualizers/EmptyVisualizer.tsx",
  "src/components/visualizers/VisualizationSpecCards.tsx",
  "src/components/visualizers/VisualizationSpecInteractiveCard.tsx",
  "src/components/visualizers/Nav2WorkflowStackVisualizer.tsx",
  "src/components/visualizers/MobileNavigationStackVisualizer.tsx",
  "src/components/visualizers/CNNFeatureMapVisualizer.tsx",
  "src/components/visualizers/NMSIoUVisualizer.tsx",
  "src/components/visualizers/PhysicalAIFlowVisualizer.tsx",
]
  .map((filePath) => fs.readFileSync(filePath, "utf8"))
  .join("\n");
const sidebarSource = fs.readFileSync("src/components/Sidebar.tsx", "utf8");
const stylesSource = fs.readFileSync("src/styles.css", "utf8");
assert(
  "first-visit onboarding and goal presets are implemented",
  appSource.includes("physical-ai-onboarding-seen-v1") &&
    appSource.includes("onboarding-card") &&
    appSource.includes("jumpToFirstMatch"),
);
assert(
  "main learning roadmap and visible goal presets are implemented",
  appSource.includes("study-roadmap") &&
    appSource.includes("goal-presets") &&
    appSource.includes("roadmap-step") &&
    appSource.includes("mobile-progress-summary") &&
    stylesSource.includes(".study-roadmap") &&
    stylesSource.includes(".goal-presets") &&
    stylesSource.includes(".roadmap-step"),
);
assert(
  "sidebar stage filters are promoted as goal panel",
  sidebarSource.includes("stage-filter-panel") &&
    sidebarSource.includes("stageFilterCounts") &&
    sidebarSource.includes("학습 목적") &&
    stylesSource.includes(".stage-filter-panel") &&
    stylesSource.includes(".stage-filter-heading"),
);
assert(
  "visible previous/next session navigation is implemented",
  appSource.includes("session-nav") &&
    appSource.includes("goPrevSection") &&
    appSource.includes("goNextSection") &&
    stylesSource.includes(".session-nav"),
);
assert(
  "code labs provide copy button and local execution guide",
  codeLabBlockSource.includes("navigator.clipboard.writeText") &&
    codeLabBlockSource.includes("local-run-guide") &&
    fs.existsSync("requirements.txt") &&
    fs.existsSync("docker-compose.yml"),
);
assert(
  "quiz panel exposes difficulty filtering and detailed wrong-answer explanations",
  quizPanelSource.includes("quiz-filter-row") &&
    quizPanelSource.includes("difficultyFilter") &&
    quizPanelSource.includes("whyWrong") &&
    quizPanelSource.includes("commonWrongAnswer") &&
    quizPanelSource.includes("recommendedReview"),
);
assert(
  "final exam wrong answers link back to review sessions",
  quizPanelSource.includes("onReviewTarget") &&
    appSource.includes("openReviewTarget") &&
    appSource.includes("wrongAnswerAnalysis.reviewSession") &&
    assessmentReportSource.includes("최종시험 복습 연결"),
);
assert(
  "whole-curriculum diagnostic report is implemented",
  appSource.includes("AssessmentReportPanel") &&
    assessmentReportSource.includes("전체 진단 리포트") &&
    assessmentReportSource.includes("강점") &&
    assessmentReportSource.includes("약점") &&
    assessmentReportSource.includes("우선 복습 세션"),
);
assert(
  "mobile bottom tabs and right-panel access are implemented",
  stylesSource.includes("@media (max-width: 560px)") &&
    stylesSource.includes("position: fixed") &&
    stylesSource.includes("bottom: 0") &&
    stylesSource.includes(".right-column"),
);
assert(
  "FK matrix, IK convergence, and manipulability visualization are rendered",
  visualizerHubSource.includes("matrix-step-grid") &&
    visualizerHubSource.includes("ik-trace-summary") &&
    visualizerHubSource.includes("manip-ellipse") &&
    visualizerHubSource.includes("BicycleStanleyVisualizer"),
);
assert(
  "robot arm visualizer shows 3-link FK chain and IK failure diagnostics",
  visualizerHubSource.includes("T23") &&
    visualizerHubSource.includes("T03") &&
    visualizerHubSource.includes("analytic elbow-up seed") &&
    visualizerHubSource.includes("workspace 밖 target") &&
    visualizerHubSource.includes("det(JJᵀ)"),
);
const autonomyAuditSessionIds = [
  "differential_drive_odometry",
  "wheel_encoder_tick_odometry",
  "lidar_scan_preprocessing",
  "dijkstra_grid_planning",
  "hybrid_astar_state_lattice",
  "dwb_critic_controller",
  "slam_toolbox_launch_mapping",
  "mobile_navigation_integrated_stack",
];
assert(
  "autonomous/mobile robot audit closure sessions present",
  autonomyAuditSessionIds.every((id) => v2SessionIds.has(id)),
  autonomyAuditSessionIds.filter((id) => !v2SessionIds.has(id)).join(", "),
);
assert(
  "mobile navigation integrated stack and TF tree visualization are rendered",
  visualizerHubSource.includes("MobileNavigationStackVisualizer") &&
    visualizerHubSource.includes("mobile-navigation-stack") &&
    visualizerHubSource.includes("T_map_base") &&
    visualizerHubSource.includes("slam_toolbox"),
);
const aiFoundationAuditSessionIds = [
  "browser_onnx_tiny_cnn_feature_demo",
  "object_detection_yolo_ssd_pipeline",
  "visual_tracking_iou_kalman",
  "camera_to_cmd_vel_inference_pipeline",
];
assert(
  "AI foundation audit closure sessions present",
  aiFoundationAuditSessionIds.every((id) => v2SessionIds.has(id)),
  aiFoundationAuditSessionIds.filter((id) => !v2SessionIds.has(id)).join(", "),
);
assert(
  "AI foundation browser CNN, detection/tracking, and cmd_vel visuals are rendered",
  visualizerHubSource.includes("tinyOnnxDemoWeights") &&
    visualizerHubSource.includes("ONNX-style Tiny CNN") &&
    visualizerHubSource.includes("NMSIoUVisualizer") &&
    visualizerHubSource.includes("PhysicalAIFlowVisualizer"),
);
assert(
  "foundation math custom visualizers are rendered",
  visualizerHubSource.includes("CrossProduct3DVisualizer") &&
    visualizerHubSource.includes("LossLandscapeVisualizer") &&
    visualizerHubSource.includes("GaussianBayesVisualizer") &&
    visualizerHubSource.includes("OdeFiniteDiffVisualizer"),
);
const genericCatalogSliders = v2VisualizationCatalog.flatMap((visualization) =>
  visualization.parameters
    .filter((parameter) => ["disturbance_or_noise", "safety_margin"].includes(parameter.name))
    .map((parameter) => `${visualization.id}:${parameter.name}`),
);
assert(
  "v2 visualization catalog avoids generic auto sliders",
  genericCatalogSliders.length === 0,
  genericCatalogSliders.slice(0, 4).join(", "),
);
const weakCatalogSpecs = v2VisualizationCatalog.filter(
  (visualization) => visualization.parameters.length < 3 || visualization.interpretationQuestions.length < 3,
);
assert(
  "v2 visualization catalog uses multi-parameter specs",
  weakCatalogSpecs.length === 0,
  weakCatalogSpecs.map((visualization) => visualization.id).slice(0, 4).join(", "),
);
[
  "src/data/math/mathFoundationSessions.ts",
  "src/data/robotics/robotMathSessions.ts",
  "src/data/robotics/dynamicsControlSessions.ts",
  "src/data/autonomy/autonomousDrivingSessions.ts",
  "src/data/vision_ai/robotVisionSessions.ts",
  "src/data/ros2/ros2Sessions.ts",
  "src/data/eval_deployment/physicalAISessions.ts",
  "src/data/eval_deployment/safetySystemSessions.ts",
  "src/data/eval_deployment/integrationProjectSessions.ts",
  "src/data/eval_deployment/finalExamQuestions.ts",
  "src/data/gap_reinforcement/remainingGapSessions.ts",
  "src/data/eval_deployment/finalImprovementSessions.ts",
  "src/data/gap_reinforcement/structuralImprovementSessions.ts",
  "src/data/eval_deployment/promptContextHarnessSessions.ts",
  "src/data/eval_deployment/aiDeploymentPipelineSessions.ts",
  "src/data/eval_deployment/assessmentReinforcementSessions.ts",
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
const visualizerHub = visualizerHubSource;
const searchBar = fs.readFileSync("src/components/SearchBar.tsx", "utf8");
const sidebar = fs.readFileSync("src/components/Sidebar.tsx", "utf8");
const practicePanel = fs.readFileSync("src/components/PracticePanel.tsx", "utf8");
assert("MathText used in theory and quiz", theoryPanel.includes("MathText") && quizPanel.includes("MathText"));
assert("wrong-answer recording wired", quizPanel.includes("onRecordWrongAnswers") && fs.readFileSync("src/App.tsx", "utf8").includes("recordWrongAnswers"));
assert("visual empty state shows mini graphs", visualizerHub.includes("EmptyVisualizer") && visualizerHub.includes("MiniGraph"));
assert(
  "v2 visualization specs render interactive sliders",
  visualizerHub.includes("VisualizationSpecInteractiveCard") && visualizerHub.includes("spec.parameters.map") && visualizerHub.includes("Slider"),
);
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
