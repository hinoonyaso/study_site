import type {
  CodeLab,
  CurriculumModule,
  ExecutableLabId,
  LessonSection,
  PracticeBlock,
  QuizQuestion,
  Session,
  TheoryGraphId,
  TheoryUnit,
  VisualizerId,
} from "../types";

const graphIdsByPart = (session: Session): TheoryGraphId[] => {
  if (session.id.includes("cpp_eigen_fk")) return ["rotation-basis", "state-machine"];
  if (session.id.includes("kalman_filter")) return ["covariance-ellipse", "gaussian-kf"];
  if (session.id.includes("eigen") || session.id.includes("gaussian") || session.id.includes("low_pass")) return ["covariance-ellipse", "gaussian-kf"];
  if (session.id.includes("svd") || session.id.includes("least")) return ["rotation-basis", "gradient-descent"];
  if (session.id.includes("dynamics") || session.id.includes("lqr")) return ["trajectory-polynomial", "state-machine"];
  if (session.id.includes("ekf")) return ["covariance-ellipse", "gaussian-kf"];
  if (session.id.includes("object_detection")) return ["confusion-matrix", "state-machine"];
  if (session.id.includes("safety")) return ["state-machine"];
  if (session.id.includes("behavior") || session.id.includes("sim2real")) return ["gradient-descent", "state-machine"];
  return ["state-machine"];
};

const visualizerIdBySession = (session: Session): VisualizerId => {
  if (session.id.includes("matrix_multiplication_grid_basics")) return "matrix-grid";
  if (session.id.includes("pseudoinverse_rank_deficient_basics")) return "svd-jacobian";
  if (session.id.includes("partial_derivative_gradient_tangent_plane")) return "loss-landscape";
  if (session.id.includes("gradient_descent_loss_landscape")) return "loss-landscape";
  if (session.id.includes("gaussian_bayes_update_distribution")) return "bayes-gaussian";
  if (session.id.includes("finite_difference_ode_solver_basics")) return "ode-finite-diff";
  if (session.id.includes("cross_product_torque")) return "cross-product-3d";
  if (session.id.includes("vector_matrix_inverse_cross_product_basics")) return "matrix-grid";
  if (session.id.includes("fk_matrix_ik_singularity_visual_lab")) return "jacobian-singularity";
  if (session.id.includes("bicycle_model_stanley_controller")) return "bicycle-stanley";
  if (session.id.includes("dataset_label_split_confusion_matrix_practice")) return "ai-metrics";
  if (session.id.includes("ros2_cli_command_diagnostics_lab")) return "ros2-loop";
  if (session.id.includes("prompt_context_eval_harness_engineering")) return "prompt-eval-harness";
  if (session.id.includes("null_space")) return "svd-jacobian";
  if (session.id.includes("contact_dynamics") || session.id.includes("friction_cone")) return "dynamics-torque";
  if (session.id.includes("ilqr")) return "trajectory-profile";
  if (session.id.includes("dagger")) return "physical-ai-flow";
  if (session.id.includes("dreamer_rssm")) return "world-model";
  if (session.id.includes("laplace_z")) return "pid-step-response";
  if (session.id.includes("ppo_sac")) return "rl-reward";
  if (session.id.includes("ukf")) return "ekf-covariance";
  if (session.id.includes("tensorrt")) return "latency";
  if (session.id.includes("realtime_control_loop")) return "latency";
  if (session.id.includes("cbf")) return "lyapunov-energy";
  if (session.id.includes("vlm")) return "vla-architecture";
  if (session.id.includes("nav2_behavior_tree")) return "ros2-loop";
  if (session.id.includes("mle_sensor")) return "kalman";
  if (session.id.includes("lie_algebra")) return "so3-rotation";
  if (session.id.includes("cpp_eigen_ik")) return "robot-arm-3d";
  if (session.id.includes("grasp_pose")) return "robot-arm-3d";
  if (session.id.includes("impedance")) return "pid-step-response";
  if (session.id.includes("rrt")) return "astar";
  if (session.id.includes("stereo_calibration")) return "depth-map";
  if (session.id.includes("point_cloud_icp")) return "pose-estimation";
  if (session.id.includes("ros2_package")) return "ros2-loop";
  if (session.id.includes("urdf")) return "robot-arm-3d";
  if (session.id.includes("attention")) return "foundation-model";
  if (session.id.includes("pid_control")) return "pid-step-response";
  if (session.id.includes("ros2_control_pid")) return "ros2-loop";
  if (session.id.includes("opencv")) return "opencv-threshold";
  if (session.id.includes("pose_estimation")) return "pose-estimation";
  if (session.id.includes("depth_estimation")) return "depth-map";
  if (session.id.includes("backprop")) return "backprop-chain";
  if (session.id.includes("svd_jacobian")) return "svd-jacobian";
  if (session.id.includes("robot_foundation")) return "foundation-model";
  if (session.id.includes("particle_filter")) return "particle-filter";
  if (session.id.includes("mpc")) return "mpc-horizon";
  if (session.id.includes("trajectory")) return "trajectory-profile";
  if (session.id.includes("cnn")) return "cnn-feature-map";
  if (session.id.includes("q_learning") || session.id.includes("policy_gradient")) return "rl-reward";
  if (session.id.includes("signal_processing")) return "fft-spectrum";
  if (session.id.includes("pose_graph")) return "pose-graph";
  if (session.id.includes("dwa")) return "dwa-velocity";
  if (session.id.includes("pinhole")) return "camera-projection";
  if (session.id.includes("segmentation")) return "segmentation-mask";
  if (session.id.includes("vla")) return "vla-architecture";
  if (session.id.includes("world_model")) return "world-model";
  if (session.id.includes("lyapunov")) return "lyapunov-energy";
  if (session.id.includes("sensor_fusion")) return "sensor-fusion";
  if (session.id.includes("ros2_subscriber")) return "ros2-loop";
  if (session.id.includes("cpp_eigen_fk") || session.id.includes("forward_kinematics")) return "robot-arm-3d";
  if (session.id.includes("kalman_filter")) return "kalman";
  if (session.id.includes("quaternion")) return "quaternion-slerp";
  if (session.id.includes("cpp_eigen_fk")) return "manipulator";
  if (session.id.includes("3d_rotation_so3")) return "so3-rotation";
  if (
    session.id.includes("forward_kinematics") ||
    session.id.includes("inverse_kinematics") ||
    session.id.includes("jacobian") ||
    session.id.includes("damped_least_squares") ||
    session.id.includes("dh_parameter")
  ) return "manipulator";
  if (session.id.includes("robot_dynamics")) return "dynamics-torque";
  if (session.id.includes("ekf")) return "ekf-covariance";
  if (session.id.includes("behavior")) return "physical-ai-flow";
  if (session.id.includes("sim2real")) return "sim2real-gap";
  if (session.id.includes("object_detection")) return "ai-metrics";
  if (session.id.includes("safety")) return "latency";
  if (session.id.includes("tf2")) return "latency";
  if (session.id.includes("lqr")) return "sweep";
  if (session.id.includes("low_pass")) return "kalman";
  return "linear-algebra";
};

const executableLabBySession = (session: Session): ExecutableLabId => {
  if (session.id.includes("vector_matrix_inverse_cross_product_basics")) return "homogeneous-transform";
  if (session.id.includes("fk_matrix_ik_singularity_visual_lab")) return "two-link-fk";
  if (session.id.includes("bicycle_model_stanley_controller")) return "stanley-controller";
  if (session.id.includes("dataset_label_split_confusion_matrix_practice")) return "ai-metrics";
  if (session.id.includes("ros2_cli_command_diagnostics_lab")) return "ros2-sub-pub-loop";
  if (session.id.includes("prompt_context_eval_harness_engineering")) return "vla-action-token";
  if (session.id.includes("null_space")) return "svd-jacobian-condition";
  if (session.id.includes("contact_dynamics") || session.id.includes("friction_cone")) return "ros2-control-pid";
  if (session.id.includes("ilqr")) return "trajectory-quintic";
  if (session.id.includes("dagger")) return "ai-metrics";
  if (session.id.includes("dreamer_rssm")) return "world-model-rollout";
  if (session.id.includes("laplace_z")) return "pid-response";
  if (session.id.includes("ppo_sac")) return "q-learning-gridworld";
  if (session.id.includes("ukf")) return "ekf-2d";
  if (session.id.includes("tensorrt")) return "latency-stats";
  if (session.id.includes("realtime_control_loop")) return "latency-stats";
  if (session.id.includes("cbf")) return "mpc-1d";
  if (session.id.includes("vlm")) return "vla-action-token";
  if (session.id.includes("nav2_behavior_tree")) return "ros2-sub-pub-loop";
  if (session.id.includes("mle_sensor")) return "kalman-1d";
  if (session.id.includes("lie_algebra")) return "homogeneous-transform";
  if (session.id.includes("cpp_eigen_ik")) return "two-link-fk";
  if (session.id.includes("grasp_pose")) return "camera-projection";
  if (session.id.includes("impedance")) return "pid-response";
  if (session.id.includes("rrt")) return "astar-grid";
  if (session.id.includes("stereo_calibration")) return "stereo-depth";
  if (session.id.includes("semantic_segmentation_training")) return "segmentation-iou";
  if (session.id.includes("point_cloud_icp")) return "svd-jacobian-condition";
  if (session.id.includes("ros2_package")) return "ros2-sub-pub-loop";
  if (session.id.includes("urdf")) return "two-link-fk";
  if (session.id.includes("attention")) return "vla-action-token";
  if (session.id.includes("pid_control")) return "pid-response";
  if (session.id.includes("ros2_control_pid")) return "ros2-control-pid";
  if (session.id.includes("opencv")) return "opencv-contour";
  if (session.id.includes("pose_estimation")) return "pnp-pose";
  if (session.id.includes("depth_estimation")) return "stereo-depth";
  if (session.id.includes("backprop")) return "backprop-numpy";
  if (session.id.includes("svd_jacobian")) return "svd-jacobian-condition";
  if (session.id.includes("robot_foundation")) return "vla-action-token";
  if (session.id.includes("particle_filter")) return "particle-filter-sir";
  if (session.id.includes("mpc")) return "mpc-1d";
  if (session.id.includes("trajectory")) return "trajectory-quintic";
  if (session.id.includes("cnn")) return "conv2d-from-scratch";
  if (session.id.includes("q_learning") || session.id.includes("policy_gradient")) return "q-learning-gridworld";
  if (session.id.includes("signal_processing")) return "fft-lpf";
  if (session.id.includes("pose_graph")) return "pose-graph-loop";
  if (session.id.includes("dwa")) return "dwa-velocity";
  if (session.id.includes("imu_preintegration")) return "imu-bias";
  if (session.id.includes("segmentation")) return "segmentation-iou";
  if (session.id.includes("vla")) return "vla-action-token";
  if (session.id.includes("world_model")) return "world-model-rollout";
  if (session.id.includes("ros2_subscriber")) return "ros2-sub-pub-loop";
  if (session.id.includes("pinhole")) return "camera-projection";
  if (session.id.includes("kalman_filter")) return "kalman-1d";
  if (session.id.includes("cpp_eigen_fk")) return "two-link-fk";
  if (session.id.includes("ekf")) return "ekf-2d";
  if (session.id.includes("object_detection")) return "ai-metrics";
  if (session.id.includes("lqr")) return "lqr-step";
  if (session.id.includes("low_pass")) return "kalman-1d";
  if (session.id.includes("safety")) return "latency-stats";
  if (session.id.includes("tf2")) return "tf-tree-latency";
  if (session.id.includes("sim2real")) return "rosbag-metric-analyzer";
  if (session.id.includes("behavior")) return "ai-metrics";
  if (session.id.includes("robot_dynamics")) return "two-link-fk";
  return "svd-pseudoinverse";
};

const codeLabToExample = (lab: CodeLab) => ({
  id: lab.id,
  title: lab.title,
  language: lab.language === "cpp" ? "cpp" as const : "python" as const,
  starterCode: lab.starterCode,
  solutionCode: lab.solutionCode,
  explanation: lab.theoryConnection,
  checks: ["TODO 제거", "핵심 함수 구현", "testCode 통과"],
  sourceIds: [],
});

const practiceBlockFor = (session: Session, language: "cpp" | "python"): PracticeBlock => {
  const labs = session.codeLabs.filter((lab) => (language === "cpp" ? lab.language === "cpp" : lab.language !== "cpp"));
  const fallback = session.codeLabs[0];
  const primary = labs[0] ?? fallback;
  return {
    goal: `${session.title} 코드랩을 ${language === "cpp" ? "C++" : "Python"}로 구현한다.`,
    code: primary?.starterCode ?? "",
    starterCode: primary?.starterCode ?? "",
    solutionCode: primary?.solutionCode ?? "",
    expected: primary?.expectedOutput ?? "",
    expectedOutput: primary?.expectedOutput ?? "",
    tasks: [
      "starterCode의 TODO를 직접 구현한다.",
      "testCode의 정상/경계/실패 케이스를 통과한다.",
      primary?.extensionTask ?? "파라미터를 바꾸어 결과 변화를 해석한다.",
    ],
    parameters: session.visualizations.flatMap((visualization) =>
      visualization.parameters.map((parameter) => ({
        name: parameter.name,
        defaultValue: String(parameter.default),
        unit: parameter.symbol,
        description: parameter.description,
      })),
    ),
    checks: primary?.commonBugs ?? [],
    simulationId: visualizerIdBySession(session),
    examples: labs.length > 0 ? labs.map(codeLabToExample) : fallback ? [codeLabToExample(fallback)] : [],
  };
};

const theoryUnitFor = (session: Session): TheoryUnit => ({
  id: `${session.id}-v2-theory`,
  title: `${session.title} · v2 표준 세션`,
  summary: session.theory.definition,
  intuition: session.theory.intuition,
  assumptions: ["각도는 별도 표기가 없으면 radian 기준이다.", "모든 frame과 단위는 코드랩 입력 전에 고정한다."],
  details: [session.theory.whyItMatters, session.theory.robotApplication, ...session.learningObjectives],
  formulas: session.theory.equations.map((equation) => ({
    label: equation.label,
    expression: equation.expression,
    description: `${equation.explanation} 항 의미: ${equation.terms.map((term) => `${term.symbol}=${term.meaning}`).join(", ")}`,
  })),
  derivation: session.theory.derivation.map((item) => `${item.title}: ${item.detail}${item.equation ? ` (${item.equation})` : ""}`),
  proof: ["정의에서 시작해 수식 항 의미를 분리하고, 손계산과 코드랩 testCode로 같은 입력을 검산한다."],
  engineeringMeaning: [session.theory.robotApplication],
  implementationNotes: session.codeLabs.map((lab) => `${lab.title}: ${lab.runCommand}`),
  figures: graphIdsByPart(session).map((id) => ({ id, title: id, explanation: `${session.title}의 v2 연결 그래프` })),
  graphExplanations: session.visualizations.map((visualization) => `${visualization.title}: ${visualization.connectedEquation}`),
  workedExample: {
    prompt: session.theory.handCalculation.problem,
    steps: session.theory.handCalculation.steps,
    result: session.theory.handCalculation.answer,
  },
  commonMistakes: session.codeLabs.flatMap((lab) => lab.commonBugs).slice(0, 6),
  sourceIds: [],
  readingGuide: ["정의", "수식 항 의미", "유도", "손계산", "코드랩", "시각화 해석 문제"],
});

const legacyQuizFor = (question: Session["quizzes"][number]): QuizQuestion => ({
  id: question.id,
  type: question.choices?.length ? "choice" : "blank",
  prompt: question.question,
  choices: question.choices,
  answer: question.expectedAnswer,
  explanation: question.explanation,
  difficulty: question.difficulty === "easy" ? "기초" : question.difficulty === "medium" ? "계산" : "전문",
  points: question.type === "system_design" || question.type === "robot_scenario" ? 2 : 1,
});

const levelBadge = (session: Session): string | undefined => {
  if (!session.level) return undefined;
  const label = session.level === "beginner" ? "🟢 입문" : session.level === "intermediate" ? "🟡 중급" : "🔴 고급";
  const stars = session.difficulty === "easy" ? "★☆☆" : session.difficulty === "medium" ? "★★☆" : "★★★";
  return `${label} ${stars}`;
};

export const sessionToLessonSection = (session: Session): LessonSection => ({
  id: session.id,
  title: session.title,
  groupTitle: levelBadge(session),
  focus: `${session.part} · ${session.learningObjectives.join(" ")}`,
  level: session.level === "beginner" ? 1 : session.level === "intermediate" ? 2 : 3,
  theory: [theoryUnitFor(session)],
  why: [session.theory.whyItMatters, session.theory.robotApplication],
  cppPractice: practiceBlockFor(session, "cpp"),
  pythonPractice: practiceBlockFor(session, "python"),
  quiz: session.quizzes.map(legacyQuizFor),
  visualizerId: visualizerIdBySession(session),
  graphIds: graphIdsByPart(session),
  executableLabId: executableLabBySession(session),
  v2Session: session,
  visualizationSpecs: session.visualizations,
  prerequisiteIds: session.prerequisites,
  scenarioTags: session.wrongAnswerTags.map((tag) => tag.conceptTag),
  checklist: [
    "개념 정의와 필요한 이유를 설명했다.",
    "수식 항 의미와 유도 과정을 손으로 따라갔다.",
    "starterCode TODO를 구현하고 testCode 기준을 확인했다.",
    "시각화 파라미터와 실패 상황을 해석했다.",
    "오답 conceptTag와 다음 세션 연결을 확인했다.",
  ],
});

export const sessionsToModule = (id: string, title: string, summary: string, sessions: Session[]): CurriculumModule => ({
  id,
  title,
  summary,
  sections: sessions.map(sessionToLessonSection),
});
