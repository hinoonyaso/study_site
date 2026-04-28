import type { VisualizationSpec } from "../../types";

type VisualizationParameter = VisualizationSpec["parameters"][number];

const parameter = (
  name: string,
  symbol: string,
  min: number,
  max: number,
  defaultValue: number,
  description: string,
): VisualizationParameter => ({ name, symbol, min, max, default: defaultValue, description });

const secondaryParameterFor = (title: string, conceptTag: string, parameterName: string): VisualizationParameter => {
  if (conceptTag === "vector_matrix_inverse_cross_product_basics") {
    return parameter("shear_xy", "k", -1.5, 1.5, 0.4, `${title}에서 행렬 shear가 격자와 inverse 안정성에 주는 영향을 조절한다.`);
  }
  if (conceptTag === "matrix_multiplication_grid_basics") {
    return parameter("shear_xy", "k", -1.5, 1.5, 0.4, `${title}에서 A 행렬의 shear가 B basis를 다시 변환하는 과정을 조절한다.`);
  }
  if (conceptTag === "pseudoinverse_rank_deficient_basics") {
    return parameter("rcond", "\\epsilon", 0.0001, 0.2, 0.02, `${title}에서 작은 singular value를 버리는 threshold를 조절한다.`);
  }
  if (conceptTag === "partial_derivative_gradient_tangent_plane") {
    return parameter("y_position", "y", -3, 3, 1, `${title}에서 y축 편미분과 접평면 기울기를 조절한다.`);
  }
  if (conceptTag === "gradient_descent_loss_landscape") {
    return parameter("initial_x", "x_0", -3, 3, -1, `${title}에서 gradient descent 시작 x 위치를 조절한다.`);
  }
  if (conceptTag === "gaussian_bayes_update_distribution") {
    return parameter("measurement_sigma", "\\sigma_z", 0.2, 5, 1, `${title}에서 measurement likelihood 폭을 조절한다.`);
  }
  if (conceptTag === "finite_difference_ode_solver_basics") {
    return parameter("difference_h", "h", 0.000001, 0.1, 0.001, `${title}에서 finite difference step을 조절한다.`);
  }
  if (conceptTag === "fk_matrix_ik_singularity_visual_lab") {
    return parameter("q1", "q_1", -180, 180, 35, `${title}에서 첫 번째 관절각과 FK 누적 transform을 조절한다.`);
  }
  if (conceptTag === "bicycle_model_stanley_controller") {
    return parameter("heading_error", "\\psi_e", -30, 30, 5, `${title}에서 경로 tangent와 차량 heading 차이를 조절한다.`);
  }
  if (conceptTag === "dataset_label_split_confusion_matrix_practice") {
    return parameter("test_scene_overlap", "L", 0, 0.5, 0, `${title}에서 train/test scene leakage를 조절한다.`);
  }
  if (conceptTag === "ros2_cli_command_diagnostics_lab") {
    return parameter("qos_depth", "d", 1, 20, 10, `${title}에서 QoS queue depth와 topic 누락 가능성을 조절한다.`);
  }
  if (conceptTag === "prompt_context_eval_harness_engineering") {
    return parameter("schema_strictness", "s", 0.1, 1, 0.8, `${title}에서 JSON schema validation 엄격도를 조절한다.`);
  }
  if (conceptTag === "pytorch_bc_onnx_export_contract") {
    return parameter("batch_size", "B", 1, 128, 16, `${title}에서 ONNX parity 검증 batch 크기를 조절한다.`);
  }
  if (conceptTag === "onnxruntime_cpp_policy_inference") {
    return parameter("batch_size", "B", 1, 64, 1, `${title}에서 C++ input tensor batch 크기와 buffer 길이를 조절한다.`);
  }
  if (conceptTag === "ros2_image_inference_latency_node") {
    return parameter("pipeline_latency_ms", "T_{pipe}", 0, 80, 16, `${title}에서 decode/preprocess/inference/postprocess latency를 조절한다.`);
  }
  if (conceptTag === "dh_craig_spong_convention_guard") {
    return parameter("link_length_a", "a", 0, 2, 0.4, `${title}에서 link length가 convention 차이에 주는 영향을 조절한다.`);
  }
  if (conceptTag === "ik_solution_selection_joint_limit_continuity") {
    return parameter("joint_limit_margin", "m_q", 0.01, 1, 0.3, `${title}에서 joint limit 여유를 조절한다.`);
  }
  if (conceptTag === "rank_nullity_pseudoinverse_ik") {
    return parameter("joint_dimension", "n", 1, 7, 3, `${title}에서 rank-nullity theorem의 joint dimension을 조절한다.`);
  }
  if (conceptTag === "se3_lie_algebra_expmap_twist") {
    return parameter("translation_step", "\\|v\\|", 0, 1, 0.1, `${title}에서 twist의 translation 성분을 조절한다.`);
  }
  if (conceptTag === "kkt_osqp_active_constraints") {
    return parameter("target_value", "u_0", -2, 5, 2, `${title}에서 unconstrained optimum이 constraint를 넘는 정도를 조절한다.`);
  }
  if (conceptTag === "chebyshev_butterworth_filter_design") {
    return parameter("stopband_attenuation_db", "A_s", 10, 80, 30, `${title}에서 stopband attenuation 요구치를 조절한다.`);
  }
  if (conceptTag === "butterworth_filter_order_design") {
    return parameter("cutoff_hz", "f_c", 1, 200, 60, `${title}에서 cutoff frequency를 조절한다.`);
  }
  if (conceptTag === "laplace_final_value_bode_margin") {
    return parameter("loop_gain", "K", 0.1, 100, 5, `${title}에서 loop gain과 0dB crossover를 조절한다.`);
  }
  if (conceptTag === "feedforward_model_error_robustness") {
    return parameter("feedforward_gain", "k_{ff}", 0, 1.5, 1, `${title}에서 feedforward scaling을 조절한다.`);
  }
  if (conceptTag === "controllability_gramian_numeric") {
    return parameter("input_gain", "\\|B\\|", 0, 5, 1, `${title}에서 input matrix gain을 조절한다.`);
  }
  if (conceptTag === "preempt_rt_kernel_jitter_comparison") {
    return parameter("p999_jitter_us", "P_{99.9}", 1, 1000, 80, `${title}에서 tail latency percentile을 조절한다.`);
  }
  if (conceptTag === "particle_filter_resampling_comparison") {
    return parameter("resampling_method", "m", 0, 2, 1, `${title}에서 multinomial/systematic/stratified 방법을 조절한다.`);
  }
  if (conceptTag === "imu_camera_tight_coupling_factor") {
    return parameter("imu_noise_sigma", "\\sigma_i", 0.001, 1, 0.1, `${title}에서 IMU residual noise scale을 조절한다.`);
  }
  if (conceptTag === "ppo_gae_sac_entropy_tuning") {
    return parameter("entropy_alpha", "\\alpha", 0, 2, 0.2, `${title}에서 SAC entropy temperature를 조절한다.`);
  }
  if (conceptTag === "laplace_z_bode_pid_design") {
    return parameter("damping_ratio", "\\zeta", 0.05, 2, 0.7, `${title}에서 pole damping ratio와 overshoot 변화를 조절한다.`);
  }
  if (conceptTag.includes("kalman") || conceptTag.includes("ekf") || conceptTag.includes("ukf")) {
    return parameter("measurement_noise_R", "R", 0.001, 5, 0.5, `${title}에서 관측 covariance가 update 신뢰도를 어떻게 바꾸는지 조절한다.`);
  }
  if (conceptTag.includes("pid") || conceptTag.includes("control") || conceptTag.includes("lqr") || conceptTag.includes("mpc")) {
    return parameter("actuator_limit", "u_{max}", 0.1, 10, 1, `${title}에서 제어 명령이 실제 actuator limit에 걸리는 지점을 조절한다.`);
  }
  if (conceptTag.includes("trajectory") || conceptTag.includes("planning") || conceptTag.includes("astar") || conceptTag.includes("rrt")) {
    return parameter("obstacle_clearance", "d_{obs}", 0, 5, 1, `${title}에서 후보 경로와 장애물 사이의 최소 여유 거리를 조절한다.`);
  }
  if (conceptTag.includes("rl") || conceptTag.includes("dreamer") || conceptTag.includes("dagger") || conceptTag.includes("vlm")) {
    return parameter("batch_or_horizon", "B/H", 1, 128, 16, `${title}에서 학습 batch 또는 rollout horizon이 안정성에 미치는 영향을 조절한다.`);
  }
  if (conceptTag.includes("dynamics") || conceptTag.includes("torque") || conceptTag.includes("jacobian")) {
    return parameter("payload_or_velocity", "m_p/\\dot q", 0, 10, 1, `${title}에서 payload 또는 joint velocity가 동역학/기구학 항에 주는 영향을 조절한다.`);
  }
  if (conceptTag.includes("vision") || conceptTag.includes("detection") || conceptTag.includes("tensorrt")) {
    return parameter("confidence_threshold", "\\tau", 0, 1, 0.5, `${title}에서 detection/inference gate가 false positive와 miss를 어떻게 바꾸는지 조절한다.`);
  }
  return parameter(
    `${parameterName}_operating_range`,
    "\\Delta",
    0,
    10,
    1,
    `${title}에서 ${parameterName}을 실제 운용 범위 안에서 sweep하는 폭을 조절한다.`,
  );
};

const tertiaryParameterFor = (title: string, conceptTag: string, parameterName: string): VisualizationParameter => {
  if (conceptTag === "vector_matrix_inverse_cross_product_basics") {
    return parameter("force_angle", "\\theta_F", -180, 180, 90, `${title}에서 외적 torque 방향을 만드는 힘 벡터 각도를 조절한다.`);
  }
  if (conceptTag === "matrix_multiplication_grid_basics") {
    return parameter("basis_rotation", "\\theta_B", -90, 90, 25, `${title}에서 먼저 적용되는 B basis 회전을 조절한다.`);
  }
  if (conceptTag === "pseudoinverse_rank_deficient_basics") {
    return parameter("null_vector_gain", "z", -3, 3, 0, `${title}에서 같은 Ax를 유지하는 null-space 이동을 조절한다.`);
  }
  if (conceptTag === "partial_derivative_gradient_tangent_plane") {
    return parameter("step_size", "h", 0.001, 0.5, 0.05, `${title}에서 finite-difference gradient 근사 간격을 조절한다.`);
  }
  if (conceptTag === "gradient_descent_loss_landscape") {
    return parameter("initial_y", "y_0", -3, 3, 1, `${title}에서 gradient descent 시작 y 위치를 조절한다.`);
  }
  if (conceptTag === "gaussian_bayes_update_distribution") {
    return parameter("measurement_z", "z", -5, 5, 3, `${title}에서 새 센서 측정값 위치를 조절한다.`);
  }
  if (conceptTag === "finite_difference_ode_solver_basics") {
    return parameter("decay_rate", "\\lambda", 0.1, 5, 1, `${title}에서 ODE decay rate와 Euler 안정성을 조절한다.`);
  }
  if (conceptTag === "fk_matrix_ik_singularity_visual_lab") {
    return parameter("ik_damping", "\\lambda", 0.01, 0.3, 0.08, `${title}에서 DLS IK damping과 singularity 근처 step 크기를 조절한다.`);
  }
  if (conceptTag === "bicycle_model_stanley_controller") {
    return parameter("vehicle_speed", "v", 0.5, 15, 5, `${title}에서 Stanley cross-track 보정각의 velocity scaling을 조절한다.`);
  }
  if (conceptTag === "dataset_label_split_confusion_matrix_practice") {
    return parameter("minority_class_ratio", "r_{min}", 0.02, 0.5, 0.12, `${title}에서 class imbalance와 safety recall 변화를 조절한다.`);
  }
  if (conceptTag === "ros2_cli_command_diagnostics_lab") {
    return parameter("action_timeout_s", "T_a", 0.5, 20, 5, `${title}에서 action feedback timeout과 cancel/recovery 민감도를 조절한다.`);
  }
  if (conceptTag === "prompt_context_eval_harness_engineering") {
    return parameter("golden_case_count", "M", 5, 100, 30, `${title}에서 regression eval case 수와 pass-rate 신뢰도를 조절한다.`);
  }
  if (conceptTag === "pytorch_bc_onnx_export_contract") {
    return parameter("opset_version", "opset", 11, 20, 17, `${title}에서 ONNX opset과 Runtime 호환성 경계를 조절한다.`);
  }
  if (conceptTag === "onnxruntime_cpp_policy_inference") {
    return parameter("deadline_ms", "T_d", 1, 100, 20, `${title}에서 C++ inference publish deadline을 조절한다.`);
  }
  if (conceptTag === "ros2_image_inference_latency_node") {
    return parameter("confidence_threshold", "\\tau", 0, 1, 0.7, `${title}에서 low-confidence result publish gate를 조절한다.`);
  }
  if (conceptTag === "dh_craig_spong_convention_guard") {
    return parameter("link_twist_alpha", "\\alpha", -3.14, 3.14, -0.5, `${title}에서 link twist가 standard/modified 차이를 키우는 정도를 조절한다.`);
  }
  if (conceptTag === "ik_solution_selection_joint_limit_continuity") {
    return parameter("elbow_flip_threshold", "\\Delta q_{max}", 0.1, 6.28, 1, `${title}에서 허용 joint jump threshold를 조절한다.`);
  }
  if (conceptTag === "rank_nullity_pseudoinverse_ik") {
    return parameter("secondary_gain", "k_0", 0, 2, 0.5, `${title}에서 null-space secondary objective gain을 조절한다.`);
  }
  if (conceptTag === "se3_lie_algebra_expmap_twist") {
    return parameter("integration_dt", "\\Delta t", 0.001, 1, 0.1, `${title}에서 twist integration step을 조절한다.`);
  }
  if (conceptTag === "kkt_osqp_active_constraints") {
    return parameter("multiplier_threshold", "\\epsilon_\\lambda", 0, 0.1, 0.001, `${title}에서 active constraint 판정 threshold를 조절한다.`);
  }
  if (conceptTag === "chebyshev_butterworth_filter_design") {
    return parameter("transition_width_hz", "\\Delta f", 1, 200, 40, `${title}에서 passband와 stopband 사이 transition width를 조절한다.`);
  }
  if (conceptTag === "butterworth_filter_order_design") {
    return parameter("sample_rate_hz", "f_s", 50, 1000, 500, `${title}에서 Nyquist margin과 discrete filter response를 조절한다.`);
  }
  if (conceptTag === "laplace_final_value_bode_margin") {
    return parameter("phase_margin_target", "PM^*", 15, 90, 45, `${title}에서 목표 phase margin을 조절한다.`);
  }
  if (conceptTag === "feedforward_model_error_robustness") {
    return parameter("residual_budget", "\\epsilon_g", 0, 1, 0.2, `${title}에서 허용 gravity residual ratio를 조절한다.`);
  }
  if (conceptTag === "controllability_gramian_numeric") {
    return parameter("condition_limit", "\\kappa_{max}", 1, 10000, 100, `${title}에서 허용 Gramian condition number를 조절한다.`);
  }
  if (conceptTag === "preempt_rt_kernel_jitter_comparison") {
    return parameter("deadline_budget_us", "T_b", 1, 1000, 100, `${title}에서 허용 jitter budget을 조절한다.`);
  }
  if (conceptTag === "particle_filter_resampling_comparison") {
    return parameter("roughening_noise", "\\sigma_r", 0, 1, 0.05, `${title}에서 resampling 후 diversity noise를 조절한다.`);
  }
  if (conceptTag === "imu_camera_tight_coupling_factor") {
    return parameter("time_offset_ms", "\\Delta t", -50, 50, 0, `${title}에서 camera-IMU timestamp offset을 조절한다.`);
  }
  if (conceptTag === "ppo_gae_sac_entropy_tuning") {
    return parameter("unsafe_action_rate", "p_u", 0, 1, 0.01, `${title}에서 unsafe exploration rate를 조절한다.`);
  }
  if (conceptTag === "laplace_z_bode_pid_design") {
    return parameter("phase_margin_target", "PM^*", 15, 90, 45, `${title}에서 목표 phase margin을 직접 조절한다.`);
  }
  if (conceptTag.includes("kalman") || conceptTag.includes("slam")) {
    return parameter("innovation_gate", "\\chi^2", 0.5, 20, 5.99, `${title}에서 outlier rejection 또는 loop closure gate 경계를 조절한다.`);
  }
  if (conceptTag.includes("pid") || conceptTag.includes("control") || conceptTag.includes("cbf")) {
    return parameter("settling_or_safety_bound", "b_s", 0, 5, 0.5, `${title}에서 settling tolerance 또는 safety set 경계를 직접 조절한다.`);
  }
  if (conceptTag.includes("trajectory") || conceptTag.includes("planning") || conceptTag.includes("dwa")) {
    return parameter("time_horizon", "T_h", 0.1, 20, 3, `${title}에서 planner가 미래 충돌과 동역학을 보는 시간 범위를 조절한다.`);
  }
  if (conceptTag.includes("rl") || conceptTag.includes("dreamer") || conceptTag.includes("domain") || conceptTag.includes("vlm")) {
    return parameter("uncertainty_gate", "\\sigma_{max}", 0, 1, 0.2, `${title}에서 policy/model/grounding 불확실성을 action gate에 반영한다.`);
  }
  if (conceptTag.includes("dynamics") || conceptTag.includes("torque") || conceptTag.includes("jacobian")) {
    return parameter("singularity_or_torque_limit", "\\kappa/\\tau_{max}", 0.1, 100, 10, `${title}에서 singularity 또는 torque limit 근처의 실패 경계를 조절한다.`);
  }
  if (conceptTag.includes("vision") || conceptTag.includes("tensorrt")) {
    return parameter("latency_budget_ms", "T_{max}", 1, 100, 33, `${title}에서 perception 결과가 제어 주기 deadline을 만족하는지 조절한다.`);
  }
  return parameter(
    `${parameterName}_failure_threshold`,
    "\\tau_f",
    0,
    10,
    2,
    `${title}에서 정상/실패 판정을 가르는 ${parameterName} threshold를 조절한다.`,
  );
};

const spec = (
  id: string,
  title: string,
  conceptTag: string,
  connectedEquation: string,
  connectedCodeLab: string,
  parameterName: string,
  symbol: string,
  normalCase: string,
  failureCase: string,
): VisualizationSpec => ({
  id,
  title,
  conceptTag,
  connectedEquation,
  connectedCodeLab,
  parameters: [
    { name: parameterName, symbol, min: 0, max: 10, default: 1, description: `${title}에서 ${symbol} 항을 직접 조작한다.` },
    secondaryParameterFor(title, conceptTag, parameterName),
    tertiaryParameterFor(title, conceptTag, parameterName),
  ],
  normalCase,
  failureCase,
  interpretationQuestions: [
    `${title}에서 ${symbol}를 키웠을 때 ${connectedEquation}의 어느 항이 바뀌는지 설명하라.`,
    `${title}에서 2번과 3번 슬라이더를 동시에 바꾸면 정상/실패 경계가 어떻게 이동하는지 설명하라.`,
    `${failureCase}가 발생했을 때 코드랩에서 어떤 출력을 확인해야 하는지 말하라.`,
  ],
});

export const v2VisualizationCatalog: VisualizationSpec[] = [
  spec("vis_vector_projection", "Vector Projection", "vector_projection", "proj_b(a)=(a dot b)/(b dot b)b", "lab_vector_projection", "vector_angle", "theta", "projection length가 dot product와 일치한다.", "두 벡터가 거의 직교하면 projection이 0에 가까워진다."),
  spec("vis_cross_product_direction", "Cross Product Direction", "cross_product", "a x b = ||a||||b||sin(theta)n", "lab_cross_product", "angle", "theta", "오른손 법칙 방향이 안정적으로 보인다.", "평행 벡터에서는 cross product 크기가 0이다."),
  spec("vis_eigenvector_covariance_catalog", "Eigenvector and Covariance Ellipse", "eigen_covariance_ellipse", "Sigma v=lambda v", "lab_eigen_covariance_ellipse", "correlation", "rho", "ellipse 주축이 eigenvector와 일치한다.", "rho가 ±1에 가까우면 ellipse가 납작해진다."),
  spec("vis_pca_direction", "PCA Direction", "pca_direction", "w*=argmax w^T Sigma w", "lab_pca_direction", "variance_ratio", "lambda_1/lambda_2", "첫 주성분이 최대 분산 방향을 가리킨다.", "고유값이 비슷하면 주성분 방향이 불안정하다."),
  spec("vis_svd_transformation_catalog", "SVD Transformation", "svd_condition_number", "A=U Sigma V^T", "lab_svd_condition_number", "sigma_min", "sigma_min", "원은 타원으로 매끄럽게 변환된다.", "sigma_min이 0에 가까우면 inverse가 불안정하다."),
  spec("vis_least_squares_line_catalog", "Least Squares Line Fitting", "least_squares", "min ||Xtheta-y||^2", "lab_least_squares_line", "outlier", "y_o", "잔차가 균형 있게 분포한다.", "outlier가 fitting line을 크게 끌어당긴다."),
  spec("vis_gaussian_mle_catalog", "Gaussian MLE Fitting", "gaussian_mle", "mu_hat=mean(x)", "lab_gaussian_mle", "sample_count", "N", "sample 수가 커지면 추정 분포가 안정된다.", "sample 수가 작으면 variance가 흔들린다."),
  spec("vis_gradient_descent_surface", "Gradient Descent Loss Surface", "gradient_descent", "theta=theta-alpha grad J", "lab_gradient_descent", "learning_rate", "alpha", "loss가 점진적으로 감소한다.", "alpha가 너무 크면 발산한다."),
  spec("vis_low_pass_catalog", "Low-pass Filter Noise Smoothing", "low_pass_filter", "y[k]=alpha x[k]+(1-alpha)y[k-1]", "lab_low_pass_filter_imu", "alpha", "alpha", "노이즈가 줄고 step이 따라간다.", "alpha가 너무 작으면 안전 감지가 지연된다."),
  spec("vis_aliasing_demo", "Aliasing Demonstration", "nyquist_aliasing", "f_s > 2 f_max", "lab_aliasing", "sample_rate", "f_s", "Nyquist 조건에서 원 신호가 복원된다.", "sample rate가 낮으면 낮은 주파수처럼 보인다."),
  spec("vis_laplace_z_bode_pid", "Pole-zero and Bode PID", "laplace_z_bode_pid_design", "z=(1+sT/2)/(1-sT/2)", "lab_laplace_z_bode_pid", "sample_time", "T", "stable s poles map inside the unit circle.", "sample time이 커지면 discrete pole이 unit circle에 가까워진다."),
  spec("vis_2d_rotation_matrix", "2D Rotation Matrix", "rotation_2d", "R(theta)=[cos -sin; sin cos]", "lab_2d_rotation", "angle", "theta", "벡터 길이가 보존된다.", "degree/radian 혼동으로 방향이 틀어진다."),
  spec("vis_robot_math_3d_so3_rotation_catalog", "3D SO(3) Rotation", "robot_math_3d_rotation_so3", "R^T R=I, det(R)=1", "lab_robot_math_3d_rotation_so3", "yaw", "psi", "회전축 길이와 직교성이 유지된다.", "det(R)=-1이면 reflection이라 로봇 frame이 뒤집힌다."),
  spec("vis_3d_so3_rotation", "3D SO(3) Rotation", "so3_rotation", "R^T R=I, det(R)=1", "lab_so3_rotation", "yaw", "psi", "회전행렬 직교성이 유지된다.", "누적 수치오차로 orthogonality가 깨진다."),
  spec("vis_robot_math_quaternion_slerp_catalog", "Quaternion SLERP", "robot_math_quaternion_slerp", "slerp(q0,q1,t)", "lab_robot_math_quaternion_slerp", "t", "t", "단위 quaternion norm이 1로 유지된다.", "정규화나 q/-q 처리를 빼면 긴 경로 또는 norm drift가 생긴다."),
  spec("vis_quaternion_slerp", "Quaternion SLERP", "quaternion_slerp", "slerp(q0,q1,t)", "lab_quaternion_slerp", "t", "t", "constant angular velocity로 보간된다.", "quaternion sign을 맞추지 않으면 긴 경로로 회전한다."),
  spec("vis_dh_robot_arm", "DH Parameter Robot Arm", "dh_parameter", "T_i=A_i(theta,d,a,alpha)", "lab_dh_robot_arm", "theta_i", "theta_i", "link frame이 순서대로 연결된다.", "frame convention 혼동으로 말단 pose가 틀어진다."),
  spec("vis_2link_fk_ik", "2-link FK/IK", "two_link_fk_ik", "x=l1 cos q1+l2 cos(q1+q2)", "lab_two_link_fk_ik", "target_x", "x_d", "reachable target이면 elbow-up/down 해가 보인다.", "workspace 밖 target은 IK가 실패한다."),
  spec("vis_jacobian_velocity_ellipse", "Jacobian Velocity Ellipse", "jacobian_velocity", "xdot=J qdot", "lab_jacobian_velocity", "q2", "q_2", "ellipse 면적이 manipulability와 연결된다.", "singularity에서 ellipse가 선분에 가까워진다."),
  spec("vis_singularity_dls", "Singularity and Damped Least Squares", "damped_least_squares", "dq=J^T(JJ^T+lambda^2I)^-1e", "lab_dls_ik", "lambda", "lambda", "큰 joint update가 제한된다.", "lambda가 너무 작으면 singularity에서 폭주한다."),
  spec("vis_2link_torque_catalog", "2-link Dynamics Torque Graph", "robot_dynamics_2link_lagrange", "tau=Mqddot+Cqdot+g", "lab_two_link_torque", "payload", "m_p", "토크가 actuator limit 안에 있다.", "payload가 커지면 saturation이 발생한다."),
  spec("vis_newton_euler_recursion", "Newton-Euler Recursion", "robot_dynamics_newton_euler_recursive", "tau_j=sum r x F", "lab_cpp_newton_euler_planar_gravity", "link_count", "n", "outward/inward pass가 torque를 선형 시간에 계산한다.", "distal payload가 proximal torque limit을 넘긴다."),
  spec("vis_gravity_compensation", "Gravity Compensation", "gravity_compensation", "tau=g(q)", "lab_gravity_compensation", "q1", "q_1", "정지 자세에서 처짐이 줄어든다.", "모델 질량이 틀리면 over/under compensation이 생긴다."),
  spec("vis_feedforward_gravity_compensation", "Feedforward Gravity Compensation", "robot_dynamics_feedforward_gravity_compensation", "tau=tau_ff+Kp e+Kd edot", "lab_feedforward_gravity_compensation", "payload", "m_p", "중력보상이 steady-state error를 줄인다.", "payload 모델이 틀리면 torque saturation이 생긴다."),
  spec("vis_trajectory_profile", "Cubic/Quintic Trajectory Profile", "trajectory_planning", "q(t)=a0+a1t+...", "lab_trajectory_profile", "duration", "T", "속도/가속도 경계가 부드럽다.", "T가 너무 짧으면 속도 한계를 넘는다."),
  spec("vis_pid_step_response", "PID Step Response", "pid_control_v2", "u=Kp e + Ki integral(e dt) + Kd de/dt", "lab_pid_step_response_python", "Kp", "K_p", "overshoot와 settling time이 허용 범위 안에 있다.", "Ki가 크고 anti-windup이 없으면 integral windup과 saturation이 생긴다."),
  spec("vis_pid_lqr_step", "PID vs LQR Step Response", "lqr_riccati", "u=-Kx", "lab_scalar_lqr", "R", "R", "settling과 입력 크기가 균형을 이룬다.", "입력이 커져 saturation이 생긴다."),
  spec("vis_mpc_candidates", "MPC Candidate Trajectories", "mpc_formulation", "min sum x^TQx+u^TRu", "lab_mpc_rollout", "horizon", "N", "constraint를 만족하는 최저 cost trajectory를 고른다.", "horizon이 짧으면 장애물 뒤 위험을 보지 못한다."),
  spec("vis_diff_drive_odom", "Differential Drive Odometry", "differential_drive", "v=(vr+vl)/2", "lab_diff_drive", "wheel_base", "b", "odom path가 wheel speed와 일치한다.", "wheel radius 오차가 drift를 만든다."),
  spec("vis_ekf_localization_catalog", "EKF Localization with Covariance Ellipse", "ekf_observation_jacobian", "K=PH^T(HPH^T+R)^-1", "lab_ekf_localization", "R", "R", "관측 방향 covariance가 줄어든다.", "잘못된 H가 covariance를 거짓으로 줄인다."),
  spec("vis_ukf_sigma_points", "UKF Sigma Point Propagation", "ukf_sigma_point_localization", "Y_i=f(X_i)", "lab_ukf_sigma_point_pendulum", "variance", "P", "sigma point가 비선형 함수 뒤 mean/covariance를 복원한다.", "분산이 크면 Gaussian 근사가 약해진다."),
  spec("vis_occupancy_grid", "Occupancy Grid Mapping", "occupancy_grid", "l_t=l_{t-1}+logit(p(z|m))", "lab_occupancy_grid", "hit_prob", "p_hit", "반복 hit cell 확률이 증가한다.", "센서 max range 처리가 틀리면 빈 공간이 막힌다."),
  spec("vis_astar_rrt", "A* vs RRT", "path_planning", "f(n)=g(n)+h(n)", "lab_astar_rrt", "heuristic_weight", "w", "A*가 일관된 grid 최단 경로를 찾는다.", "heuristic이 과하면 최적성이 깨진다."),
  spec("vis_dwa_velocity", "DWA Candidate Velocity", "dwa", "score=heading+clearance+velocity", "lab_dwa", "clearance_weight", "w_c", "충돌 없는 속도 후보를 고른다.", "clearance weight가 낮으면 장애물에 붙는다."),
  spec("vis_nav2_bt_action_flow", "Nav2 Behavior Tree Action Flow", "nav2_behavior_tree_action_server", "goal->feedback->result", "lab_nav2_bt_action_contract", "recovery_count", "N_r", "planner/controller/recovery가 BT status로 연결된다.", "feedback timeout이나 recovery budget 초과가 action failure로 이어진다."),
  spec("vis_dynamic_obstacle", "Dynamic Obstacle Avoidance", "dynamic_obstacle", "TTC=d/v_rel", "lab_dynamic_obstacle", "relative_speed", "v_rel", "TTC가 충분하면 회피가 여유롭다.", "TTC가 작으면 emergency stop이 필요하다."),
  spec("vis_pose_graph_slam", "Pose Graph SLAM", "pose_graph_slam", "min sum ||e_ij(x_i,x_j)||^2", "lab_pose_graph", "loop_weight", "Omega", "loop edge가 drift를 줄인다.", "잘못된 loop closure는 map을 찌그러뜨린다."),
  spec("vis_loop_closure", "Loop Closure Before/After", "loop_closure", "x*=argmin e^T Omega e", "lab_loop_closure", "closure_error", "e_loop", "전후 trajectory gap이 줄어든다.", "false positive closure가 전체 pose graph를 망가뜨린다."),
  spec("vis_tensorrt_latency_pareto", "TensorRT Latency/Accuracy Pareto", "tensorrt_onnx_quantization_pipeline", "T_total<T_deadline", "lab_tensorrt_onnx_quantization_contract", "int8_drop", "Delta acc", "latency와 accuracy drop이 둘 다 budget 안에 있다.", "INT8이 빠르지만 safety class recall을 떨어뜨린다."),
  spec("vis_cpp_realtime_jitter_histogram", "1kHz Jitter Histogram", "cpp_realtime_control_loop_jitter", "J=abs(T-Ttarget)", "lab_cpp_realtime_control_loop_jitter", "max_jitter", "J_max", "tail jitter가 deadline budget 안에 있다.", "평균은 좋아도 p99 deadline miss가 누적된다."),
  spec("vis_cbf_safety_set", "CBF Safety Set", "cbf_qp_safety_filter", "grad_h u + alpha h >= 0", "lab_cbf_qp_safety_filter", "alpha", "alpha", "nominal command가 safety set을 유지한다.", "solver failure나 constraint 위반이면 stop/fallback이 필요하다."),
  spec("vis_ppo_sac_reward_curve", "PPO/SAC Reward and Safety Curve", "rl_ppo_sac_reward_shaping", "min(rA,clip(r)A)", "lab_ppo_sac_reward_shaping", "clip_epsilon", "epsilon", "return이 오르면서 collision rate가 낮게 유지된다.", "reward hacking으로 return은 오르지만 collision이 증가한다."),
  spec("vis_vlm_embedding_space", "VLM Embedding Space", "vlm_architecture_to_vla_bridge", "score=cos(v,t)", "lab_vlm_embedding_grounding_bridge", "threshold", "tau_g", "grounding confidence가 action gate를 통과한다.", "ambiguous grounding이면 VLA action을 stop/escalate한다."),
  spec("vis_pytorch_bc_onnx_export_parity", "PyTorch to ONNX Export Parity Gate", "pytorch_bc_onnx_export_contract", "e_max=max|pi_torch(o)-pi_onnx(o)|", "lab_pytorch_bc_onnx_export_contract", "parity_tolerance", "epsilon", "exported ONNX graph의 input/output 계약이 고정되고 parity error가 tolerance 안에 있다.", "shape/name/dtype 계약이 어긋나 C++ Runtime 입력 tensor 또는 output 해석이 실패한다."),
  spec("vis_onnxruntime_cpp_policy_latency_contract", "ONNX Runtime C++ Buffer and Latency Contract", "onnxruntime_cpp_policy_inference", "Ttotal=Tpre+Tort+Tpost", "lab_onnxruntime_cpp_policy_inference", "obs_dim", "D_o", "buffer length가 shape 계약과 일치하고 p99 total latency가 deadline 안에 있다.", "Runtime만 빠르고 preprocess/postprocess가 느려 ROS 2 publish 시점에는 stale action이 된다."),
  spec("vis_ros2_image_inference_latency_gate", "ROS 2 Image Inference Latency and Publish Gate", "ros2_image_inference_latency_node", "publish=(Tage<Tmax) and (conf>tau)", "lab_ros2_image_inference_latency_node", "sensor_age_ms", "T_age", "sensor age와 pipeline latency 합이 deadline 안이고 confidence가 threshold 이상일 때만 publish한다.", "stale image 또는 low confidence 결과가 actuator command로 넘어가 안전 gate가 뚫린다."),
  spec("vis_null_space_motion", "Null Space Arm Posture Motion", "null_space_redundancy_resolution", "dq=J^+xdot+(I-J^+J)dq0", "lab_null_space_redundancy_resolution", "posture_gain", "k_0", "end-effector task가 유지되고 elbow posture만 바뀐다.", "projector가 틀리면 task error가 증가한다."),
  spec("vis_contact_friction_cone", "Contact Force Cone and Slip Margin", "contact_dynamics_friction_cone_grasp", "|Ft| <= mu Fn", "lab_contact_friction_cone_grasp", "mu", "mu", "force vector가 friction cone 안에 있고 slip margin이 양수다.", "tangential load가 cone 밖으로 나가면 grasp가 미끄러진다."),
  spec("vis_ilqr_trajectory_optimization", "iLQR Cost Descent and Rollout", "ilqr_trajectory_optimization_receding_horizon", "du=k+Kdx", "lab_ilqr_scalar_trajectory_optimization", "line_search_alpha", "alpha", "rollout cost가 감소하고 control limit 안에 있다.", "local model update를 크게 적용해 nonlinear rollout cost가 증가한다."),
  spec("vis_dagger_distribution_shift", "DAgger Distribution Shift Recovery", "dagger_dataset_aggregation_imitation_learning", "D <- D union visited states", "lab_dagger_dataset_aggregation", "expert_mix_beta", "beta", "visited-state coverage가 넓어지고 recovery error가 줄어든다.", "성공 demonstration만 남겨 covariate shift가 유지된다."),
  spec("vis_dreamer_rssm_latent_rollout", "Dreamer RSSM Latent Imagination", "dreamer_rssm_world_model_implementation", "z_next ~ p(z|h,a)", "lab_dreamer_rssm_world_model", "imagination_horizon", "H", "latent rollout uncertainty가 낮고 reward prediction이 일관된다.", "uncertainty가 커진 imagined state에서 policy가 model error를 exploit한다."),
  spec(
    "vis_antiwindup_pid_integral",
    "Anti-windup PID Integral Comparison",
    "antiwindup_derivative_kick_pid",
    "clip(I+e*dt,-I_max,I_max)",
    "lab_antiwindup_pid_python",
    "I_max",
    "I_{max}",
    "포화 구간에서 integral이 I_max를 넘지 않고 포화 해제 후 빠르게 수렴한다.",
    "I_max가 너무 크면 windup이 그대로 발생해 overshoot가 크다.",
  ),
  spec(
    "vis_impedance_stiffness_contact_force",
    "Impedance Stiffness vs Contact Force",
    "impedance_control_contact_depth",
    "x_ss=x_d-F/K",
    "lab_impedance_control_pybullet_contact",
    "stiffness_K",
    "K",
    "K가 작으면 접촉력이 낮고 안전하다. 적절한 B에서 진동 없이 wall에 안착한다.",
    "K가 너무 크면 steady-state force가 F_break를 넘어 물체가 파손된다.",
  ),
  spec("vis_dh_craig_spong_convention", "Craig/Spong DH Convention Difference", "dh_craig_spong_convention_guard", "A_std != A_mod", "lab_dh_craig_spong_convention_guard", "theta", "theta", "한 convention으로 모든 link transform을 일관되게 계산한다.", "standard와 modified를 섞으면 tool frame pose가 자세별로 달라진다."),
  spec("vis_ik_solution_selection_limits", "IK Multiple Solution Selection by Limits", "ik_solution_selection_joint_limit_continuity", "argmin ||q-qprev||^2 + limit penalty", "lab_ik_solution_selection_joint_limit_continuity", "continuity_weight", "w_c", "joint limit 안쪽에서 이전 자세와 연속적인 IK 해를 선택한다.", "해 선택 기준이 없으면 elbow flip과 joint limit violation이 생긴다."),
  spec("vis_rank_nullity_nullspace_ik", "Rank-deficient IK Null-space Projection", "rank_nullity_pseudoinverse_ik", "rank(J)+nullity(J)=n", "lab_rank_nullity_pseudoinverse_ik", "jacobian_rank", "rank(J)", "null-space projection을 더해도 task velocity가 유지된다.", "projector가 틀리면 secondary motion이 task error를 만든다."),
  spec("vis_kkt_osqp_active_constraints", "KKT Multiplier and OSQP Active Constraint", "kkt_osqp_active_constraints", "lambda_i g_i(x)=0", "lab_kkt_osqp_active_constraints", "constraint_bound", "u_max", "bound에 닿은 constraint만 양의 multiplier를 가진다.", "dual variable을 해석하지 않으면 safety constraint 작동 여부를 놓친다."),
  spec("vis_se3_expmap_twist_tf2", "se(3) Twist Exponential Map to ROS2 tf2", "se3_lie_algebra_expmap_twist", "T=exp(xi_hat)", "lab_se3_expmap_twist_tf2", "rotation_angle", "theta", "twist가 finite SE(3) transform으로 안정적으로 변환된다.", "small angle 처리나 frame convention이 틀리면 tf2 pose가 튄다."),
  spec("vis_geometric_analytic_jacobian_compare", "Geometric vs Analytic Jacobian 비교", "geometric_vs_analytic_jacobian", "Ja=T^-1 Jg", "lab_geometric_vs_analytic_jacobian", "pitch_angle", "theta", "pitch가 0도 근처이면 두 rate가 비슷하다.", "pitch가 90도에 가까우면 analytic rate가 폭주한다."),
  spec("vis_spatial_rnea_6dof_torque_chain", "6DOF RNEA Torque Propagation per Joint", "spatial_rnea_6dof_backward_pass", "tau_i=S_i^T f_i", "lab_spatial_rnea_6dof_backward_pass", "payload_mass", "m_p", "distal wrench가 parent joint로 올바르게 누적된다.", "payload/velocity가 커지면 proximal torque limit을 넘는다."),
  spec("vis_feedforward_model_error_residual", "Feedforward Model Error Residual", "feedforward_model_error_robustness", "r_g=g_true-g_hat", "lab_feedforward_model_error_robustness", "payload_error", "Delta m", "모델 residual이 작고 feedforward가 tracking error를 줄인다.", "모델 오차가 크면 feedforward가 saturation과 overshoot를 만든다."),
  spec("vis_controllability_gramian_eigen", "Controllability Gramian Eigenvalue Map", "controllability_gramian_numeric", "Wc=sum A^kBB^T(A^T)^k", "lab_controllability_gramian_numeric", "horizon_steps", "N", "Gramian이 full rank이고 eigenvalue가 actuator limit 안에서 충분하다.", "rank는 full이어도 condition number가 크면 특정 mode 제어가 어렵다."),
  spec("vis_lqr_bryson_poles", "LQR Bryson Rule Q/R to Pole Movement", "lqr_bryson_rule_pole_design", "Qii=1/xmax^2", "lab_lqr_bryson_rule_pole_design", "state_error_limit", "x_max", "Q/R과 pole 위치가 actuator limit 안에서 균형을 이룬다.", "R이 너무 작으면 입력 saturation이 발생한다."),
  spec("vis_backcalc_clamping_integral_compare", "Back-calculation vs Clamping Integral 비교", "back_calculation_antiwindup_control", "I+=e dt+Ka(us-ur)dt", "lab_back_calculation_antiwindup_control", "backcalc_gain", "K_a", "포화 후 integral이 부드럽게 회복된다.", "Ka가 너무 크면 integral이 진동한다."),
  spec("vis_admittance_impedance_contact_response", "Admittance vs Impedance Contact Response", "admittance_vs_impedance_control", "M xdd+B xd+Kx=F", "lab_admittance_vs_impedance_control", "virtual_mass", "M_d", "force sensing과 damping이 충분하면 접촉 응답이 안정하다.", "힘센서가 없거나 delay가 크면 admittance가 불안정하다."),
  spec("vis_clip_temperature_embedding", "CLIP Embedding Temperature Interactive", "clip_contrastive_temperature_loss", "softmax(S/tau)", "lab_clip_contrastive_temperature_loss", "temperature", "tau", "positive pair가 hard negative와 분리된다.", "temperature가 너무 작으면 gradient가 불안정하다."),
  spec("vis_llava_cross_attention_grounding", "LLaVA Cross-attention Grounding", "llava_cross_attention_vla_grounding", "softmax(QK^T/sqrt(d))V", "lab_llava_cross_attention_vla_grounding", "attention_temperature", "tau_a", "명령 token이 올바른 object patch에 집중한다.", "grounding margin이 작으면 action ambiguity가 생긴다."),
  spec("vis_rssm_latent_state_rollout", "RSSM Latent Trajectory vs State Trajectory", "rssm_elbo_kl_world_model", "L=recon+reward+beta KL", "lab_rssm_elbo_kl_world_model", "kl_beta", "beta", "posterior와 prior가 정렬되어 rollout이 안정하다.", "KL이 무너지면 imagined trajectory가 real state와 벌어진다."),
  spec("vis_diffusion_policy_denoising", "Diffusion Policy Denoising Trajectory", "pi0_openvla_diffusion_token_policy", "a_{k-1}=a_k-eps", "lab_pi0_openvla_diffusion_token_policy", "denoise_steps", "N", "budget 안에서 action trajectory가 부드럽다.", "denoise step이 많아 stale action이 된다."),
  spec("vis_chi_squared_outlier_boundary", "Chi-squared Outlier Boundary Interactive", "ekf_chi_squared_outlier_rejection", "d^2=nu^T S^-1 nu", "lab_ekf_chi_squared_outlier_rejection", "mahalanobis_d2", "d^2", "innovation ellipse 안의 관측만 update한다.", "boundary 밖 outlier를 update하면 EKF가 발산한다."),
  spec("vis_fisher_information_observability", "Fisher Information Ellipse + Observability", "fisher_information_observability", "I=H^T R^-1 H", "lab_fisher_information_observability", "sensor_baseline", "b", "FIM eigenvalue가 양호해 uncertainty ellipse가 작다.", "eigenvalue가 0에 가까우면 unobservable direction이 생긴다."),
  spec("vis_ukf_alpha_sigma_points", "UKF Alpha Sigma Point Distribution", "ukf_alpha_beta_kappa_tuning", "lambda=alpha^2(n+kappa)-n", "lab_ukf_alpha_beta_kappa_tuning", "alpha", "alpha", "sigma point가 비선형 곡률을 충분히 덮는다.", "alpha가 너무 작으면 sigma point가 mean에 몰린다."),
  spec("vis_orca_velocity_cone", "ORCA Velocity Cone + Allowed Velocity Set", "orca_velocity_obstacle_avoidance", "n^T(v-v_orca)>=0", "lab_orca_velocity_obstacle_avoidance", "relative_speed", "v_rel", "목표 속도와 가까운 cone 밖 velocity를 고른다.", "상대가 비협조이면 reciprocal guarantee가 깨진다."),
  spec("vis_particle_resampling_methods", "Particle Resampling Method Comparison", "particle_filter_resampling_comparison", "Neff=1/sum(w^2)", "lab_particle_filter_resampling_comparison", "effective_sample_ratio", "N_eff/N", "N_eff가 낮을 때 low-variance resampling으로 diversity를 유지한다.", "resampling을 과도하게 하면 particle deprivation이 발생한다."),
  spec("vis_imu_camera_tight_coupling", "IMU-Camera Tight Coupling Residual", "imu_camera_tight_coupling_factor", "J=sum ||r_pixel||^2+||r_imu||^2", "lab_imu_camera_tight_coupling_factor", "pixel_noise_sigma", "sigma_p", "visual/IMU residual이 covariance scale에 맞게 함께 줄어든다.", "time offset이나 extrinsic이 틀리면 residual이 한쪽 센서를 계속 밀어낸다."),
  spec("vis_isam2_incremental_update", "iSAM2 Incremental Factor Update", "isam2_incremental_factor_graph", "min sum ||r_i||_Omega^2", "lab_isam2_incremental_factor_graph", "loop_residual", "r_l", "새 factor가 일부 clique만 업데이트해 drift를 줄인다.", "false loop closure가 map을 찌그러뜨린다."),
  spec("vis_domain_randomization_sensitivity", "Domain Randomization Distribution Sensitivity", "domain_randomization_adr_gap_design", "gap=Jsim-Jreal", "lab_domain_randomization_adr_gap_design", "friction_range", "Delta_mu", "train distribution이 real logs를 덮고 gap이 작다.", "분포가 너무 좁거나 넓으면 real success가 낮다."),
  spec("vis_mpc_soft_slack", "MPC Soft Constraint Slack Visualization", "mpc_soft_constraint_infeasibility", "g(x,u)<=s", "lab_mpc_soft_constraint_infeasibility", "slack_penalty", "rho", "slack이 거의 0이고 tracking constraint를 만족한다.", "slack이 커지면 safety fallback이 필요하다."),
  spec("vis_clf_cbf_qp_priority", "CLF-CBF Combined QP Priority", "clf_cbf_qp_priority_resolution", "CBF hard, CLF relaxed", "lab_clf_cbf_qp_priority_resolution", "safety_margin_h", "h", "CBF와 CLF가 동시에 만족된다.", "충돌 시 CLF를 relax하고 CBF를 우선한다."),
  spec("vis_preempt_rt_jitter_tail", "PREEMPT_RT vs Generic Kernel Jitter Tail", "preempt_rt_kernel_jitter_comparison", "P99.9(jitter)<budget", "lab_preempt_rt_kernel_jitter_comparison", "period_us", "T", "P99.9 jitter가 budget보다 낮고 miss rate가 0에 가깝다.", "평균은 좋아도 tail jitter가 budget을 넘으면 realtime loop가 안전하지 않다."),
  spec("vis_laplace_bode_margin_final_value", "Laplace Final Value and Bode Margin", "laplace_final_value_bode_margin", "lim f(t)=lim sF(s)", "lab_laplace_final_value_bode_margin", "dominant_pole", "p", "closed-loop pole이 stable이고 margin이 충분하다.", "RHP pole이나 낮은 phase margin이면 불안정하다."),
  spec("vis_butterworth_frequency_response", "Butterworth Filter Frequency Response", "butterworth_filter_order_design", "|H|^2=1/(1+(w/wc)^(2n))", "lab_butterworth_filter_order_design", "filter_order", "n", "noise attenuation과 phase delay가 budget 안에 있다.", "order/cutoff가 과하면 delay로 제어가 불안정해진다."),
  spec("vis_chebyshev_butterworth_order_compare", "Butterworth vs Chebyshev Filter Order", "chebyshev_butterworth_filter_design", "buttord vs cheb1ord", "lab_chebyshev_butterworth_filter_design", "passband_ripple_db", "A_p", "요구 attenuation을 만족하면서 ripple과 delay가 budget 안에 있다.", "order만 보고 선택하면 ripple이나 phase delay가 제어 loop를 망가뜨린다."),
  spec("vis_quintic_jerk_profile", "5th Polynomial Trajectory Jerk Profile", "jerk_continuous_quintic_trajectory", "q(t)=sum a_i t^i", "lab_jerk_continuous_quintic_trajectory", "duration", "T", "boundary 조건이 맞고 jerk가 limit 안에 있다.", "duration이 짧으면 jerk와 vibration이 커진다."),
  spec("vis_tensorrt_real_onnx_latency_calibration", "TensorRT ONNX Inference and INT8 Calibration", "tensorrt_real_onnx_inference_calibration", "Ttotal=Tpre+Tengine+Tpost", "lab_tensorrt_real_onnx_inference_calibration", "calibration_size", "N_cal", "latency와 accuracy drop이 budget 안에 있다.", "calibration data가 부족해 safety class recall이 떨어진다."),
  spec("vis_vlm_vla_lora_finetuning_coverage", "VLM/VLA LoRA Fine-tuning Coverage", "vlm_vla_lora_finetuning_dataset", "Delta W=BA", "lab_vlm_vla_lora_finetuning_dataset", "lora_rank", "r", "adapter가 validation grounding을 높이고 unsafe action rate는 낮다.", "dataset coverage가 좁으면 unseen instruction에서 action drift가 생긴다."),
  spec("vis_ppo_gae_sac_entropy", "PPO GAE Lambda vs SAC Entropy Tuning", "ppo_gae_sac_entropy_tuning", "A=sum(gamma lambda)^l delta", "lab_ppo_gae_sac_entropy_tuning", "gae_lambda", "lambda", "advantage variance와 exploration이 safety budget 안에서 균형을 이룬다.", "lambda/alpha가 과하면 high variance update나 unsafe exploration이 발생한다."),
  spec("vis_system_parameter_report_tradeoff", "System Parameter Report Trade-off Surface", "system_parameter_selection_report", "Score=wsS+waA-wlL-wrR", "lab_system_parameter_selection_report", "system_safety_margin", "m_s", "모든 핵심 metric이 budget 안에 있고 rollback plan이 명확하다.", "accuracy만 높고 deadline/safety/fallback 증거가 없으면 reject한다."),
  spec("vis_vector_matrix_grid_cross_product", "Matrix Transform Grid and Cross-product Direction", "vector_matrix_inverse_cross_product_basics", "y=Ax, tau=r x F", "lab_vector_matrix_inverse_cross_product_basics", "scale_x", "s_x", "격자가 뒤집히지 않고 det(A)가 0에서 멀어 inverse와 torque 방향을 안정적으로 해석한다.", "det(A)가 0에 가까우면 격자가 접혀 inverse/Jacobian 계산이 불안정하다."),
  spec("vis_fk_matrix_ik_singularity_steps", "FK Matrix Steps, IK Trace, and Manipulability Ellipse", "fk_matrix_ik_singularity_visual_lab", "w=sqrt(det(JJ^T))", "lab_fk_matrix_ik_singularity_visual_lab", "q2", "q_2", "IK trace가 target error를 줄이고 manipulability ellipse 면적이 충분하다.", "q2가 0도 근처이면 ellipse가 선분으로 붕괴하고 DLS damping이 필요하다."),
  spec("vis_bicycle_stanley_lateral_error", "Bicycle Model Stanley Lateral Error", "bicycle_model_stanley_controller", "delta=psi_e+atan(k e_y/v)", "lab_bicycle_model_stanley_controller", "cross_track_error", "e_y", "heading/cross-track error가 줄고 steering saturation을 넘지 않는다.", "gain/velocity 조합이 나쁘면 조향 포화 또는 lateral oscillation이 생긴다."),
  spec("vis_dataset_split_confusion_matrix", "Dataset Split Leakage and Confusion Matrix", "dataset_label_split_confusion_matrix_practice", "P=TP/(TP+FP), R=TP/(TP+FN)", "lab_dataset_label_split_confusion_matrix_practice", "label_noise_rate", "eta", "scene leakage가 0이고 safety class recall이 목표 이상이다.", "scene overlap과 label noise가 validation score를 가짜로 높인다."),
  spec("vis_ros2_cli_graph_diagnostics", "ROS2 CLI Graph Diagnostics Flow", "ros2_cli_command_diagnostics_lab", "graph -> topic hz -> param -> action", "lab_ros2_cli_command_diagnostics_lab", "topic_rate_hz", "f", "graph endpoint, topic rate, param namespace, action feedback/result가 일관된다.", "QoS mismatch나 cancel 처리 누락으로 goal이 hanging 상태에 남는다."),
  spec("vis_prompt_eval_harness_golden_output", "Prompt Context and Eval Harness Flow", "prompt_context_eval_harness_engineering", "p_pass=mean(schema_ok && rubric_ok)", "lab_prompt_context_eval_harness_engineering", "retrieval_top_k", "k", "schema 통과, grounding 통과, golden output pass rate가 release threshold 이상이다.", "top-k 과다나 느슨한 schema로 unsafe action이 통과한다."),
  spec("vis_matrix_multiplication_grid_steps", "Matrix Multiplication Step-by-step Grid", "matrix_multiplication_grid_basics", "C=AB", "lab_matrix_multiplication_grid_basics", "scale_x", "s_x", "B basis를 먼저 움직이고 A가 다시 변환한 결과가 AB와 일치한다.", "A와 B 순서를 바꾸면 frame composition 결과가 달라진다."),
  spec("vis_pseudoinverse_rank_deficient_plane", "Pseudoinverse Minimum-norm Solution", "pseudoinverse_rank_deficient_basics", "x=A^+b", "lab_pseudoinverse_rank_deficient_basics", "sigma_min", "\\sigma_{min}", "작은 singular value를 cutoff하고 minimum-norm 해와 null-space family를 구분한다.", "작은 singular value를 무조건 뒤집으면 노이즈와 joint update가 폭증한다."),
  spec("vis_partial_gradient_tangent_plane", "Partial Derivative Tangent Plane", "partial_derivative_gradient_tangent_plane", "f(x+dx)=f(x)+grad^T dx", "lab_gradient_tangent_loss_landscape", "x_position", "x", "gradient 화살표와 접평면이 작은 주변 변화의 방향을 잘 예측한다.", "h가 너무 크면 비선형 곡률 때문에 편미분 근사가 틀어진다."),
  spec("vis_gradient_descent_loss_landscape_path", "Gradient Descent Loss Landscape", "gradient_descent_loss_landscape", "theta=theta-alpha grad J", "lab_gradient_tangent_loss_landscape", "learning_rate", "\\alpha", "적절한 learning rate에서 contour 중심으로 loss가 단조 감소한다.", "learning rate가 너무 크면 valley를 건너뛰며 oscillation 또는 발산이 생긴다."),
  spec("vis_gaussian_bayes_update_curves", "Gaussian Prior Likelihood Posterior", "gaussian_bayes_update_distribution", "posterior ∝ prior * likelihood", "lab_gaussian_bayes_update_distribution", "prior_sigma", "\\sigma_0", "posterior가 prior와 measurement 사이에서 더 좁아진다.", "variance 대신 sigma나 precision을 혼동하면 noisy measurement를 과하게 믿는다."),
  spec("vis_finite_difference_ode_error", "Finite Difference and Euler ODE Error", "finite_difference_ode_solver_basics", "x_{k+1}=x_k+dt f(x_k)", "lab_finite_difference_ode_solver_basics", "dt", "\\Delta t", "dt와 h가 적절하면 derivative와 trajectory가 analytic solution에 가깝다.", "dt가 크면 Euler trajectory가 true solution과 크게 벌어진다."),
];
