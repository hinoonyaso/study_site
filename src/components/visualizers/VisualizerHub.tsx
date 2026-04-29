import { Suspense } from "react";
import { Activity, Crosshair, FileCode2, Gauge, Grid3X3, LineChart, Pause, Play, RotateCcw, Route, Sigma, SkipForward, Workflow } from "lucide-react";
import type { LessonSection, VisualizerId } from "../../types";
import { VisualizationSpecCards } from "./VisualizationSpecCards";

import { AStarVisualizer } from "./AStarVisualizer";
import { AiMetricsVisualizer } from "./AiMetricsVisualizer";
import { AugmentationLabVisualizer } from "./AugmentationLabVisualizer";
import { BackpropChainVisualizer } from "./BackpropChainVisualizer";
import { BicycleStanleyVisualizer } from "./BicycleStanleyVisualizer";
import { CNNFeatureMapVisualizer } from "./CNNFeatureMapVisualizer";
import { CameraProjectionVisualizer } from "./CameraProjectionVisualizer";
import { ChainRuleGraphVisualizer } from "./ChainRuleGraphVisualizer";
import { CoordinateFrame3DVisualizer } from "./CoordinateFrame3DVisualizer";
import { CrossProduct3DVisualizer } from "./CrossProduct3DVisualizer";
import { DHTableBuilderVisualizer } from "./DHTableBuilderVisualizer";
import { DWAVisualizer } from "./DWAVisualizer";
import { DatasetQualityVisualizer } from "./DatasetQualityVisualizer";
import { DepthMapVisualizer } from "./DepthMapVisualizer";
import { DotProductVisualizer } from "./DotProductVisualizer";
import { DynamicsTorqueVisualizer } from "./DynamicsTorqueVisualizer";
import { EKFCovarianceVisualizer } from "./EKFCovarianceVisualizer";
import { EigenCovarianceVisualizer } from "./EigenCovarianceVisualizer";
import { EmptyVisualizer } from "./EmptyVisualizer";
import { FFTSpectrumVisualizer } from "./FFTSpectrumVisualizer";
import { FoundationModelVisualizer } from "./FoundationModelVisualizer";
import { GaussianBayesVisualizer } from "./GaussianBayesVisualizer";
import { HomogeneousTransform4x4Visualizer } from "./HomogeneousTransform4x4Visualizer";
import { ImpedanceAdmittanceVisualizer } from "./ImpedanceAdmittanceVisualizer";
import { InverseStepsVisualizer } from "./InverseStepsVisualizer";
import { JacobianCompareVisualizer } from "./JacobianCompareVisualizer";
import { KalmanStagesVisualizer } from "./KalmanStagesVisualizer";
import { KalmanVisualizer } from "./KalmanVisualizer";
import { LatencyVisualizer } from "./LatencyVisualizer";
import { LinearAlgebraVisualizer } from "./LinearAlgebraVisualizer";
import { LocalizationFilterStackVisualizer } from "./LocalizationFilterStackVisualizer";
import { LossLandscapeVisualizer } from "./LossLandscapeVisualizer";
import { LyapunovEnergyVisualizer } from "./LyapunovEnergyVisualizer";
import { MPCHorizonVisualizer } from "./MPCHorizonVisualizer";
import { ManipulatorVisualizer } from "./ManipulatorVisualizer";
import { MappingCostmapStackVisualizer } from "./MappingCostmapStackVisualizer";
import { Matrix3DTransformVisualizer } from "./Matrix3DTransformVisualizer";
import { MatrixGridVisualizer } from "./MatrixGridVisualizer";
import { MobileOdomVisualizer } from "./MobileOdomVisualizer";
import { MobileNavigationStackVisualizer } from "./MobileNavigationStackVisualizer";
import { MobileSensorStackVisualizer } from "./MobileSensorStackVisualizer";
import { MoveItPlanPreviewVisualizer } from "./MoveItPlanPreviewVisualizer";
import { NMSIoUVisualizer } from "./NMSIoUVisualizer";
import { Nav2WorkflowStackVisualizer } from "./Nav2WorkflowStackVisualizer";
import { OdeFiniteDiffVisualizer } from "./OdeFiniteDiffVisualizer";
import { OpenCVThresholdVisualizer } from "./OpenCVThresholdVisualizer";
import { PIDStepResponseVisualizer } from "./PIDStepResponseVisualizer";
import { ParticleFilterVisualizer } from "./ParticleFilterVisualizer";
import { PhysicalAIFlowVisualizer } from "./PhysicalAIFlowVisualizer";
import { PlanningControlStackVisualizer } from "./PlanningControlStackVisualizer";
import { PoseEstimationVisualizer } from "./PoseEstimationVisualizer";
import { PoseGraphVisualizer } from "./PoseGraphVisualizer";
import { PseudoinverseMapVisualizer } from "./PseudoinverseMapVisualizer";
import { PurePursuitVisualizer } from "./PurePursuitVisualizer";
import { QuaternionSlerpVisualizer } from "./QuaternionSlerpVisualizer";
import { RLRewardVisualizer } from "./RLRewardVisualizer";
import { ROS2LoopVisualizer } from "./ROS2LoopVisualizer";
import { RetrievalFlowVisualizer } from "./RetrievalFlowVisualizer";
import { Ros2ControlYamlVisualizer } from "./Ros2ControlYamlVisualizer";
import { SO3RotationVisualizer } from "./SO3RotationVisualizer";
import { SVDJacobianVisualizer } from "./SVDJacobianVisualizer";
import { SVDTransformVisualizer } from "./SVDTransformVisualizer";
import { SegmentationMaskVisualizer } from "./SegmentationMaskVisualizer";
import { SensorFusionVisualizer } from "./SensorFusionVisualizer";
import { Sim2RealGapVisualizer } from "./Sim2RealGapVisualizer";
import { StatisticsVisualizer } from "./StatisticsVisualizer";
import { SweepVisualizer } from "./SweepVisualizer";
import { ThreeRobotArmVisualizer } from "./ThreeRobotArmVisualizer";
import { TrainingCurveVisualizer } from "./TrainingCurveVisualizer";
import { TrajectoryProfileVisualizer } from "./TrajectoryProfileVisualizer";
import { URDFXacroBuilderVisualizer } from "./URDFXacroBuilderVisualizer";
import { VLAArchitectureVisualizer } from "./VLAArchitectureVisualizer";
import { WorldModelVisualizer } from "./WorldModelVisualizer";


type VisualizerHubProps = {
  id?: VisualizerId;
  section?: LessonSection;
};

export function VisualizerHub({ id, section }: VisualizerHubProps) {
  if (!id) return null;

  const visualizers: Record<string, React.ReactNode> = {
    "linear-algebra": <LinearAlgebraVisualizer />,
    "matrix-multiplication": (
      <div className="visual-stack">
        <MatrixGridVisualizer />
        <LinearAlgebraVisualizer />
      </div>
    ),
    "matrix-3d": (
      <div className="visual-stack">
        <Matrix3DTransformVisualizer />
        <InverseStepsVisualizer />
      </div>
    ),
    "matrix-composition-3d": (
      <div className="visual-stack">
        <MatrixGridVisualizer />
        <Matrix3DTransformVisualizer />
      </div>
    ),
    "dot-product": <DotProductVisualizer />,
    "coordinate-frame-3d": <CoordinateFrame3DVisualizer />,
    "homogeneous-4x4": (
      <div className="visual-stack">
        <CoordinateFrame3DVisualizer />
        <HomogeneousTransform4x4Visualizer />
      </div>
    ),
    "inverse-steps": <InverseStepsVisualizer />,
    "eigen-covariance": <EigenCovarianceVisualizer />,
    "svd-transform": <SVDTransformVisualizer />,
    "pseudoinverse-map": <PseudoinverseMapVisualizer />,
    "statistics": <StatisticsVisualizer />,
    "chain-rule-graph": (
      <div className="visual-stack">
        <OdeFiniteDiffVisualizer />
        <ChainRuleGraphVisualizer />
      </div>
    ),
    "jacobian-compare": (
      <div className="visual-stack">
        <JacobianCompareVisualizer />
        <ManipulatorVisualizer />
      </div>
    ),
    "kalman-stages": (
      <div className="visual-stack">
        <KalmanStagesVisualizer />
        <KalmanVisualizer />
      </div>
    ),
    "dh-table-builder": (
      <div className="visual-stack">
        <DHTableBuilderVisualizer />
        <ManipulatorVisualizer />
      </div>
    ),
    "urdf-xacro-builder": <URDFXacroBuilderVisualizer />,
    "impedance-admittance": <ImpedanceAdmittanceVisualizer />,
    "ros2-control-yaml": <Ros2ControlYamlVisualizer />,
    "moveit-plan-preview": (
      <div className="visual-stack">
        <MoveItPlanPreviewVisualizer />
        <TrajectoryProfileVisualizer />
      </div>
    ),
    "mobile-sensor-stack": <MobileSensorStackVisualizer />,
    "localization-filter-stack": (
      <div className="visual-stack">
        <LocalizationFilterStackVisualizer />
        <KalmanStagesVisualizer />
      </div>
    ),
    "mapping-costmap-stack": (
      <div className="visual-stack">
        <MappingCostmapStackVisualizer />
        <PoseGraphVisualizer />
      </div>
    ),
    "planning-control-stack": (
      <div className="visual-stack">
        <PlanningControlStackVisualizer />
        <AStarVisualizer />
      </div>
    ),
    "nav2-workflow-stack": (
      <div className="visual-stack">
        <Nav2WorkflowStackVisualizer />
        <SensorFusionVisualizer />
        <ROS2LoopVisualizer />
      </div>
    ),
    "mobile-navigation-stack": (
      <div className="visual-stack">
        <MobileNavigationStackVisualizer />
        <Nav2WorkflowStackVisualizer />
      </div>
    ),
    "ai-training-curve": (
      <div className="visual-stack">
        <TrainingCurveVisualizer />
        <CNNFeatureMapVisualizer />
      </div>
    ),
    "dataset-quality-stack": (
      <div className="visual-stack">
        <DatasetQualityVisualizer />
        <AiMetricsVisualizer />
      </div>
    ),
    "augmentation-lab": (
      <div className="visual-stack">
        <AugmentationLabVisualizer />
        <OpenCVThresholdVisualizer />
      </div>
    ),
    "nms-iou-lab": (
      <div className="visual-stack">
        <NMSIoUVisualizer />
        <AiMetricsVisualizer />
      </div>
    ),
    "matrix-grid": <MatrixGridVisualizer />,
    "jacobian-singularity": <ManipulatorVisualizer />,
    "mobile-odom": (
      <div className="visual-stack">
        <MobileOdomVisualizer />
        <KalmanVisualizer />
      </div>
    ),
    astar: <AStarVisualizer />,
    "pure-pursuit": <PurePursuitVisualizer />,
    "bicycle-stanley": <BicycleStanleyVisualizer />,
    "ai-metrics": <AiMetricsVisualizer />,
    latency: <LatencyVisualizer />,
    sweep: <SweepVisualizer />,
    "retrieval-flow": <RetrievalFlowVisualizer />,
    "physical-ai-flow": <PhysicalAIFlowVisualizer />,
    "dynamics-torque": <DynamicsTorqueVisualizer />,
    "ekf-covariance": <EKFCovarianceVisualizer />,
    "sim2real-gap": <Sim2RealGapVisualizer />,
    "so3-rotation": <SO3RotationVisualizer />,
    "quaternion-slerp": <QuaternionSlerpVisualizer />,
    "pid-step-response": <PIDStepResponseVisualizer />,
    "particle-filter": <ParticleFilterVisualizer />,
    "mpc-horizon": <MPCHorizonVisualizer />,
    "trajectory-profile": <TrajectoryProfileVisualizer />,
    "cnn-feature-map": <CNNFeatureMapVisualizer />,
    "rl-reward": <RLRewardVisualizer />,
    "fft-spectrum": <FFTSpectrumVisualizer />,
    "pose-graph": <PoseGraphVisualizer />,
    "dwa-velocity": <DWAVisualizer />,
    "camera-projection": <CameraProjectionVisualizer />,
    "segmentation-mask": <SegmentationMaskVisualizer />,
    "vla-architecture": <VLAArchitectureVisualizer />,
    "world-model": <WorldModelVisualizer />,
    "lyapunov-energy": <LyapunovEnergyVisualizer />,
    "sensor-fusion": <SensorFusionVisualizer />,
    "ros2-loop": <ROS2LoopVisualizer />,
    "robot-arm-3d": <ThreeRobotArmVisualizer />,
    "opencv-threshold": <OpenCVThresholdVisualizer />,
    "pose-estimation": <PoseEstimationVisualizer />,
    "depth-map": <DepthMapVisualizer />,
    "backprop-chain": <BackpropChainVisualizer />,
    "svd-jacobian": <SVDJacobianVisualizer />,
    "foundation-model": <FoundationModelVisualizer />,
    "cross-product-3d": <CrossProduct3DVisualizer />,
    "loss-landscape": <LossLandscapeVisualizer />,
    "bayes-gaussian": <GaussianBayesVisualizer />,
    "ode-finite-diff": <OdeFiniteDiffVisualizer />,
    "prompt-eval-harness": <RetrievalFlowVisualizer />,
  };

  const visualizer = visualizers[id];
  if (section?.v2Session) {
    return (
      <div className="visual-stack">
        {visualizer}
        <VisualizationSpecCards section={section} />
      </div>
    );
  }
  return visualizer || <div style={{ padding: "20px", color: "var(--muted)" }}>시각화 ID {id}를 찾을 수 없습니다.</div>;
}
