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
import { convexOptimizationSessions } from "./convexOptimizationSessions";
import { crossProductTorqueSessions } from "./crossProductTorqueSessions";
import { curriculum as legacyCurriculum } from "./curriculum";
import { depthEstimationSessions } from "./depthEstimationSessions";
import { dynamicsControlSessions } from "./dynamicsControlSessions";
import { dwaObstacleSessions } from "./dwaObstacleSessions";
import { finalExamSessions } from "./finalExamQuestions";
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
    sessions: [...aPlusCppRobotSessions, ...cppEigenSessions],
  },
  {
    id: "v2-part-3-dynamics-control",
    title: "Part 3. 로봇 동역학과 제어",
    summary: "Lagrange 동역학, 토크 계산, LQR/Riccati를 실행형 코드랩으로 연결한다.",
    sessions: [
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
    sessions: [...aPlusRos2Sessions, ...ros2ControlPidSessions, ...ros2SubscriberLoopSessions, ...ros2Sessions],
  },
  {
    id: "v2-part-7-physical-ai",
    title: "Part 7. Physical AI / Embodied AI",
    summary: "Behavior Cloning, Sim2Real, domain randomization을 실제 정책 학습 흐름으로 연결한다.",
    sessions: [
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
    sessions: safetySystemSessions,
  },
  {
    id: "v2-part-9-integration-projects",
    title: "Part 9. 통합 미니 프로젝트",
    summary: "Localization, arm control, detection-to-action, BC, Sim2Real 프로젝트를 담을 공간이다.",
    sessions: integrationProjectSessions,
  },
  {
    id: "v2-part-10-final-exam",
    title: "Part 10. 최종 평가",
    summary: "수학 계산, 수식 유도, 코드 구현, 시스템 설계를 종합 평가한다.",
    sessions: finalExamSessions,
  },
];

export const v2Sessions: Session[] = v2PartDefinitions.flatMap((part) => part.sessions);
export { v2VisualizationCatalog };

export const v2CurriculumModules: CurriculumModule[] = v2PartDefinitions.map((part) =>
  sessionsToModule(part.id, part.title, part.summary, part.sessions),
);

export const curriculumV2: CurriculumModule[] = [
  ...v2CurriculumModules.filter((module) => module.sections.length > 0),
  ...legacyCurriculum,
];

export const curriculum = curriculumV2;
