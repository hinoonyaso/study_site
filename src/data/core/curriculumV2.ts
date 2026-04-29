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
import {
  assessmentCoverageChecklist,
  assessmentMathSessions,
  assessmentNav2Sessions,
  assessmentPromptSessions,
  assessmentRobotMathSessions,
} from "../eval_deployment/assessmentReinforcementSessions";
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
  // ─── Part 1: 기초 수학 ──────────────────────────────────────
  "vector_matrix_inverse_cross_product_basics": "벡터·행렬·역행렬 기초",
  "matrix_multiplication_grid_basics":          "행렬 곱셈과 좌표 변환",
  "cross_product_torque":                       "외적과 토크 (τ = r × F)",
  "calculus_derivative_chain_rule":             "미분·편미분·체인룰",
  "partial_derivative_gradient_tangent_plane":  "편미분과 Gradient",
  "calculus_gradient_descent":                  "경사하강법 (Gradient Descent)",
  "gradient_descent_loss_landscape":            "손실 곡면과 학습률",
  "integral_energy_impulse":                    "적분·에너지·임펄스",
  "ode_euler_rk4":                              "ODE 수치 적분: Euler·RK4",
  "finite_difference_ode_solver_basics":        "수치해석 기초 (유한 차분)",
  "signal_processing_fft_lpf":                  "신호처리·샘플링·FFT",
  "gaussian_bayes_update_distribution":         "확률분포와 Bayes 업데이트",
  "gaussian_mle":                               "가우시안 최대우도추정 (MLE)",
  "low_pass_filter_imu":                        "로우패스 필터와 IMU 노이즈",
  "pseudoinverse_rank_deficient_basics":        "Pseudoinverse와 최소제곱 해",
  "least_squares":                              "최소제곱법 (오차 최소화)",
  "eigenvalue_covariance_ellipse":              "고유값과 공분산 타원",
  "svd_condition_number":                       "SVD와 수치 안정성",
  "svd_jacobian_condition_number":              "SVD로 Jacobian 특이점 판별",
  "backprop_chain_rule_numpy":                  "역전파(Backprop)와 체인룰",
  "convex_optimization_kkt":                    "볼록 최적화와 KKT 조건",

  // ─── Part 2: 로봇팔 기구학 ─────────────────────────────────
  "robot_math_2d_rotation_matrix":              "2D 회전행렬 (cos/sin 변환)",
  "robot_math_3d_rotation_so3":                 "3D 회전과 SO(3) 그룹",
  "robot_math_euler_angle_gimbal_lock":         "Euler Angle과 Gimbal Lock",
  "robot_math_homogeneous_transform_se3":       "동차변환 SE(3) (위치+회전)",
  "quaternion_so3_slerp":                       "쿼터니언과 구면 보간 (SLERP)",
  "robot_math_dh_parameter":                   "DH 파라미터 (관절 모델링)",
  "robot_math_product_of_exponentials":         "PoE: 스크류 이론과 FK",
  "robot_math_forward_kinematics":              "정기구학 (FK): 2-link 구현",
  "numerical_jacobian_2link":                   "수치 야코비안: 관절→말단 속도",
  "trajectory_quintic_polynomial":              "궤적 계획: 5차 다항식",

  // ─── Part 3: 제어와 동역학 ─────────────────────────────────
  "state_space_model":                          "상태공간 표현법",
  "pid_control_v2":                             "PID 제어와 Anti-windup",
  "robot_dynamics_2link_lagrange":              "2-link 로봇 동역학 (Lagrange)",
  "lqr_riccati":                                "LQR와 Riccati 방정식",
  "lyapunov_stability_pd":                      "Lyapunov 안정성과 PD 제어",
  "mpc_1d_receding_horizon":                    "모델 예측 제어 (MPC) 기초",

  // ─── Part 4: 자율주행과 SLAM ────────────────────────────────
  "kalman_filter_1d":                           "칼만 필터 (Predict + Update)",
  "differential_drive_odometry":                "Differential Drive Odometry",
  "wheel_encoder_tick_odometry":                "Wheel Encoder Tick Odometry",
  "lidar_scan_preprocessing":                   "LiDAR Scan 전처리 파이프라인",
  "ekf_localization":                           "EKF 위치추정 (Observation Jacobian)",
  "imu_preintegration_basic":                   "IMU 사전적분과 Bias 보정",
  "bicycle_model_kinematics":                   "자전거 모델 (차량 기구학)",
  "stanley_lateral_controller":                 "Stanley 횡방향 제어",
  "occupancy_grid_mapping":                     "점유 격자 지도 생성",
  "costmap_inflation_nav2":                     "Costmap 팽창 레이어 (Nav2)",
  "slam_occupancy_grid":                        "SLAM: Log-Odds 점유 업데이트",
  "dijkstra_grid_planning":                     "Dijkstra 경로계획",
  "path_planning_astar":                        "A* 경로계획 구현",
  "hybrid_astar_state_lattice":                 "Hybrid A* State Lattice",
  "dwa_obstacle_avoidance":                     "DWA 장애물 회피 (속도 공간)",
  "dwb_critic_controller":                      "DWB Critic Controller",
  "mppi_trajectory_planner_overview":           "MPPI: 샘플링 기반 경로계획 개요",
  "slam_toolbox_launch_mapping":                "slam_toolbox Online Mapping 실행",
  "mobile_navigation_integrated_stack":         "자율주행 통합 스택 시뮬레이션",
  "particle_filter_sir":                        "파티클 필터 (SIR / AMCL)",
  "sensor_fusion_gps_imu":                      "센서 융합: GPS + IMU 보정",
  "pose_graph_slam_basics":                     "Graph SLAM과 루프 클로저",

  // ─── Part 5: 컴퓨터 비전 ───────────────────────────────────
  "opencv_threshold_contour_basics":            "OpenCV: Threshold·Contour",
  "pinhole_camera_projection":                  "핀홀 카메라 모델과 투영",
  "depth_estimation_stereo_geometry":           "깊이 추정 (Stereo Disparity)",
  "cnn_conv2d_feature_map":                     "CNN: Conv Layer와 Feature Map",
  "browser_onnx_tiny_cnn_feature_demo":         "브라우저 ONNX식 Tiny CNN 데모",
  "object_detection_iou_nms":                   "Object Detection: IoU와 NMS",
  "object_detection_yolo_ssd_pipeline":         "YOLO/SSD 객체탐지 구조와 학습 파이프라인",
  "visual_tracking_iou_kalman":                 "Visual Tracking: ID 유지와 IoU/Kalman 매칭",
  "semantic_segmentation_basics":               "시맨틱 세그멘테이션과 Mask IoU",
  "pose_estimation_pnp_6d":                     "6D 자세 추정 (PnP / solvePnP)",

  // ─── Part 6: Physical AI ───────────────────────────────────
  "pytorch_bc_mlp":                             "행동 복제: MLP Policy 학습",
  "rl_q_learning_policy_gradient_basics":       "강화학습 기초 (Q-learning / PG)",
  "vla_architecture_concepts":                  "VLA: Vision-Language-Action 개념",
  "world_model_dreamer_overview":               "월드 모델: Latent Dynamics",

  // ─── Part 7: ROS 2 / C++ ───────────────────────────────────
  "cpp_eigen_fk_jacobian":                      "C++ Eigen으로 FK·Jacobian 구현",
  "ros2_tf2_transform":                         "ROS 2 TF2 좌표 변환 브로드캐스터",
  "ros2_subscriber_pub_loop":                   "ROS 2 Subscribe→제어→Publish 루프",
  "ros2_control_pid_hardware_loop":             "ros2_control PID와 Hardware Loop",
  "ros2_pub_sub":                               "ROS 2 Pub/Sub (노드 간 통신)",
  "ros2_parameters_launch":                     "ROS 2 파라미터와 Launch 파일",
  "ros2_qos":                                   "ROS 2 QoS (통신 품질 제어)",

  // ─── 보강: 제어 심화 ────────────────────────────────────────
  "laplace_z_bode_pid_design":                  "Laplace/z-도메인과 Bode 기반 PID 설계",
  "robot_dynamics_newton_euler_recursive":       "Newton-Euler 재귀 동역학과 토크 계산",
  "robot_dynamics_feedforward_gravity_compensation": "피드포워드 제어와 중력 보상",
  "cbf_qp_safety_filter":                       "CBF 안전 필터 (QP 기반)",
  "clf_cbf_qp_priority_resolution":             "CLF-CBF QP 우선순위 해결",
  "lqr_bryson_rule_pole_design":                "Bryson Rule로 LQR Q/R 파라미터 설계",
  "back_calculation_antiwindup_control":        "Back-calculation Anti-windup PID",
  "antiwindup_derivative_kick_pid":             "Anti-windup PID와 Derivative Kick 방지",
  "admittance_vs_impedance_control":            "Admittance vs Impedance 제어 구분",
  "impedance_control_1d_contact":               "Impedance 제어 기초: 1D 접촉 응답",
  "impedance_control_contact_depth":            "Impedance 제어 심화: 강성 설계",
  "mpc_soft_constraint_infeasibility":          "MPC 제약 완화와 Infeasibility 처리",
  "cpp_realtime_control_loop_jitter":           "C++ 1kHz 실시간 제어 루프와 Jitter",
  "preempt_rt_kernel_jitter_comparison":        "PREEMPT_RT 커널 vs 일반 커널 Jitter",
  "laplace_final_value_bode_margin":            "Laplace 초기/최종값 정리와 Bode Margin",
  "butterworth_filter_order_design":            "Butterworth 필터 차수 설계",
  "chebyshev_butterworth_filter_design":        "Butterworth vs Chebyshev 필터 비교",
  "ilqr_trajectory_optimization_receding_horizon": "iLQR 궤적 최적화와 Receding Horizon",
  "jerk_continuous_quintic_trajectory":         "Jerk 연속 5차 다항식 궤적",
  "controllability_gramian_numeric":            "Gramian 기반 가제어성 수치 판정",

  // ─── 보강: 기구학 심화 ──────────────────────────────────────
  "geometric_vs_analytic_jacobian":             "Geometric vs Analytic Jacobian 구분",
  "spatial_rnea_6dof_backward_pass":            "6DOF Spatial RNEA Backward Pass",
  "dh_craig_spong_convention_guard":            "Craig/Spong DH Convention 혼용 방지",
  "ik_solution_selection_joint_limit_continuity": "IK 복수해: 관절 한계와 연속성",
  "rank_nullity_pseudoinverse_ik":              "Rank-nullity와 Pseudoinverse IK",
  "null_space_redundancy_resolution":           "Null Space Motion과 여자유도 해결",
  "cpp_eigen_ik_2link":                         "C++ Eigen 2-link 해석적 IK",
  "fk_matrix_ik_singularity_visual_lab":        "FK 행렬·IK 수렴·Jacobian Singularity",
  "lie_algebra_so3_exp_log":                    "Lie Algebra: SO(3) Exp/Log Map",
  "se3_lie_algebra_expmap_twist":               "se(3) Twist와 Exponential Map",
  "contact_dynamics_friction_cone_grasp":       "접촉 동역학과 Friction Cone Grasp",
  "grasp_pose_sampling_basics":                 "Grasp Pose 후보 생성 (Mask + Depth)",

  // ─── 보강: 자율주행 심화 ────────────────────────────────────
  "ukf_sigma_point_localization":               "UKF Sigma Point 위치추정",
  "ukf_alpha_beta_kappa_tuning":                "UKF 파라미터 (alpha/beta/kappa) 선택",
  "ekf_chi_squared_outlier_rejection":          "EKF Chi-squared 이상치 제거",
  "particle_filter_resampling_comparison":      "Particle Filter Resampling 방법 비교",
  "fisher_information_observability":           "Fisher Information과 관측가능성",
  "imu_camera_tight_coupling_factor":           "IMU-Camera Tight Coupling Factor",
  "orca_velocity_obstacle_avoidance":           "ORCA Velocity Obstacle 회피",
  "isam2_incremental_factor_graph":             "iSAM2 Incremental Factor Graph SLAM",
  "nav2_behavior_tree_action_server":           "Nav2 Behavior Tree와 Action Server",
  "kkt_osqp_active_constraints":               "KKT Multiplier와 OSQP Active Constraint",
  "point_cloud_icp_registration":               "Point Cloud ICP 정합 (SVD 기반)",
  "bicycle_model_stanley_controller":           "Bicycle Model과 Stanley 제어기 통합",
  "stereo_calibration_epipolar_geometry":       "Stereo Calibration: Baseline과 Epipolar",

  // ─── 보강: 비전 심화 ────────────────────────────────────────
  "semantic_segmentation_training_loss":        "Semantic Segmentation 학습: CE + Class Weight",
  "tensorrt_onnx_quantization_pipeline":        "TensorRT/ONNX Quantization과 Edge 추론",
  "tensorrt_real_onnx_inference_calibration":   "TensorRT INT8 Calibration 실습",

  // ─── 보강: Physical AI 심화 ─────────────────────────────────
  "rl_ppo_sac_reward_shaping":                  "PPO/SAC와 Reward Shaping",
  "ppo_gae_sac_entropy_tuning":                 "PPO GAE Lambda와 SAC Entropy Tuning",
  "vlm_architecture_to_vla_bridge":             "VLM에서 VLA로: CLIP/LLaVA 구조",
  "clip_contrastive_temperature_loss":          "CLIP Contrastive Loss와 Temperature",
  "llava_cross_attention_vla_grounding":        "LLaVA Cross-attention과 VLA Grounding",
  "rssm_elbo_kl_world_model":                   "RSSM ELBO Loss와 KL Divergence",
  "pi0_openvla_diffusion_token_policy":         "π0/OpenVLA: Diffusion vs Token Action",
  "domain_randomization_adr_gap_design":        "Domain Randomization과 ADR Gap 설계",
  "dagger_dataset_aggregation_imitation_learning": "DAgger: Distribution Shift 복구",
  "dreamer_rssm_world_model_implementation":    "Dreamer/RSSM Latent Rollout 구현",
  "vlm_vla_lora_finetuning_dataset":            "VLM/VLA LoRA Fine-tuning과 Dataset",
  "attention_mechanism_vla_basics":             "Attention Mechanism: VLA Action Context",
  "robot_foundation_model_deployment":          "Robot Foundation Model 배포 체크리스트",

  // ─── 보강: 수학 심화 ────────────────────────────────────────
  "mle_sensor_calibration_gaussian":            "MLE 센서 Bias/Sigma 캘리브레이션",

  // ─── 보강: ROS 2 / C++ ──────────────────────────────────────
  "ros2_package_build_ament_cmake":             "ROS 2 C++ 패키지 빌드 (CMakeLists)",
  "urdf_joint_parser_basics":                   "URDF 파싱: 관절 트리와 Controller 목록",
  "ros2_cli_command_diagnostics_lab":           "ROS 2 CLI 진단 명령어 실습",
  "camera_to_cmd_vel_inference_pipeline":       "Camera→Inference→cmd_vel End-to-End",

  // ─── 보강: 데이터 준비 / 통합 ───────────────────────────────
  "dataset_label_split_confusion_matrix_practice": "데이터셋 준비: Label·Split·Confusion Matrix",
  "system_parameter_selection_report":          "시스템 설계와 파라미터 선택 보고서",
  "prompt_context_eval_harness_engineering":    "프롬프트·컨텍스트·Eval Harness 엔지니어링",
  "stage-1-math-sensor-gates":                  "1단계 보강: 기초수학 점검",
  "stage-2-robot-math-6dof":                    "2단계 보강: 로봇수학 6DOF",
  "stage-3-control-contact-safety":             "3단계 보강: 제어·동역학·안전",
  "stage-4-perception-fusion-vlm":              "4단계 보강: 인식·센서융합·VLM",
  "stage-5-driving-arm-planning":               "5단계 보강: 자율주행·로봇팔·경로계획",
  "stage-6-physical-ai-world-models":           "6단계 보강: Physical AI·World Model",
};

const mapFriendlySessions = (sessions: Session[]): Session[] => {
  return sessions.map(s => {
    if (friendlySessionTitles[s.id]) {
      return { ...s, title: friendlySessionTitles[s.id] };
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
      // 1단계: 공간과 변환 기초
      ...structuralMathFoundationSessions,  // 벡터·행렬·역행렬
      ...foundationGapSessions,             // 행렬 곱셈, 편미분, Gradient, Gaussian
      ...crossProductTorqueSessions,        // 외적
      // 2단계: 미적분
      ...calculusSessions,                  // 미분, 경사하강법
      ...assessmentMathSessions,            // 편미분 평가 보강
      ...integralEnergySessions,            // 적분
      ...odeSessions,                       // ODE
      // 3단계: 신호와 확률
      ...signalProcessingSessions,          // FFT
      ...mathFoundationSessions,            // 고유값, SVD, 최소제곱, MLE, LPF
      // 4단계: 선형대수 심화
      ...svdJacobianApplicationSessions,    // SVD → Jacobian 특이점
      ...numericalJacobianSessions,         // 수치 야코비안
      // 5단계: 학습과 최적화
      ...backpropSessions,                  // 역전파
      ...convexOptimizationSessions,        // 볼록 최적화
      // 보강 세션
      ...criticalMathSessions,
      ...finalMathDepthSessions,
      ...aPlusMathSessions,
    ]),
  },
  {
    id: "v2-part-2-robot-math",
    title: "Part 2. 로봇팔의 뼈대와 관절 움직이기 (기구학과 회전)",
    summary: "좌표계, 3D 회전(쿼터니언), FK/IK, 자코비안 등 로봇의 관절을 원하는 대로 움직이는 방법을 익힙니다.",
    sessions: mapFriendlySessions([
      // 1단계: 회전 표현
      ...structuralRobotMathSessions,       // 2D/3D 회전행렬, 동차변환
      ...robotMathSessions,                 // DH 파라미터, PoE, FK
      ...assessmentRobotMathSessions,       // IK 평가 보강
      ...quaternionSessions,                // 쿼터니언, SLERP
      // 2단계: Jacobian과 특이점
      ...svdJacobianApplicationSessions,    // SVD → 특이점 판별 (Part 1과 공유)
      ...numericalJacobianSessions,         // 수치 야코비안
      // 3단계: 궤적 계획
      ...trajectoryPlanningSessions,        // 5차 다항식 궤적
      // 보강 세션
      ...remainingRobotMathSessions,
      ...finalRobotMathDepthSessions,
      ...aPlusRobotMathSessions,
    ]),
  },
  {
    id: "v2-part-3-dynamics-control",
    title: "Part 3. 로봇을 부드럽고 정확하게 조종하기 (제어와 동역학)",
    summary: "동역학과 힘, PID 제어부터 상태공간, MPC, 리아푸노프 안정성까지 로봇을 부드럽고 정확하게 제어하는 기술을 배웁니다.",
    sessions: mapFriendlySessions([
      // 1단계: 상태공간과 기본 제어
      ...stateSpaceSessions,                // 상태공간 표현법
      ...dynamicsControlSessions,           // PID, 2-link 동역학, LQR
      // 2단계: 안정성 이론
      ...lyapunovStabilitySessions,         // Lyapunov 안정성
      // 3단계: 최적·예측 제어
      ...mpcSessions,                       // MPC
      // 보강 세션
      ...remainingControlSessions,
      ...criticalRobotDynamicsSessions,
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
      // 1단계: 위치 추정 (필터)
      ...kalmanFilterSessions,              // 칼만 필터 1D
      ...autonomousDrivingSessions,         // EKF 위치추정
      ...imuPreintegrationSessions,         // IMU 사전적분
      // 2단계: 차량 모델과 경로 추종
      ...bicycleModelStanleySessions,       // 자전거 모델, Stanley, MPPI
      // 3단계: 지도와 경로계획
      ...occupancyGridCostmapSessions,      // 점유 격자, Costmap
      ...pathPlanningSessions,              // A*
      ...assessmentNav2Sessions,            // Nav2 launch/stack 평가 보강
      ...dwaObstacleSessions,               // DWA 장애물 회피
      // 4단계: SLAM과 고급 필터
      ...slamSessions,                      // SLAM Log-Odds
      ...particleFilterSessions,            // 파티클 필터
      ...sensorFusionSessions,              // 센서 융합
      ...poseGraphSLAMSessions,             // Graph SLAM
      // 보강 세션
      ...structuralDrivingSessions,
      ...criticalDrivingSessions,
      ...finalDrivingDepthSessions,
      ...aPlusDrivingSessions,
    ]),
  },
  {
    id: "v2-part-5-robot-vision",
    title: "Part 5. 로봇에게 세상 보는 눈 달아주기 (컴퓨터 비전)",
    summary: "카메라 모델, 이미지 처리(OpenCV)부터 CNN 기반 객체 인식, 시맨틱 세그멘테이션까지 로봇의 시각 인지를 학습합니다.",
    sessions: mapFriendlySessions([
      // 1단계: 이미지 처리 기초
      ...opencvBasicSessions,               // OpenCV Threshold·Contour
      ...pinholeProjectionSessions,         // 핀홀 카메라 모델
      ...depthEstimationSessions,           // 깊이 추정
      // 2단계: 딥러닝 기반 인식
      ...cnnBasicSessions,                  // CNN Feature Map
      ...robotVisionSessions,               // 로봇 비전 통합
      ...semanticSegmentationSessions,      // 세그멘테이션
      // 3단계: 자세 추정
      ...poseEstimationSessions,            // 6D Pose (PnP)
      // 보강 세션
      ...structuralVisionSessions,
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
      // 1단계: 지도 학습 기반 로봇 제어
      ...pytorchBCSessions,                 // 행동 복제 (MLP Policy)
      ...physicalAISessions,               // Physical AI 개요
      // 2단계: 강화학습
      ...rlBasicSessions,                  // Q-learning, Policy Gradient
      // 3단계: 고급 아키텍처
      ...vlaConceptSessions,               // VLA (Vision-Language-Action)
      ...worldModelSessions,               // 월드 모델
      ...robotFoundationModelSessions,     // Foundation Model
      // 보강 세션
      ...remainingPhysicalAISessions,
      ...criticalPhysicalAISessions,
      ...finalPhysicalAIDepthSessions,
      ...aPlusPhysicalAISessions,
    ]),
  },
  {
    id: "v2-part-7-ros2-cpp",
    title: "Part 7. 실전 로봇 소프트웨어 만들기 (ROS 2와 C++)",
    summary: "지금까지 배운 파이썬 코드를 C++로 옮기고, ROS 2 통신 시스템을 활용해 실무 수준의 로봇 소프트웨어를 구축합니다.",
    sessions: mapFriendlySessions([
      // 1단계: C++ 선형대수 (Eigen)
      ...cppEigenSessions,                  // Eigen FK·Jacobian
      // 2단계: ROS 2 통신 기초
      ...criticalRos2Sessions,              // ROS 2 핵심 개념
      ...ros2Sessions,                      // TF2 변환
      ...ros2SubscriberLoopSessions,        // Subscribe→제어→Publish 루프
      // 3단계: ROS 2 제어 시스템
      ...structuralRos2Sessions,            // 파라미터, QoS, Actions
      ...ros2ControlPidSessions,            // ros2_control PID
      // 보강 세션
      ...aPlusCppRobotSessions,
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
      ...assessmentPromptSessions,
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
  assessmentCoverageChecklist,
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
