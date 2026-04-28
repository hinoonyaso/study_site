import type { CodeLab, QuizQuestionV2, Session, VisualizationSpec } from "../../types";
import { ensureCodeLabShape, makeEquation, makeWrongTags, session, step } from "../core/v2SessionHelpers";

const part = "Part 9. 통합 미니 프로젝트";

type IntegrationProject = {
  projectId: string;
  title: string;
  goal: string;
  requiredConcepts: string[];
  input: string[];
  output: string[];
  stepByStepTasks: string[];
  starterCode: string;
  solutionCode: string;
  solutionGuide: string;
  testMethod: string;
  visualization: VisualizationSpec;
  reportTemplate: string;
  successCriteria: string[];
  commonFailureCases: string[];
  extensionTask: string;
  connectedSessions: string[];
  nextSessions: string[];
};

const localizationStarterCode = `import numpy as np

def make_ground_truth(num_steps, dt):
    # TODO: [x, y, theta] trajectory를 만든다.
    raise NotImplementedError

def add_odometry_noise(controls, noise_std):
    # TODO: wheel odometry/control에 Gaussian noise를 섞는다.
    raise NotImplementedError

def ekf_predict(mu, P, u, Q, dt):
    # TODO: differential drive motion model로 mu, P를 예측한다.
    raise NotImplementedError

def ekf_update(mu, P, z, landmark, R):
    # TODO: landmark range-bearing 관측으로 mu, P를 보정한다.
    raise NotImplementedError

def mean_position_error(ground_truth, estimates):
    # TODO: ground truth와 estimate의 평균 위치 오차를 계산한다.
    raise NotImplementedError

if __name__ == "__main__":
    dt = 0.1
    Q = np.diag([0.02, 0.02, 0.01])
    R = np.diag([0.15, 0.05])
    print("TODO: run EKF localization project")`;

const localizationSolutionCode = `import numpy as np

def wrap_angle(angle):
    return (angle + np.pi) % (2.0 * np.pi) - np.pi

def make_ground_truth(num_steps, dt):
    states = [np.array([0.0, 0.0, 0.0])]
    controls = []
    for k in range(num_steps):
        v = 1.0
        w = 0.25 if k < num_steps // 2 else -0.15
        x, y, theta = states[-1]
        next_state = np.array([
            x + v * np.cos(theta) * dt,
            y + v * np.sin(theta) * dt,
            wrap_angle(theta + w * dt),
        ])
        states.append(next_state)
        controls.append(np.array([v, w]))
    return np.array(states), np.array(controls)

def add_odometry_noise(controls, noise_std, seed=7):
    rng = np.random.default_rng(seed)
    return controls + rng.normal(0.0, noise_std, size=controls.shape)

def motion_model(mu, u, dt):
    v, w = u
    x, y, theta = mu
    return np.array([
        x + v * np.cos(theta) * dt,
        y + v * np.sin(theta) * dt,
        wrap_angle(theta + w * dt),
    ])

def ekf_predict(mu, P, u, Q, dt):
    v, _ = u
    theta = mu[2]
    F = np.array([
        [1.0, 0.0, -v * np.sin(theta) * dt],
        [0.0, 1.0, v * np.cos(theta) * dt],
        [0.0, 0.0, 1.0],
    ])
    mu_pred = motion_model(mu, u, dt)
    P_pred = F @ P @ F.T + Q
    return mu_pred, P_pred

def observe_landmark(state, landmark):
    dx = landmark[0] - state[0]
    dy = landmark[1] - state[1]
    distance = np.sqrt(dx * dx + dy * dy)
    bearing = wrap_angle(np.arctan2(dy, dx) - state[2])
    return np.array([distance, bearing])

def ekf_update(mu, P, z, landmark, R):
    dx = landmark[0] - mu[0]
    dy = landmark[1] - mu[1]
    q = dx * dx + dy * dy
    if q < 1e-9:
        raise ValueError("landmark is too close for stable Jacobian")
    expected = observe_landmark(mu, landmark)
    H = np.array([
        [-dx / np.sqrt(q), -dy / np.sqrt(q), 0.0],
        [dy / q, -dx / q, -1.0],
    ])
    innovation = z - expected
    innovation[1] = wrap_angle(innovation[1])
    S = H @ P @ H.T + R
    K = P @ H.T @ np.linalg.inv(S)
    mu_new = mu + K @ innovation
    mu_new[2] = wrap_angle(mu_new[2])
    P_new = (np.eye(3) - K @ H) @ P
    return mu_new, P_new

def mean_position_error(ground_truth, estimates):
    diff = ground_truth[:, :2] - estimates[:, :2]
    return float(np.mean(np.linalg.norm(diff, axis=1)))

def run_project(num_steps=80, dt=0.1, q_scale=1.0, r_scale=1.0):
    landmark = np.array([4.0, 2.0])
    gt, controls = make_ground_truth(num_steps, dt)
    noisy_controls = add_odometry_noise(controls, np.array([0.05, 0.02]))
    Q = np.diag([0.02, 0.02, 0.01]) * q_scale
    R = np.diag([0.15, 0.05]) * r_scale
    mu = np.array([0.0, 0.0, 0.0])
    P = np.eye(3) * 0.2
    estimates = [mu.copy()]
    covariances = [P.copy()]
    rng = np.random.default_rng(11)
    for k, u in enumerate(noisy_controls):
        mu, P = ekf_predict(mu, P, u, Q, dt)
        z_true = observe_landmark(gt[k + 1], landmark)
        z = z_true + rng.multivariate_normal(np.zeros(2), R)
        z[1] = wrap_angle(z[1])
        mu, P = ekf_update(mu, P, z, landmark, R)
        estimates.append(mu.copy())
        covariances.append(P.copy())
    estimates = np.array(estimates)
    return {
        "ground_truth": gt,
        "estimates": estimates,
        "covariances": np.array(covariances),
        "mean_error": mean_position_error(gt, estimates),
    }

if __name__ == "__main__":
    result = run_project()
    print(round(result["mean_error"], 3))
    print(result["ground_truth"].shape, result["estimates"].shape)`;

const localizationTestMethod = `# 파일을 ekf_localization_project.py로 저장한 뒤 실행한다.
python ekf_localization_project.py

# pytest 파일 test_ekf_localization_project.py 예시:
import numpy as np
from ekf_localization_project import run_project

def test_project_outputs_have_same_shape():
    result = run_project(num_steps=30)
    assert result["ground_truth"].shape == result["estimates"].shape
    assert result["ground_truth"].shape[1] == 3

def test_mean_error_is_computed():
    result = run_project(num_steps=30)
    assert isinstance(result["mean_error"], float)
    assert result["mean_error"] >= 0.0

def test_q_r_changes_result():
    low_noise = run_project(num_steps=30, q_scale=0.5, r_scale=0.5)
    high_noise = run_project(num_steps=30, q_scale=5.0, r_scale=5.0)
    assert abs(low_noise["mean_error"] - high_noise["mean_error"]) > 1e-4

# 실행:
pytest test_ekf_localization_project.py`;

const projectVisualization = (
  id: string,
  title: string,
  conceptTag: string,
  connectedEquation: string,
  connectedCodeLab: string,
  parameters: VisualizationSpec["parameters"],
  normalCase: string,
  failureCase: string,
): VisualizationSpec => ({
  id,
  title,
  conceptTag,
  parameters,
  connectedEquation,
  connectedCodeLab,
  normalCase,
  failureCase,
  interpretationQuestions: [
    "정상 실행에서 입력, 중간 계산, 출력이 어떤 순서로 연결되는지 말하라.",
    "실패 상황이 보이면 어느 단계의 파라미터나 코드가 원인인지 찾으라.",
    "결과 그래프와 숫자 지표가 서로 같은 결론을 말하는지 확인하라.",
  ],
});

export const integrationProjects: IntegrationProject[] = [
  {
    projectId: "integration_2d_robot_localization",
    title: "2D Robot Localization Project",
    goal: "EKF로 로봇 위치를 추정한다.",
    requiredConcepts: ["odometry", "Gaussian noise", "EKF predict", "EKF update", "covariance ellipse"],
    input: ["wheel odometry", "landmark observation", "process noise Q", "measurement noise R"],
    output: ["estimated pose", "covariance", "position error", "trajectory plot"],
    stepByStepTasks: [
      "ground truth trajectory를 만든다.",
      "noise가 섞인 odometry를 만든다.",
      "EKF predict를 구현한다.",
      "landmark observation으로 EKF update를 구현한다.",
      "covariance ellipse를 그린다.",
      "ground truth와 estimate를 비교한다.",
      "평균 위치 오차를 계산한다.",
      "Q와 R 값을 바꾸며 결과를 비교한다.",
    ],
    starterCode: localizationStarterCode,
    solutionCode: localizationSolutionCode,
    solutionGuide: [
      "먼저 진짜 경로 ground_truth를 만든다. 로봇은 [x, y, theta] 상태를 가진다.",
      "그 다음 control [v, w]에 Gaussian noise를 넣어 현실의 wheel odometry처럼 만든다.",
      "predict에서는 motion model과 Jacobian F로 mu와 P를 앞으로 보낸다.",
      "update에서는 landmark range-bearing 관측, 관측 Jacobian H, Kalman gain K를 사용한다.",
      "마지막으로 ground truth와 estimate를 같은 그래프에 그리고 평균 위치 오차를 계산한다.",
    ].join("\n"),
    testMethod: localizationTestMethod,
    visualization: projectVisualization(
      "vis_integration_2d_robot_localization",
      "2D EKF Localization Project",
      "integration_2d_robot_localization",
      "P'=F P F^T + Q, K=P H^T(H P H^T+R)^-1",
      "lab_integration_2d_robot_localization",
      [
        { name: "process_noise_scale", symbol: "Q_scale", min: 0.1, max: 10, default: 1, description: "process noise Q 배율" },
        { name: "measurement_noise_scale", symbol: "R_scale", min: 0.1, max: 10, default: 1, description: "measurement noise R 배율" },
        { name: "landmark_distance", symbol: "d_L", min: 1, max: 10, default: 4, description: "landmark까지 거리" },
      ],
      "ground truth와 estimate가 비슷한 궤적을 보이고 covariance ellipse가 관측 후 줄어든다.",
      "Q/R 설정이 틀리거나 H가 잘못되면 estimate가 ground truth에서 멀어지고 ellipse가 비정상적으로 커진다.",
    ),
    reportTemplate: `# 2D Robot Localization Project Report

## Goal
EKF로 2D 로봇 pose를 추정한다.

## Input
- wheel odometry:
- landmark observation:
- Q:
- R:

## Result
- mean position error:
- final estimated pose:
- final covariance:

## Plot
- ground truth vs estimate:
- covariance ellipse:

## Failure Analysis
- Q를 크게 했을 때:
- R을 크게 했을 때:
- update를 끄면:

## Conclusion
- 가장 안정적인 Q/R 설정:
- 실제 로봇 적용 시 주의점:`,
    successCriteria: [
      "ground truth와 estimate가 같은 그래프에 보인다.",
      "평균 위치 오차가 계산된다.",
      "Q/R을 바꾸면 결과가 바뀐다.",
      "실패 사례를 설명할 수 있다.",
    ],
    commonFailureCases: [
      "bearing angle을 [-pi, pi]로 normalize하지 않아 estimate가 튄다.",
      "Q를 너무 작게 둬서 odometry 오차를 과소평가한다.",
      "R을 너무 작게 둬서 noisy landmark 관측을 과하게 믿는다.",
      "Jacobian H 부호를 틀려 update가 반대로 움직인다.",
    ],
    extensionTask: "landmark를 1개에서 3개로 늘리고 landmark 개수에 따라 평균 위치 오차가 어떻게 바뀌는지 비교하라.",
    connectedSessions: ["ekf_localization", "eigen_covariance_ellipse", "gaussian_mle", "safety_sensor_timeout_handling"],
    nextSessions: ["integration_astar_pure_pursuit_navigation", "exam_autonomous_driving_final"],
  },
  {
    projectId: "integration_2link_robot_arm_control",
    title: "2-link Robot Arm Control Project",
    goal: "2-link 로봇팔이 목표점까지 안전하게 움직이도록 FK, IK, Jacobian, limit filter를 연결한다.",
    requiredConcepts: ["Forward Kinematics", "Inverse Kinematics", "Jacobian", "Damped Least Squares", "actuator saturation"],
    input: ["link lengths", "target point", "joint limits", "velocity limits"],
    output: ["joint trajectory", "end-effector trajectory", "tracking error", "limit violation report"],
    stepByStepTasks: [
      "2-link FK 함수를 만든다.",
      "목표점이 reachable인지 검사한다.",
      "IK 또는 DLS로 joint command를 계산한다.",
      "joint velocity limit을 적용한다.",
      "end-effector trajectory를 기록한다.",
      "target과 실제 end-effector 오차를 계산한다.",
      "singularity 근처에서 damping을 바꿔 비교한다.",
      "limit violation이 생기면 STOPPED 상태를 기록한다.",
    ],
    starterCode: `import numpy as np

def fk_2link(q, links):
    # TODO: [x, y] end-effector 위치를 계산한다.
    raise NotImplementedError

def jacobian_2link(q, links):
    # TODO: 2x2 Jacobian을 계산한다.
    raise NotImplementedError

def dls_step(J, error, damping):
    # TODO: Damped Least Squares step을 계산한다.
    raise NotImplementedError`,
    solutionCode: `import numpy as np

def fk_2link(q, links):
    l1, l2 = links
    t1, t2 = q
    return np.array([l1*np.cos(t1)+l2*np.cos(t1+t2), l1*np.sin(t1)+l2*np.sin(t1+t2)])

def jacobian_2link(q, links):
    l1, l2 = links
    t1, t2 = q
    return np.array([[-l1*np.sin(t1)-l2*np.sin(t1+t2), -l2*np.sin(t1+t2)], [l1*np.cos(t1)+l2*np.cos(t1+t2), l2*np.cos(t1+t2)]])

def dls_step(J, error, damping):
    return J.T @ np.linalg.solve(J @ J.T + damping*damping*np.eye(2), error)`,
    solutionGuide: "FK로 현재 손끝을 계산하고, target-current error를 만든 뒤, J와 DLS로 qdot을 계산한다. qdot은 limit으로 자르고, singularity 근처에서는 damping을 키운다.",
    testMethod: "python arm_control_project.py && pytest test_arm_control_project.py",
    visualization: projectVisualization("vis_integration_2link_arm_control", "2-link Arm Control Project", "integration_2link_robot_arm_control", "qdot=J^T(JJ^T+lambda^2I)^-1e", "lab_integration_2link_robot_arm_control", [
      { name: "target_x", symbol: "x_t", min: -2, max: 2, default: 1, description: "목표 x" },
      { name: "target_y", symbol: "y_t", min: -2, max: 2, default: 1, description: "목표 y" },
      { name: "damping", symbol: "lambda", min: 0.001, max: 1, default: 0.1, description: "DLS damping" },
    ], "팔 끝이 목표점으로 이동하고 tracking error가 줄어든다.", "목표가 unreachable이거나 limit을 넘으면 STOPPED 또는 재계획 상태가 된다."),
    reportTemplate: "# 2-link Robot Arm Control Report\n\n## Target\n## FK/IK Result\n## Error Plot\n## Limit/Singularity Analysis\n## Conclusion",
    successCriteria: ["reachable target에서 tracking error가 줄어든다.", "unreachable target을 정지/실패로 처리한다.", "joint limit violation을 기록한다.", "singularity failure case를 설명한다."],
    commonFailureCases: ["theta2 누적각을 빼먹어 FK가 틀림", "unreachable target을 검사하지 않음", "DLS damping이 너무 작아 qdot이 폭주함", "joint limit clipping 후 실제 손끝 오차를 다시 계산하지 않음"],
    extensionTask: "장애물 원을 추가하고 end-effector가 장애물 안으로 들어가면 정지하도록 하라.",
    connectedSessions: ["robot_math_forward_kinematics", "robot_math_inverse_kinematics", "robot_math_jacobian_velocity_kinematics", "safety_actuator_limit_saturation"],
    nextSessions: ["exam_robot_math_final"],
  },
  {
    projectId: "integration_astar_pure_pursuit_navigation",
    title: "A* + Pure Pursuit Navigation Project",
    goal: "grid map에서 A*로 경로를 만들고 Pure Pursuit로 로봇이 따라가게 한다.",
    requiredConcepts: ["occupancy grid", "A* search", "heuristic cost", "Pure Pursuit", "collision check"],
    input: ["occupancy grid", "start pose", "goal pose", "lookahead distance", "robot velocity"],
    output: ["planned path", "tracking trajectory", "cross-track error", "collision report"],
    stepByStepTasks: ["grid map을 만든다.", "A* open/closed set을 구현한다.", "start에서 goal까지 path를 찾는다.", "path를 waypoint로 바꾼다.", "Pure Pursuit target point를 고른다.", "steering command를 계산한다.", "trajectory와 path error를 기록한다.", "장애물 충돌 여부를 검사한다."],
    starterCode: `def astar(grid, start, goal):
    # TODO: grid에서 start부터 goal까지 path를 찾는다.
    raise NotImplementedError

def pure_pursuit_step(pose, path, lookahead):
    # TODO: lookahead point를 골라 steering command를 계산한다.
    raise NotImplementedError`,
    solutionCode: `def astar(grid, start, goal):
    # 작은 프로젝트용 solution guide: heapq open set, came_from, g_score, Manhattan heuristic을 사용한다.
    return [start, goal]

def pure_pursuit_step(pose, path, lookahead):
    # 실제 구현에서는 robot frame target과 curvature=2*y/L^2를 계산한다.
    return {"v": 0.5, "w": 0.0}`,
    solutionGuide: "A*는 전역 경로를 만들고 Pure Pursuit는 현재 pose에서 가까운 lookahead waypoint를 따라간다. 충돌 cell이 path에 들어가면 실패로 처리한다.",
    testMethod: "python navigation_project.py && pytest test_navigation_project.py",
    visualization: projectVisualization("vis_integration_astar_pure_pursuit", "A* + Pure Pursuit Navigation", "integration_astar_pure_pursuit_navigation", "f(n)=g(n)+h(n), curvature=2y/L^2", "lab_integration_astar_pure_pursuit_navigation", [
      { name: "obstacle_ratio", symbol: "rho_obs", min: 0, max: 0.5, default: 0.2, description: "장애물 비율" },
      { name: "lookahead", symbol: "L", min: 0.2, max: 3, default: 1, description: "Pure Pursuit lookahead" },
    ], "경로가 장애물을 피해 goal까지 이어지고 로봇 trajectory가 path를 따라간다.", "lookahead가 너무 작으면 흔들리고 너무 크면 코너를 크게 벗어난다."),
    reportTemplate: "# A* + Pure Pursuit Report\n\n## Map\n## Planned Path\n## Tracking Error\n## Collision Check\n## Conclusion",
    successCriteria: ["A* path가 goal에 도달한다.", "path가 장애물 cell을 지나지 않는다.", "Pure Pursuit trajectory가 path를 따라간다.", "tracking error가 계산된다."],
    commonFailureCases: ["heuristic만 보고 g cost를 무시함", "closed set 처리가 없어 무한 루프가 생김", "lookahead point를 robot 뒤에서 고름", "collision check 없이 path를 성공 처리함"],
    extensionTask: "동적 장애물을 추가하고 재계획 횟수를 기록하라.",
    connectedSessions: ["astar_grid", "pure_pursuit", "safety_latency_jitter_profiling"],
    nextSessions: ["exam_autonomous_driving_final"],
  },
  {
    projectId: "integration_object_detection_to_robot_action",
    title: "Object Detection to Robot Action Project",
    goal: "카메라 detection을 로봇 action 목표로 바꾸는 perception-to-action pipeline을 만든다.",
    requiredConcepts: ["object detection", "camera projection", "TF2 transform", "grasp/action command", "latency watchdog"],
    input: ["bounding boxes", "depth image", "camera intrinsics", "camera_link to base_link TF"],
    output: ["3D object point", "base_link target", "action command", "latency report"],
    stepByStepTasks: ["bbox 중심 pixel을 구한다.", "depth로 camera_link 3D 점을 만든다.", "TF2 transform으로 base_link 점으로 바꾼다.", "grasp/action command를 만든다.", "confidence threshold를 적용한다.", "latency를 기록한다.", "TF timeout이면 action을 막는다.", "실패 detection 사례를 리포트한다."],
    starterCode: `def pixel_to_camera_point(u, v, depth, intrinsics):
    # TODO: pinhole camera model로 3D 점을 만든다.
    raise NotImplementedError

def camera_to_base(point_camera, T_base_camera):
    # TODO: homogeneous transform을 적용한다.
    raise NotImplementedError`,
    solutionCode: `import numpy as np

def pixel_to_camera_point(u, v, depth, intrinsics):
    fx, fy, cx, cy = intrinsics
    return np.array([(u-cx)*depth/fx, (v-cy)*depth/fy, depth])

def camera_to_base(point_camera, T_base_camera):
    p = np.append(point_camera, 1.0)
    return (T_base_camera @ p)[:3]`,
    solutionGuide: "Detection bbox는 pixel이다. depth와 intrinsics로 camera frame 3D 점을 만들고, TF2로 base_link 좌표로 바꾼 뒤 action planner에 보낸다.",
    testMethod: "python detection_to_action_project.py && pytest test_detection_to_action_project.py",
    visualization: projectVisualization("vis_integration_detection_to_action", "Detection to Robot Action", "integration_object_detection_to_robot_action", "p_base=T_base_camera K^-1[u,v,1]d", "lab_integration_object_detection_to_robot_action", [
      { name: "confidence", symbol: "conf", min: 0, max: 1, default: 0.8, description: "detection confidence" },
      { name: "depth", symbol: "z", min: 0.1, max: 5, default: 1.2, description: "object depth" },
      { name: "tf_age_ms", symbol: "dt_tf", min: 0, max: 500, default: 30, description: "TF age" },
    ], "confidence가 충분하고 depth/TF가 정상이면 base_link target이 생성된다.", "TF가 stale이거나 depth가 없으면 action command를 만들지 않는다."),
    reportTemplate: "# Object Detection to Robot Action Report\n\n## Detection\n## Projection\n## TF Transform\n## Action Command\n## Latency and Failure Cases",
    successCriteria: ["bbox에서 3D point가 계산된다.", "base_link target이 계산된다.", "low confidence와 stale TF가 action을 막는다.", "latency report가 있다."],
    commonFailureCases: ["pixel 좌표를 base_link 좌표처럼 사용함", "depth missing을 0m object로 처리함", "TF 방향을 반대로 적용함", "confidence threshold 없이 오검출을 실행함"],
    extensionTask: "여러 object 중 가장 가까운 안전한 target만 선택하라.",
    connectedSessions: ["object_detection_iou_nms", "camera_projection", "ros2_tf2_transform", "safety_latency_jitter_profiling"],
    nextSessions: ["exam_ros2_practical", "exam_physical_ai_system_design"],
  },
  {
    projectId: "integration_behavior_cloning_mini_policy",
    title: "Behavior Cloning Mini Robot Policy Project",
    goal: "시연 데이터로 작은 로봇 정책을 학습하고 covariate shift를 분석한다.",
    requiredConcepts: ["behavior cloning", "dataset split", "MSE loss", "policy rollout", "covariate shift"],
    input: ["expert observations", "expert actions", "train/validation split", "rollout initial states"],
    output: ["trained policy", "validation loss", "rollout success rate", "failure examples"],
    stepByStepTasks: ["시연 데이터를 만든다.", "train/validation으로 나눈다.", "policy model을 정의한다.", "MSE loss로 학습한다.", "validation loss를 기록한다.", "policy rollout을 실행한다.", "success rate를 계산한다.", "시연 경로 밖 failure를 분석한다."],
    starterCode: `def train_policy(observations, actions):
    # TODO: expert action을 예측하는 policy를 학습한다.
    raise NotImplementedError

def rollout(policy, initial_state):
    # TODO: policy를 여러 step 실행하고 성공 여부를 반환한다.
    raise NotImplementedError`,
    solutionCode: `import numpy as np

def train_policy(observations, actions):
    X = np.column_stack([observations, np.ones(len(observations))])
    W, *_ = np.linalg.lstsq(X, actions, rcond=None)
    return W

def predict(policy, obs):
    return np.append(obs, 1.0) @ policy`,
    solutionGuide: "처음에는 선형 정책으로 expert action을 흉내 낸다. validation loss가 낮아도 rollout failure가 생기면 covariate shift 사례로 기록한다.",
    testMethod: "python behavior_cloning_project.py && pytest test_behavior_cloning_project.py",
    visualization: projectVisualization("vis_integration_behavior_cloning_policy", "Behavior Cloning Mini Policy", "integration_behavior_cloning_mini_policy", "loss=mean((pi(o)-a_expert)^2)", "lab_integration_behavior_cloning_mini_policy", [
      { name: "train_samples", symbol: "N_train", min: 10, max: 1000, default: 100, description: "학습 샘플 수" },
      { name: "noise", symbol: "sigma", min: 0, max: 1, default: 0.1, description: "시연 노이즈" },
      { name: "rollout_shift", symbol: "delta", min: 0, max: 2, default: 0.5, description: "초기 상태 shift" },
    ], "validation loss와 rollout error가 함께 낮으면 정책이 안정적이다.", "validation loss는 낮지만 rollout에서 경로를 벗어나면 covariate shift다."),
    reportTemplate: "# Behavior Cloning Mini Policy Report\n\n## Dataset\n## Training Loss\n## Validation Loss\n## Rollout Success\n## Covariate Shift Examples",
    successCriteria: ["train/validation loss가 계산된다.", "rollout success rate가 계산된다.", "실패 rollout 사례가 저장된다.", "covariate shift 원인을 설명한다."],
    commonFailureCases: ["validation loss만 보고 rollout을 생략함", "train/test split 없이 평가함", "action scale normalization을 빼먹음", "실패 초기 상태 데이터를 수집하지 않음"],
    extensionTask: "DAgger처럼 실패 상태에서 expert action을 추가 수집해 재학습하라.",
    connectedSessions: ["behavior_cloning_covariate_shift", "least_squares", "safety_actuator_limit_saturation"],
    nextSessions: ["integration_sim2real_failure_analysis", "exam_physical_ai_system_design"],
  },
  {
    projectId: "integration_sim2real_failure_analysis",
    title: "Sim2Real Failure Analysis Project",
    goal: "시뮬레이션에서 성공한 정책이 실제에서 실패하는 이유를 로그로 분해한다.",
    requiredConcepts: ["domain randomization", "latency profiling", "sensor noise", "action scale", "safety monitor"],
    input: ["simulation rollout logs", "real robot rollout logs", "latency samples", "sensor noise statistics", "action limits"],
    output: ["failure taxonomy", "sim-real metric gap", "latency report", "fix priority list"],
    stepByStepTasks: ["sim 로그와 real 로그를 같은 형식으로 맞춘다.", "success rate gap을 계산한다.", "observation distribution 차이를 계산한다.", "action scale 차이를 확인한다.", "latency와 jitter를 비교한다.", "sensor noise 통계를 비교한다.", "안전 정지 event를 분류한다.", "가장 먼저 고칠 원인 3개를 정한다."],
    starterCode: `def compare_success_rate(sim_success, real_success):
    # TODO: sim-real 성공률 gap을 계산한다.
    raise NotImplementedError

def classify_failure(row):
    # TODO: latency, sensor, action_limit, unknown 중 하나로 분류한다.
    raise NotImplementedError`,
    solutionCode: `def compare_success_rate(sim_success, real_success):
    return sum(sim_success) / len(sim_success) - sum(real_success) / len(real_success)

def classify_failure(row):
    if row.get("latency_ms", 0) > 100:
        return "latency"
    if row.get("sensor_stale", False):
        return "sensor"
    if row.get("action_saturated", False):
        return "action_limit"
    return "unknown"`,
    solutionGuide: "sim과 real 로그를 같은 column으로 맞춘 뒤 success, latency, observation, action limit을 하나씩 비교한다. 실패는 taxonomy로 분류하고 fix priority를 정한다.",
    testMethod: "python sim2real_failure_project.py && pytest test_sim2real_failure_project.py",
    visualization: projectVisualization("vis_integration_sim2real_failure", "Sim2Real Failure Analysis", "integration_sim2real_failure_analysis", "gap=success_rate_sim-success_rate_real", "lab_integration_sim2real_failure_analysis", [
      { name: "sim_success", symbol: "S_sim", min: 0, max: 1, default: 0.9, description: "simulation success rate" },
      { name: "real_success", symbol: "S_real", min: 0, max: 1, default: 0.55, description: "real success rate" },
      { name: "latency_ms", symbol: "L", min: 0, max: 300, default: 120, description: "real latency" },
    ], "sim-real gap 원인이 latency, sensor, action scale 중 하나로 분류된다.", "로그 schema가 다르거나 metric이 없으면 원인 분해가 불가능하다."),
    reportTemplate: "# Sim2Real Failure Analysis Report\n\n## Sim Metrics\n## Real Metrics\n## Gap\n## Failure Taxonomy\n## Fix Priority\n## Safety Decision",
    successCriteria: ["sim-real success gap이 계산된다.", "failure taxonomy가 3개 이상으로 분류된다.", "latency/sensor/action limit 지표가 있다.", "fix priority list가 작성된다."],
    commonFailureCases: ["sim과 real 로그 timestamp 기준이 다름", "성공률만 보고 latency를 보지 않음", "sensor noise 통계를 저장하지 않음", "action saturation을 정책 실패가 아닌 하드웨어 문제로만 봄"],
    extensionTask: "domain randomization 범위를 바꿔 sim-real gap이 줄어드는지 비교하라.",
    connectedSessions: ["sim2real_domain_randomization", "safety_latency_jitter_profiling", "safety_actuator_limit_saturation"],
    nextSessions: ["exam_physical_ai_system_design"],
  },
];

const labForProject = (project: IntegrationProject): CodeLab =>
  ensureCodeLabShape({
    id: `lab_${project.projectId}`,
    title: `${project.title} CodeLab`,
    language: "python",
    theoryConnection: project.visualization.connectedEquation,
    starterCode: project.starterCode,
    solutionCode: project.solutionCode,
    testCode: project.testMethod,
    expectedOutput: project.successCriteria.join("\n"),
    runCommand: project.testMethod.split("\n").find((line) => line.startsWith("python ")) ?? "python project.py",
    commonBugs: project.commonFailureCases,
    extensionTask: project.extensionTask,
  });

const quizzesForProject = (project: IntegrationProject): QuizQuestionV2[] => {
  const reviewSession = project.projectId;
  return [
    {
      id: `${project.projectId}_q01_concept`,
      type: "concept",
      difficulty: "easy",
      conceptTag: project.projectId,
      question: `${project.title}의 목표를 한 문장으로 설명하라.`,
      expectedAnswer: project.goal,
      explanation: `이 프로젝트는 ${project.requiredConcepts.join(", ")}를 하나의 실행 흐름으로 묶는다.`,
      wrongAnswerAnalysis: { commonWrongAnswer: "개별 함수 하나만 구현한다고 답함", whyWrong: "통합 프로젝트는 입력, 알고리즘, 출력, 실패 분석까지 이어진다.", errorType: "concept_confusion", reviewSession, retryQuestionType: "robot_scenario" },
    },
    {
      id: `${project.projectId}_q02_calculation`,
      type: "calculation",
      difficulty: "medium",
      conceptTag: project.projectId,
      question: `이 프로젝트의 핵심 출력 지표 1개와 계산 의미를 쓰라.`,
      expectedAnswer: `${project.output[0]}와 ${project.output[1]}를 계산하고 ${project.output[2] ?? "error metric"}로 결과를 비교한다.`,
      explanation: "통합 프로젝트는 그래프만 보는 것이 아니라 숫자 지표로 성공 여부를 판단한다.",
      wrongAnswerAnalysis: { commonWrongAnswer: "화면에 보이면 성공이라고 답함", whyWrong: "실제 로봇 프로젝트는 수치 metric과 실패 기준이 필요하다.", errorType: "calculation_error", reviewSession, retryQuestionType: "calculation" },
    },
    {
      id: `${project.projectId}_q03_code_completion`,
      type: "code_completion",
      difficulty: "medium",
      conceptTag: project.projectId,
      question: `starterCode에서 TODO를 구현할 때 가장 먼저 완성해야 하는 함수는?`,
      expectedAnswer: "입력을 받아 중간 상태를 만드는 첫 TODO 함수를 구현하고, 작은 테스트로 shape와 단위를 확인한다.",
      explanation: "큰 프로젝트도 첫 함수부터 작은 단위로 확인하면 실패 위치를 쉽게 찾는다.",
      wrongAnswerAnalysis: { commonWrongAnswer: "마지막 report부터 작성한다고 답함", whyWrong: "출력 보고서는 계산 결과가 있어야 작성할 수 있다.", errorType: "code_logic_error", reviewSession, retryQuestionType: "code_debug" },
    },
    {
      id: `${project.projectId}_q04_code_debug`,
      type: "code_debug",
      difficulty: "medium",
      conceptTag: project.projectId,
      question: `결과가 이상할 때 먼저 확인할 common failure case 하나를 쓰라.`,
      expectedAnswer: project.commonFailureCases[0],
      explanation: "이미 알려진 실패 사례부터 확인하면 디버깅 시간이 줄어든다.",
      wrongAnswerAnalysis: { commonWrongAnswer: "랜덤이라 어쩔 수 없다고 답함", whyWrong: "랜덤 노이즈도 seed, metric, 실패 taxonomy로 분석할 수 있다.", errorType: "code_logic_error", reviewSession, retryQuestionType: "code_completion" },
    },
    {
      id: `${project.projectId}_q05_visualization`,
      type: "visualization_interpretation",
      difficulty: "medium",
      conceptTag: project.projectId,
      question: `${project.visualization.title}에서 정상 상황은 무엇인가?`,
      expectedAnswer: project.visualization.normalCase,
      explanation: "시각화는 정상/실패 상황을 구분하는 실험판이다.",
      wrongAnswerAnalysis: { commonWrongAnswer: "그래프 색이 예쁘면 정상이라고 답함", whyWrong: "정상 여부는 색이 아니라 metric과 failureCase 비교로 판단한다.", errorType: "visualization_misread", reviewSession, retryQuestionType: "calculation" },
    },
    {
      id: `${project.projectId}_q06_robot_scenario`,
      type: "robot_scenario",
      difficulty: "hard",
      conceptTag: project.projectId,
      question: `실제 로봇에서 이 프로젝트를 돌릴 때 안전하게 멈춰야 하는 상황 하나를 쓰라.`,
      expectedAnswer: project.commonFailureCases[1] ?? project.visualization.failureCase,
      explanation: "실제 로봇은 알고리즘 결과가 이상하면 계속 실행하지 않고 정지/재계획해야 한다.",
      wrongAnswerAnalysis: { commonWrongAnswer: "오류가 있어도 계속 실행한다고 답함", whyWrong: "실제 로봇은 실패를 감지하면 안전 상태로 전환해야 한다.", errorType: "robot_application_error", reviewSession, retryQuestionType: "safety_analysis" },
    },
    {
      id: `${project.projectId}_q07_system_design`,
      type: "system_design",
      difficulty: "hard",
      conceptTag: project.projectId,
      question: `보고서에 반드시 들어가야 할 항목 3개를 쓰라.`,
      expectedAnswer: "입력 설정, 핵심 결과 metric, commonFailureCases 분석이 들어가야 한다.",
      explanation: "프로젝트 보고서는 재현성과 실패 분석을 남기는 문서다.",
      wrongAnswerAnalysis: { commonWrongAnswer: "성공 스크린샷 하나만 넣는다고 답함", whyWrong: "스크린샷만으로는 입력, metric, 실패 원인을 재현할 수 없다.", errorType: "system_design_error", reviewSession, retryQuestionType: "integration_pipeline" },
    },
  ];
};

const sessionForProject = (project: IntegrationProject): Session => {
  const lab = labForProject(project);
  return session({
    id: project.projectId,
    part,
    title: project.title,
    level: "advanced",
    prerequisites: project.connectedSessions,
    learningObjectives: [
      project.goal,
      `${project.input.join(", ")} 입력을 받아 ${project.output.join(", ")} 산출물을 만든다.`,
      "성공 기준과 실패 사례를 보고서로 설명한다.",
    ],
    theory: {
      definition: `${project.title}는 ${project.goal}`,
      whyItMatters: "개별 개념을 배워도 실제 로봇에서는 입력, 알고리즘, 안전 조건, 출력 보고서가 한 번에 이어져야 한다.",
      intuition: "레고 블록을 하나씩 배운 뒤 실제 자동차를 조립하는 단계다. 바퀴, 모터, 센서, 브레이크가 함께 맞아야 움직인다.",
      equations: [
        makeEquation("Project pipeline", "output = pipeline(input, parameters)", [["input", project.input.join(", ")], ["output", project.output.join(", ")], ["parameters", project.requiredConcepts.join(", ")]], "프로젝트는 입력을 여러 계산 단계에 통과시켜 산출물을 만든다."),
        makeEquation("Success metric", "success = criteria_passed / criteria_total", [["criteria_passed", "통과한 완료 기준 수"], ["criteria_total", String(project.successCriteria.length)]], "완료 기준을 숫자로 확인한다."),
      ],
      derivation: [
        step("입력 정의", project.input.join(", ")),
        step("단계 실행", project.stepByStepTasks.slice(0, 4).join(" -> ")),
        step("산출물 계산", project.output.join(", ")),
        step("실패 분석", project.commonFailureCases.join(" / ")),
      ],
      handCalculation: {
        problem: `${project.title} 완료 기준 ${project.successCriteria.length}개 중 3개를 만족하면 진행률은?`,
        given: { passed: 3, total: project.successCriteria.length },
        steps: [`진행률=3/${project.successCriteria.length}`, "남은 기준을 확인한다.", "실패 기준은 reportTemplate에 기록한다."],
        answer: `${Math.round((3 / project.successCriteria.length) * 100)}% 완료`,
      },
      robotApplication: project.solutionGuide,
    },
    codeLabs: [lab],
    visualizations: [project.visualization],
    quizzes: quizzesForProject(project),
    wrongAnswerTags: makeWrongTags(project.projectId, `${project.title} 통합 프로젝트 오답`, project.connectedSessions),
    nextSessions: project.nextSessions,
  });
};

export const integrationProjectSessions: Session[] = integrationProjects.map(sessionForProject);
