import type { CurriculumModule, Session } from "../../types";
import {
  aPlusControlSessions,
  aPlusCppRobotSessions,
  aPlusDrivingSessions,
  aPlusMathSessions,
  aPlusPhysicalAISessions,
  aPlusRobotMathSessions,
  aPlusRos2Sessions,
  aPlusVisionSessions,
} from "../gap_reinforcement/aPlusExtensionSessions";
import { aiDeploymentPipelineSessions } from "../eval_deployment/aiDeploymentPipelineSessions";
import { autonomousDrivingSessions } from "../autonomy/autonomousDrivingSessions";
import { bicycleModelStanleySessions } from "../autonomy/bicycleModelStanleySessions";
import { occupancyGridCostmapSessions } from "../slam/occupancyGridCostmapSessions";
import { backpropSessions } from "../vision_ai/backpropSessions";
import { calculusSessions } from "../math/calculusSessions";
import { cnnBasicSessions } from "../vision_ai/cnnBasicSessions";
import { cppEigenSessions } from "../robotics/cppEigenSessions";
import {
  criticalDrivingSessions,
  criticalMathSessions,
  criticalPhysicalAISessions,
  criticalRobotDynamicsSessions,
  criticalRos2Sessions,
  criticalSafetySessions,
  criticalVisionDeploymentSessions,
} from "../gap_reinforcement/criticalGapSessions";
import { convexOptimizationSessions } from "../math/convexOptimizationSessions";
import { crossProductTorqueSessions } from "../math/crossProductTorqueSessions";
import { legacySections } from "../legacy/legacySections";
import { depthEstimationSessions } from "../vision_ai/depthEstimationSessions";
import { dynamicsControlSessions } from "../robotics/dynamicsControlSessions";
import { dwaObstacleSessions } from "../autonomy/dwaObstacleSessions";
import { finalExamSessions } from "../eval_deployment/finalExamQuestions";
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
} from "../eval_deployment/finalImprovementSessions";
import { foundationGapSessions } from "../gap_reinforcement/foundationGapSessions";
import { imuPreintegrationSessions } from "../slam/imuPreintegrationSessions";
import { integralEnergySessions } from "../math/integralEnergySessions";
import { integrationProjectSessions } from "../eval_deployment/integrationProjectSessions";
import { kalmanFilterSessions } from "../slam/kalmanFilterSessions";
import { lyapunovStabilitySessions } from "../math/lyapunovStabilitySessions";
import { mathFoundationSessions } from "../math/mathFoundationSessions";
import { mpcSessions } from "../control/mpcSessions";
import { numericalJacobianSessions } from "../math/numericalJacobianSessions";
import { odeSessions } from "../math/odeSessions";
import { particleFilterSessions } from "../slam/particleFilterSessions";
import { pathPlanningSessions } from "../autonomy/pathPlanningSessions";
import { physicalAISessions } from "../eval_deployment/physicalAISessions";
import { pinholeProjectionSessions } from "../vision_ai/pinholeProjectionSessions";
import { poseGraphSLAMSessions } from "../slam/poseGraphSLAMSessions";
import { poseEstimationSessions } from "../vision_ai/poseEstimationSessions";
import { pytorchBCSessions } from "../vision_ai/pytorchBCSessions";
import {
  promptContextHarnessFeatureAudit,
  promptContextHarnessSessions,
} from "../eval_deployment/promptContextHarnessSessions";
import { quaternionSessions } from "../math/quaternionSessions";
import {
  remainingContactSessions,
  remainingControlExtSessions,
  remainingControlSessions,
  remainingPhysicalAISessions,
  remainingRobotMathSessions,
} from "../gap_reinforcement/remainingGapSessions";
import { rlBasicSessions } from "../vision_ai/rlBasicSessions";
import { robotFoundationModelSessions } from "../robotics/robotFoundationModelSessions";
import { opencvBasicSessions } from "../vision_ai/opencvBasicSessions";
import { ros2ControlPidSessions } from "../ros2/ros2ControlPidSessions";
import { ros2SubscriberLoopSessions } from "../ros2/ros2SubscriberLoopSessions";
import { slamSessions } from "../slam/slamSessions";
import { robotMathSessions } from "../robotics/robotMathSessions";
import { robotVisionSessions } from "../vision_ai/robotVisionSessions";
import { ros2Sessions } from "../ros2/ros2Sessions";
import { safetySystemSessions } from "../eval_deployment/safetySystemSessions";
import { semanticSegmentationSessions } from "../vision_ai/semanticSegmentationSessions";
import { sensorFusionSessions } from "../vision_ai/sensorFusionSessions";
import { signalProcessingSessions } from "../math/signalProcessingSessions";
import { stateSpaceSessions } from "../control/stateSpaceSessions";
import { sessionsToModule } from "./sessionAdapter";
import {
  promptHarnessSessions,
  structuralDrivingSessions,
  structuralMathFoundationSessions,
  structuralQualityRemediationChecklist,
  structuralRobotMathSessions,
  structuralRos2Sessions,
  structuralVisionSessions,
} from "../gap_reinforcement/structuralImprovementSessions";
import { svdJacobianApplicationSessions } from "../math/svdJacobianApplicationSessions";
import { trajectoryPlanningSessions } from "../robotics/trajectoryPlanningSessions";
import { vlaConceptSessions } from "../vision_ai/vlaConceptSessions";
import { v2VisualizationCatalog } from "./visualizationCatalog";
import { worldModelSessions } from "../vision_ai/worldModelSessions";



type PartDefinition = {
  id: string;
  title: string;
  summary: string;
  sessions: Session[];
};

const friendlySessionTitles: Record<string, string> = {
  // Math Foundations
  "eigenvalue_covariance_ellipse": "고유값과 불확실성 타원 (공분산)",
  "svd_condition_number": "SVD와 수치 안정성 (Condition Number)",
  "least_squares": "최소제곱법 (오차 줄이기)",
  "gaussian_mle": "가우시안 분포와 센서 노이즈 추정",
  "low_pass_filter_imu": "로우패스 필터로 센서 노이즈 잡기",
  "vector_matrix_basics": "벡터와 행렬 기초 (공간의 이해)",
  "probability_variable_gaussian": "확률변수와 가우시안 분포 기초",
  "calculus_basics": "미분과 적분 기초",
  "ode_basics": "상미분방정식(ODE) 기초",
  "signal_processing_fft": "신호 처리와 FFT 기초",
  // Robot Math
  "quaternion_slerp": "쿼터니언(Quaternion)과 부드러운 회전",
  "numerical_jacobian": "수치적 자코비안(Jacobian) 계산",
  "dh_parameters": "DH 파라미터 (로봇 관절 모델링)",
  "fk_ik_basics": "정기구학(FK)과 역기구학(IK) 기초",
  // Dynamics & Control
  "state_space_representation": "상태공간(State Space) 표현법",
  "pid_control": "PID 제어 (기본 피드백 제어)",
  "lyapunov_stability": "리아푸노프(Lyapunov) 안정성 이론",
  "mpc_basics": "모델 예측 제어(MPC) 기초",
  // Driving
  "bicycle_model": "자전거 모델 (차량 기구학)",
  "stanley_control": "스탠리(Stanley) 제어 알고리즘",
  "kalman_filter_basics": "칼만 필터(Kalman Filter) 기초",
  "occupancy_grid": "점유 격자 지도(Occupancy Grid)",
  "a_star_path_planning": "A* 경로 계획 알고리즘",
  "slam_basics": "SLAM (동시 위치추정 및 지도작성) 기초",
  "particle_filter": "파티클 필터(Particle Filter)",
  // Vision
  "opencv_basics": "OpenCV 기초와 이미지 처리",
  "pinhole_camera_model": "핀홀 카메라 모델과 투영",
  "cnn_basics": "CNN 기반 이미지 인식 기초",
  "semantic_segmentation": "시맨틱 세그멘테이션 (픽셀 단위 분류)",
  "pose_estimation": "자세 추정(Pose Estimation)",
  // ROS2
  "ros2_pub_sub": "ROS 2 Pub/Sub (노드 간 통신)",
  "ros2_parameters_launch": "ROS 2 파라미터와 Launch 파일",
  "ros2_qos": "ROS 2 QoS (통신 품질 제어)",
  // Physical AI
  "behavior_cloning_pytorch": "행동 복제(Behavior Cloning) 기초",
  "rl_basics": "강화학습(RL) 기초",
  "sim2real_basics": "Sim2Real (시뮬레이션에서 현실로)",
  "vla_concept": "VLA (Vision-Language-Action) 모델 개념",
  "world_models": "월드 모델(World Models)",
};

const mapFriendlySessions = (sessions: Session[]): Session[] => {
  return sessions.map(s => {
    if (friendlySessionTitles[s.id]) {
      return { ...s, title: `${s.title} 👉 ${friendlySessionTitles[s.id]}` };
    }
    return s;
  });
};

export const v2PartDefinitions: PartDefinition[] = [
  {
    id: "v2-part-1-math-foundations",
    title: "Part 1. 로봇 공부의 첫걸음 (기초 수학과 환경 설정)",
    summary: "로봇을 움직이기 위해 꼭 알아야 할 기초 수학(벡터, 행렬, 미적분, 확률)을 코드와 시각화로 쉽게 배웁니다.",
    sessions: mapFriendlySessions([
      ...structuralMathFoundationSessions,
      ...foundationGapSessions,
      ...crossProductTorqueSessions,
      ...integralEnergySessions,
      ...mathFoundationSessions,
      ...calculusSessions,
      ...odeSessions,
      ...backpropSessions,
      ...signalProcessingSessions,
      ...criticalMathSessions,
      ...convexOptimizationSessions,
      ...finalMathDepthSessions,
      ...aPlusMathSessions,
    ]),
  },
  {
    id: "v2-part-2-robot-math",
    title: "Part 2. 로봇팔의 뼈대와 관절 움직이기 (기구학과 회전)",
    summary: "좌표계, 3D 회전(쿼터니언), FK/IK, 자코비안 등 로봇의 관절을 원하는 대로 움직이는 방법을 익힙니다.",
    sessions: mapFriendlySessions([
      ...structuralRobotMathSessions,
      ...robotMathSessions,
      ...quaternionSessions,
      ...svdJacobianApplicationSessions,
      ...numericalJacobianSessions,
      ...remainingRobotMathSessions,
      ...trajectoryPlanningSessions,
      ...finalRobotMathDepthSessions,
      ...aPlusRobotMathSessions,
    ]),
  },
  {
    id: "v2-part-3-dynamics-control",
    title: "Part 3. 로봇을 부드럽고 정확하게 조종하기 (제어와 동역학)",
    summary: "동역학과 힘, PID 제어부터 상태공간, MPC, 리아푸노프 안정성까지 로봇을 부드럽고 정확하게 제어하는 기술을 배웁니다.",
    sessions: mapFriendlySessions([
      ...stateSpaceSessions,
      ...dynamicsControlSessions,
      ...remainingControlSessions,
      ...lyapunovStabilitySessions,
      ...criticalRobotDynamicsSessions,
      ...mpcSessions,
      ...remainingControlExtSessions,
      ...finalControlDepthSessions,
      ...remainingContactSessions,
      ...aPlusControlSessions,
    ]),
  },
  {
    id: "v2-part-4-autonomous-driving",
    title: "Part 4. 모바일 로봇이 스스로 길을 찾는 법 (자율주행과 SLAM)",
    summary: "칼만 필터, 파티클 필터, 경로 계획(A*), 점유 격자 지도 등 자율주행과 SLAM의 핵심 원리를 구현합니다.",
    sessions: mapFriendlySessions([
      ...autonomousDrivingSessions,
      ...structuralDrivingSessions,
      ...bicycleModelStanleySessions,
      ...kalmanFilterSessions,
      ...occupancyGridCostmapSessions,
      ...pathPlanningSessions,
      ...dwaObstacleSessions,
      ...criticalDrivingSessions,
      ...slamSessions,
      ...sensorFusionSessions,
      ...particleFilterSessions,
      ...imuPreintegrationSessions,
      ...poseGraphSLAMSessions,
      ...finalDrivingDepthSessions,
      ...aPlusDrivingSessions,
    ]),
  },
  {
    id: "v2-part-5-robot-vision",
    title: "Part 5. 로봇에게 세상 보는 눈 달아주기 (컴퓨터 비전)",
    summary: "카메라 모델, 이미지 처리(OpenCV)부터 CNN 기반 객체 인식, 시맨틱 세그멘테이션까지 로봇의 시각 인지를 학습합니다.",
    sessions: mapFriendlySessions([
      ...opencvBasicSessions,
      ...pinholeProjectionSessions,
      ...cnnBasicSessions,
      ...robotVisionSessions,
      ...structuralVisionSessions,
      ...depthEstimationSessions,
      ...semanticSegmentationSessions,
      ...poseEstimationSessions,
      ...criticalVisionDeploymentSessions,
      ...finalVisionDeploymentDepthSessions,
      ...aPlusVisionSessions,
    ]),
  },
  {
    id: "v2-part-6-physical-ai",
    title: "Part 6. 인공지능으로 로봇 학습시키기 (Physical AI)",
    summary: "행동 복제(Behavior Cloning), 강화학습(RL), Sim2Real 등 인공지능을 사용해 로봇이 스스로 동작을 학습하게 만듭니다.",
    sessions: mapFriendlySessions([
      ...pytorchBCSessions,
      ...physicalAISessions,
      ...rlBasicSessions,
      ...remainingPhysicalAISessions,
      ...criticalPhysicalAISessions,
      ...vlaConceptSessions,
      ...worldModelSessions,
      ...robotFoundationModelSessions,
      ...finalPhysicalAIDepthSessions,
      ...aPlusPhysicalAISessions,
    ]),
  },
  {
    id: "v2-part-7-ros2-cpp",
    title: "Part 7. 실전 로봇 소프트웨어 만들기 (ROS 2와 C++)",
    summary: "지금까지 배운 파이썬 코드를 C++로 옮기고, ROS 2 통신 시스템을 활용해 실무 수준의 로봇 소프트웨어를 구축합니다.",
    sessions: mapFriendlySessions([
      ...cppEigenSessions,
      ...criticalRos2Sessions,
      ...aPlusCppRobotSessions,
      ...ros2Sessions,
      ...ros2SubscriberLoopSessions,
      ...structuralRos2Sessions,
      ...ros2ControlPidSessions,
      ...aPlusRos2Sessions,
    ]),
  },
  {
    id: "v2-part-8-safety-integration",
    title: "Part 8. 시스템 안정화 및 미니 프로젝트 통합",
    summary: "시스템의 안전성과 실시간성을 검증하고, 여러 모듈을 합쳐 로봇 자율주행과 로봇팔 조작 미니 프로젝트를 완성합니다.",
    sessions: mapFriendlySessions([
      ...safetySystemSessions,
      ...criticalSafetySessions,
      ...finalSafetyDepthSessions,
      ...integrationProjectSessions,
      ...finalIntegrationDepthSessions,
    ]),
  },
  {
    id: "v2-part-10-prompt-context-harness",
    title: "Part 10. 프롬프트/컨텍스트/하네스 엔지니어링",
    summary: "프롬프트 템플릿, 역할/목표/제약/출력형식, few-shot, JSON/YAML 강제, hallucination guardrail, chunking/retrieval, eval harness, golden output, latency tracing을 기능별 실습으로 학습합니다.",
    sessions: mapFriendlySessions([
      ...promptContextHarnessSessions,
      ...promptHarnessSessions,
    ]),
  },
  {
    id: "v2-part-11-ai-deployment-pipeline",
    title: "Part 11. AI 배포 파이프라인 (ONNX → C++ 추론 → ROS 2 연결)",
    summary: "학습한 PyTorch 모델을 ONNX로 export하고, ONNX Runtime C++ 추론과 ROS 2 image inference node, latency gate까지 연결합니다.",
    sessions: mapFriendlySessions([
      ...aiDeploymentPipelineSessions,
    ]),
  },
  {
    id: "v2-part-9-final-exam",
    title: "Part 12. 최종 평가 및 수료",
    summary: "학습한 모든 이론과 실습 내용(수학, 유도, 구현, 시스템 설계)을 종합적으로 검증하는 평가 세션입니다.",
    sessions: mapFriendlySessions([
      ...finalExamSessions,
    ]),
  },
];

export const v2Sessions: Session[] = v2PartDefinitions.flatMap((part) => part.sessions);
export {
  contentQualityRemediationChecklist,
  finalImprovementRoadmap,
  mathFoundationAuditChecklist,
  physicalAICoreAuditChecklist,
  promptContextHarnessFeatureAudit,
  structuralQualityRemediationChecklist,
  v2VisualizationCatalog,
};

export const v2CurriculumModules: CurriculumModule[] = v2PartDefinitions.map((part) =>
  sessionsToModule(part.id, part.title, part.summary, part.sessions),
);

const legacySectionsById = new Map(
  legacySections.map((section) => [section.id, section] as const)
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
  ],
  "v2-part-7-ros2-cpp": [
    "cpp-python-ros2--cpp-structure",
    "cpp-python-ros2--cmake-package-dependencies",
    "cpp-python-ros2--eigen-opencv-bindings",
    "cpp-python-ros2--ros2-system",
    "cpp-python-ros2--ros2-pubsub-cpp-python",
    "cpp-python-ros2--ros2-parameters-launch",
    "cpp-python-ros2--ros2-qos-executor-callback",
    "cpp-python-ros2--ros2-actions-services",
    "cpp-python-ros2--tf2-frames-time",
    "cpp-python-ros2--experiment-logging",
    "cpp-python-ros2--rosbag-foxglove-plotjuggler",
  ],
  "v2-part-8-safety-integration": [
    "realtime--loop-latency",
    "realtime--executor-qos",
    "safety-control-fusion-eval--safety-monitor",
    "safety-control-fusion-eval--advanced-control",
    "safety-control-fusion-eval--evaluation-regression",
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
  "v2-part-10-prompt-context-harness": [
    "llm-engineering--prompt-design",
    "llm-engineering--tool-calling-contract",
    "llm-engineering--retrieval-context",
    "llm-engineering--chunking-embedding-eval",
    "llm-engineering--eval-harness",
    "llm-engineering--agent-trace-debugging",
  ],
  "v2-part-11-ai-deployment-pipeline": [
    "ai-foundations--onnx-runtime-deploy",
    "ai-foundations--onnx-cpp-buffer-contract",
    "ai-foundations--tensorrt-jetson-latency",
    "ai-foundations--ros-image-inference-node",
  ],
  "v2-part-9-final-exam": [
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
