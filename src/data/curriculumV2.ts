import type { CurriculumModule, Session } from "../types";
import {
  aPlusControlSessions,
  aPlusCppRobotSessions,
  aPlusDrivingSessions,
  aPlusMathSessions,
  aPlusPhysicalAISessions,
  aPlusRobotMathSessions,
  aPlusRos2Sessions,
  aPlusVisionSessions,
} from "./aPlusExtensionSessions";
import { autonomousDrivingSessions } from "./autonomousDrivingSessions";
import { backpropSessions } from "./backpropSessions";
import { calculusSessions } from "./calculusSessions";
import { cnnBasicSessions } from "./cnnBasicSessions";
import { cppEigenSessions } from "./cppEigenSessions";
import {
  criticalDrivingSessions,
  criticalMathSessions,
  criticalPhysicalAISessions,
  criticalRobotDynamicsSessions,
  criticalRos2Sessions,
  criticalSafetySessions,
  criticalVisionDeploymentSessions,
} from "./criticalGapSessions";
import { convexOptimizationSessions } from "./convexOptimizationSessions";
import { crossProductTorqueSessions } from "./crossProductTorqueSessions";
import { curriculum as legacyCurriculum } from "./curriculum";
import { depthEstimationSessions } from "./depthEstimationSessions";
import { dynamicsControlSessions } from "./dynamicsControlSessions";
import { dwaObstacleSessions } from "./dwaObstacleSessions";
import { finalExamSessions } from "./finalExamQuestions";
import {
  contentQualityRemediationChecklist,
  finalControlDepthSessions,
  finalDrivingDepthSessions,
  finalIntegrationDepthSessions,
  finalImprovementRoadmap,
  finalMathDepthSessions,
  finalPhysicalAIDepthSessions,
  finalRobotMathDepthSessions,
  finalSafetyDepthSessions,
  finalVisionDeploymentDepthSessions,
  mathFoundationAuditChecklist,
  physicalAICoreAuditChecklist,
} from "./finalImprovementSessions";
import { imuPreintegrationSessions } from "./imuPreintegrationSessions";
import { integralEnergySessions } from "./integralEnergySessions";
import { integrationProjectSessions } from "./integrationProjectSessions";
import { kalmanFilterSessions } from "./kalmanFilterSessions";
import { lyapunovStabilitySessions } from "./lyapunovStabilitySessions";
import { mathFoundationSessions } from "./mathFoundationSessions";
import { mpcSessions } from "./mpcSessions";
import { numericalJacobianSessions } from "./numericalJacobianSessions";
import { odeSessions } from "./odeSessions";
import { particleFilterSessions } from "./particleFilterSessions";
import { pathPlanningSessions } from "./pathPlanningSessions";
import { physicalAISessions } from "./physicalAISessions";
import { pinholeProjectionSessions } from "./pinholeProjectionSessions";
import { poseGraphSLAMSessions } from "./poseGraphSLAMSessions";
import { poseEstimationSessions } from "./poseEstimationSessions";
import { pytorchBCSessions } from "./pytorchBCSessions";
import { quaternionSessions } from "./quaternionSessions";
import {
  remainingContactSessions,
  remainingControlExtSessions,
  remainingControlSessions,
  remainingPhysicalAISessions,
  remainingRobotMathSessions,
} from "./remainingGapSessions";
import { rlBasicSessions } from "./rlBasicSessions";
import { robotFoundationModelSessions } from "./robotFoundationModelSessions";
import { opencvBasicSessions } from "./opencvBasicSessions";
import { ros2ControlPidSessions } from "./ros2ControlPidSessions";
import { ros2SubscriberLoopSessions } from "./ros2SubscriberLoopSessions";
import { slamSessions } from "./slamSessions";
import { robotMathSessions } from "./robotMathSessions";
import { robotVisionSessions } from "./robotVisionSessions";
import { ros2Sessions } from "./ros2Sessions";
import { safetySystemSessions } from "./safetySystemSessions";
import { semanticSegmentationSessions } from "./semanticSegmentationSessions";
import { sensorFusionSessions } from "./sensorFusionSessions";
import { signalProcessingSessions } from "./signalProcessingSessions";
import { stateSpaceSessions } from "./stateSpaceSessions";
import { sessionsToModule } from "./sessionAdapter";
import {
  promptHarnessSessions,
  structuralDrivingSessions,
  structuralMathFoundationSessions,
  structuralQualityRemediationChecklist,
  structuralRobotMathSessions,
  structuralRos2Sessions,
  structuralVisionSessions,
} from "./structuralImprovementSessions";
import { svdJacobianApplicationSessions } from "./svdJacobianApplicationSessions";
import { trajectoryPlanningSessions } from "./trajectoryPlanningSessions";
import { vlaConceptSessions } from "./vlaConceptSessions";
import { v2VisualizationCatalog } from "./visualizationCatalog";
import { worldModelSessions } from "./worldModelSessions";

export { legacyCurriculum };

type PartDefinition = {
  id: string;
  title: string;
  summary: string;
  sessions: Session[];
};

export const v2PartDefinitions: PartDefinition[] = [
  {
    id: "v2-part-1-math-foundations",
    title: "Part 1. Physical AI를 위한 기초수학",
    summary: "고유값, SVD, 최소제곱, MLE, 신호처리를 코드랩과 시각화로 연결한다.",
    sessions: [
      ...structuralMathFoundationSessions,
      ...criticalMathSessions,
      ...finalMathDepthSessions,
      ...aPlusMathSessions,
      ...crossProductTorqueSessions,
      ...integralEnergySessions,
      ...backpropSessions,
      ...convexOptimizationSessions,
      ...signalProcessingSessions,
      ...odeSessions,
      ...calculusSessions,
      ...mathFoundationSessions,
    ],
  },
  {
    id: "v2-part-2-robot-math",
    title: "Part 2. 로봇 수학",
    summary: "좌표계, 회전, FK/IK, Jacobian 세션을 v2 Session 구조로 확장할 공간이다.",
    sessions: [
      ...structuralRobotMathSessions,
      ...remainingRobotMathSessions,
      ...finalRobotMathDepthSessions,
      ...aPlusRobotMathSessions,
      ...quaternionSessions,
      ...svdJacobianApplicationSessions,
      ...numericalJacobianSessions,
      ...trajectoryPlanningSessions,
      ...robotMathSessions,
    ],
  },
  {
    id: "v2-part-cpp-robot-sw",
    title: "Part C++. C++ 로봇SW 기초",
    summary: "Python에서 이해한 로봇 수학을 C++ Eigen 기반 실전 구현으로 연결한다.",
    sessions: [...criticalRos2Sessions, ...aPlusCppRobotSessions, ...cppEigenSessions],
  },
  {
    id: "v2-part-3-dynamics-control",
    title: "Part 3. 로봇 동역학과 제어",
    summary: "Lagrange 동역학, 토크 계산, LQR/Riccati를 실행형 코드랩으로 연결한다.",
    sessions: [
      ...remainingControlSessions,
      ...remainingControlExtSessions,
      ...remainingContactSessions,
      ...finalControlDepthSessions,
      ...criticalRobotDynamicsSessions,
      ...aPlusControlSessions,
      ...mpcSessions,
      ...lyapunovStabilitySessions,
      ...stateSpaceSessions,
      ...dynamicsControlSessions,
    ],
  },
  {
    id: "v2-part-4-autonomous-driving",
    title: "Part 4. 자율주행과 SLAM",
    summary: "EKF localization과 covariance ellipse 해석을 우선 제공한다.",
    sessions: [
      ...structuralDrivingSessions,
      ...criticalDrivingSessions,
      ...finalDrivingDepthSessions,
      ...aPlusDrivingSessions,
      ...particleFilterSessions,
      ...sensorFusionSessions,
      ...imuPreintegrationSessions,
      ...poseGraphSLAMSessions,
      ...dwaObstacleSessions,
      ...slamSessions,
      ...kalmanFilterSessions,
      ...autonomousDrivingSessions,
      ...pathPlanningSessions,
    ],
  },
  {
    id: "v2-part-5-robot-vision",
    title: "Part 5. 인식 AI와 로봇 비전",
    summary: "Object detection, IoU, NMS를 robot action pipeline과 연결한다.",
    sessions: [
      ...structuralVisionSessions,
      ...criticalVisionDeploymentSessions,
      ...finalVisionDeploymentDepthSessions,
      ...aPlusVisionSessions,
      ...opencvBasicSessions,
      ...poseEstimationSessions,
      ...depthEstimationSessions,
      ...cnnBasicSessions,
      ...pinholeProjectionSessions,
      ...semanticSegmentationSessions,
      ...robotVisionSessions,
    ],
  },
  {
    id: "v2-part-6-ros2",
    title: "Part 6. ROS2 실전 연결",
    summary: "TF2 frame/time 오류를 코드와 시스템 진단으로 다룬다.",
    sessions: [...structuralRos2Sessions, ...aPlusRos2Sessions, ...ros2ControlPidSessions, ...ros2SubscriberLoopSessions, ...ros2Sessions],
  },
  {
    id: "v2-part-7-physical-ai",
    title: "Part 7. Physical AI / Embodied AI",
    summary: "Behavior Cloning, Sim2Real, domain randomization을 실제 정책 학습 흐름으로 연결한다.",
    sessions: [
      ...remainingPhysicalAISessions,
      ...finalPhysicalAIDepthSessions,
      ...criticalPhysicalAISessions,
      ...aPlusPhysicalAISessions,
      ...rlBasicSessions,
      ...vlaConceptSessions,
      ...worldModelSessions,
      ...robotFoundationModelSessions,
      ...pytorchBCSessions,
      ...physicalAISessions,
    ],
  },
  {
    id: "v2-part-8-safety-system",
    title: "Part 8. 실시간성, 안전성, 시스템 통합",
    summary: "Watchdog, failsafe, latency, logging 세션을 v2 구조로 확장할 공간이다.",
    sessions: [...criticalSafetySessions, ...finalSafetyDepthSessions, ...safetySystemSessions],
  },
  {
    id: "v2-part-9-integration-projects",
    title: "Part 9. 통합 미니 프로젝트",
    summary: "Localization, arm control, detection-to-action, BC, Sim2Real 프로젝트를 담을 공간이다.",
    sessions: [...finalIntegrationDepthSessions, ...integrationProjectSessions],
  },
  {
    id: "v2-part-11-prompt-context-harness",
    title: "Part 11. 프롬프트/컨텍스트/하네스 엔지니어링",
    summary: "Physical AI agent를 프롬프트, 검색 컨텍스트, JSON schema, golden eval harness로 검증 가능하게 만든다.",
    sessions: promptHarnessSessions,
  },
  {
    id: "v2-part-10-final-exam",
    title: "Part 10. 최종 평가",
    summary: "수학 계산, 수식 유도, 코드 구현, 시스템 설계를 종합 평가한다.",
    sessions: finalExamSessions,
  },
];

export const v2Sessions: Session[] = v2PartDefinitions.flatMap((part) => part.sessions);
export {
  contentQualityRemediationChecklist,
  finalImprovementRoadmap,
  mathFoundationAuditChecklist,
  physicalAICoreAuditChecklist,
  structuralQualityRemediationChecklist,
  v2VisualizationCatalog,
};

export const v2CurriculumModules: CurriculumModule[] = v2PartDefinitions.map((part) =>
  sessionsToModule(part.id, part.title, part.summary, part.sessions),
);

const legacySectionsById = new Map(
  legacyCurriculum.flatMap((module) => module.sections.map((section) => [section.id, section] as const)),
);

const pickLegacySections = (ids: string[]) =>
  ids.map((id) => {
    const section = legacySectionsById.get(id);
    if (!section) throw new Error(`Missing legacy section: ${id}`);
    return section;
  });

const legacySectionIdsByPartId: Record<string, string[]> = {
  "v2-part-1-math-foundations": [
    "math-foundations--algebra-functions-graphs",
    "math-foundations--trigonometry-unit-circle",
    "math-foundations--homogeneous-transform-inverse",
    "math-foundations--numerical-methods-stability",
    "cpp-python-ros2--python-validation",
    "cpp-python-ros2--numpy-scipy-validation",
  ],
  "v2-part-2-robot-math": [
    "manipulator-kinematics--pose-representation",
    "manipulator-kinematics--screw-axis-twist",
    "manipulator-kinematics--dh-poe",
    "manipulator-kinematics--dh-table-construction",
    "manipulator-kinematics--fk-unit-tests",
    "manipulator-kinematics--manipulability-ellipsoid",
  ],
  "v2-part-cpp-robot-sw": [
    "cpp-python-ros2--cpp-structure",
    "cpp-python-ros2--cmake-package-dependencies",
    "cpp-python-ros2--eigen-opencv-bindings",
  ],
  "v2-part-3-dynamics-control": [
    "manipulator-dynamics-control--time-scaling-and-limits",
    "manipulator-dynamics-control--computed-torque-stability",
    "manipulator-dynamics-control--moveit-ros2-control",
    "manipulator-dynamics-control--planning-scene-collision",
    "manipulator-dynamics-control--ros2-control-hardware-interface",
  ],
  "v2-part-4-autonomous-driving": [
    "mobile-localization--kinematics-odometry",
    "mobile-localization--odometry-error-propagation",
    "mobile-localization--sensor-time-sync",
    "mobile-localization--map-odom-base-link",
    "mobile-localization--robot-localization-yaml",
    "mobile-planning-control--occupancy-costmap",
    "mobile-planning-control--costmap-inflation-footprint",
    "mobile-planning-control--local-planner-rollout",
    "mobile-planning-control--dwb-mppi-score-functions",
    "mobile-planning-control--nav2-behavior-tree",
    "mobile-planning-control--slam-toolbox-debug",
    "mobile-local-control--pure-pursuit-curvature",
    "mobile-local-control--stanley-control",
    "mobile-local-control--tracking-error-sweep",
    "mobile-local-control--controller-latency-compensation",
  ],
  "v2-part-5-robot-vision": [
    "ai-foundations--dataset-metrics",
    "ai-foundations--data-leakage-class-imbalance",
    "ai-foundations--pcl-filter-segmentation",
    "ai-foundations--preprocessing-contract",
    "ai-foundations--onnx-runtime-deploy",
    "ai-foundations--onnx-cpp-buffer-contract",
    "ai-foundations--tensorrt-jetson-latency",
    "ai-foundations--ros-image-inference-node",
  ],
  "v2-part-6-ros2": [
    "cpp-python-ros2--ros2-system",
    "cpp-python-ros2--ros2-pubsub-cpp-python",
    "cpp-python-ros2--ros2-parameters-launch",
    "cpp-python-ros2--ros2-qos-executor-callback",
    "cpp-python-ros2--ros2-actions-services",
    "cpp-python-ros2--tf2-frames-time",
    "cpp-python-ros2--experiment-logging",
    "cpp-python-ros2--rosbag-foxglove-plotjuggler",
  ],
  "v2-part-7-physical-ai": [
    "llm-engineering--prompt-design",
    "llm-engineering--tool-calling-contract",
    "llm-engineering--retrieval-context",
    "llm-engineering--chunking-embedding-eval",
    "llm-engineering--eval-harness",
    "llm-engineering--agent-trace-debugging",
  ],
  "v2-part-8-safety-system": [
    "realtime--loop-latency",
    "realtime--executor-qos",
    "safety-control-fusion-eval--safety-monitor",
    "safety-control-fusion-eval--advanced-control",
    "safety-control-fusion-eval--evaluation-regression",
  ],
  "v2-part-9-integration-projects": [
    "jetrover-vs-sim--hardware-scope",
    "jetrover-vs-sim--simulation-sweep",
    "recommended-stack--arm-stack",
    "recommended-stack--nav-stack",
    "recommended-stack--ai-stack",
    "weekly-routine--weekly-loop",
    "weekly-routine--review-log",
    "final-loop--python-cpp-ros-loop",
    "final-loop--log-evaluate",
  ],
  "v2-part-10-final-exam": [
    "overview-core--concept-map",
    "overview-core--capability-criteria",
    "minimum-done--arm-check",
    "minimum-done--mobile-check",
    "minimum-done--ai-check",
    "minimum-done--llm-check",
    "judgement-criteria--ten-axis-rubric",
    "judgement-criteria--self-assessment",
    "official-links--source-map",
    "official-links--doc-reading",
  ],
};

const mergeUsefulLegacySectionsIntoParts = (modules: CurriculumModule[]): CurriculumModule[] =>
  modules.map((module) => ({
    ...module,
    sections: [
      ...module.sections,
      ...pickLegacySections(legacySectionIdsByPartId[module.id] ?? []),
    ],
  }));

export const curriculumV2: CurriculumModule[] = [
  ...mergeUsefulLegacySectionsIntoParts(v2CurriculumModules.filter((module) => module.sections.length > 0)),
];

export const curriculum = curriculumV2;
