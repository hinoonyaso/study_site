import type { ErrorType, QuizQuestionTypeV2, QuizQuestionV2, Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

type ExtraQuizSpec = {
  id: string;
  type: QuizQuestionTypeV2;
  difficulty: QuizQuestionV2["difficulty"];
  question: string;
  expectedAnswer: string;
  explanation: string;
  errorType: ErrorType;
  retryQuestionType: QuizQuestionTypeV2;
  choices?: string[];
  codeSnippet?: string;
  counterexampleHint?: string;
  expectedFailureMode?: string;
};

const withExtraQuizzes = (base: Session, extras: ExtraQuizSpec[]): Session => ({
  ...base,
  quizzes: [
    ...base.quizzes,
    ...extras.map((extra) => ({
      id: `${base.id}_${extra.id}`,
      type: extra.type,
      difficulty: extra.difficulty,
      conceptTag: base.id,
      question: extra.question,
      expectedAnswer: extra.expectedAnswer,
      explanation: extra.explanation,
      choices: extra.choices,
      codeSnippet: extra.codeSnippet,
      counterexampleHint: extra.counterexampleHint,
      expectedFailureMode: extra.expectedFailureMode,
      wrongAnswerAnalysis: {
        commonWrongAnswer: "공식 이름만 말하고 실패 조건, 단위, 시간 예산, 안전 gate를 함께 설명하지 않음",
        whyWrong: "보고서의 보강 기준은 수식 암기가 아니라 실제 로봇에서 실패하는 조건까지 연결하는 것이다.",
        errorType: extra.errorType,
        reviewSession: base.title,
        retryQuestionType: extra.retryQuestionType,
        recommendedReview: [base.id],
        severity: extra.difficulty === "hard" || extra.type === "safety_analysis" ? ("high" as const) : ("medium" as const),
      },
    })),
  ],
});

const laplaceZLab = {
  id: "lab_laplace_z_bode_pid",
  title: "Laplace, Tustin z-map, and Bode Magnitude",
  language: "python" as const,
  theoryConnection: "s-domain poles -> Tustin z=(1+sT/2)/(1-sT/2), |G(jw)| dB for PID bandwidth reasoning",
  starterCode: `import cmath
import math

def second_order_poles(wn, zeta):
    # TODO: return complex conjugate poles for s^2 + 2*zeta*wn*s + wn^2
    raise NotImplementedError

def tustin_map(s, dt):
    # TODO: bilinear transform from s pole to z pole
    raise NotImplementedError

def bode_mag_db(wn, zeta, omega):
    # TODO: G(s)=wn^2/(s^2+2*zeta*wn*s+wn^2), evaluate at s=j*omega
    raise NotImplementedError

if __name__ == "__main__":
    poles = second_order_poles(5.0, 0.4)
    z_poles = [tustin_map(p, 0.02) for p in poles]
    print([complex(round(p.real, 3), round(p.imag, 3)) for p in poles])
    print([round(abs(z), 3) for z in z_poles])
    print(round(bode_mag_db(5.0, 0.4, 5.0), 2))`,
  solutionCode: `import cmath
import math

def second_order_poles(wn, zeta):
    real = -zeta * wn
    imag = wn * math.sqrt(max(0.0, 1.0 - zeta ** 2))
    return [complex(real, imag), complex(real, -imag)]

def tustin_map(s, dt):
    return (1.0 + s * dt / 2.0) / (1.0 - s * dt / 2.0)

def bode_mag_db(wn, zeta, omega):
    s = 1j * omega
    g = wn ** 2 / (s ** 2 + 2.0 * zeta * wn * s + wn ** 2)
    return 20.0 * math.log10(abs(g))

if __name__ == "__main__":
    poles = second_order_poles(5.0, 0.4)
    z_poles = [tustin_map(p, 0.02) for p in poles]
    print([complex(round(p.real, 3), round(p.imag, 3)) for p in poles])
    print([round(abs(z), 3) for z in z_poles])
    print(round(bode_mag_db(5.0, 0.4, 5.0), 2))`,
  testCode: `from laplace_z_bode_pid import second_order_poles, tustin_map, bode_mag_db

def test_stable_s_poles_map_inside_unit_circle():
    for pole in second_order_poles(5.0, 0.4):
        assert abs(tustin_map(pole, 0.02)) < 1.0

def test_resonance_magnitude_is_positive_for_light_damping:
    assert bode_mag_db(5.0, 0.2, 5.0) > 0.0`,
  expectedOutput: "[(-2+4.583j), (-2-4.583j)]\n[0.961, 0.961]\n1.94",
  runCommand: "python laplace_z_bode_pid.py && pytest test_laplace_z_bode_pid.py",
  commonBugs: [
    "s-plane pole 실수부가 음수인지 확인하지 않고 discrete pole 안정성을 판단함",
    "Tustin 변환에서 dt/2를 빼먹어 z pole 위치가 틀어짐",
    "Hz와 rad/s를 섞어 Bode magnitude를 다른 주파수에서 계산함",
  ],
  extensionTask: "PID gain을 바꾸며 open-loop Bode magnitude와 phase margin이 어떻게 변하는지 표로 기록하라.",
};

const newtonEulerLab = {
  id: "lab_cpp_newton_euler_planar_gravity",
  title: "C++ Recursive Newton-Euler Gravity Pass",
  language: "cpp" as const,
  theoryConnection: "outward joint/COM positions, inward distal-to-proximal gravity moment accumulation",
  starterCode: `#include <cmath>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <utility>
#include <vector>

struct Link {
  double length;
  double mass;
};

std::vector<double> GravityTorques(const std::vector<double>& q, const std::vector<Link>& links, double g = 9.81) {
  // TODO: outward pass joint/COM positions and inward gravity moment accumulation.
  throw std::runtime_error("implement recursive gravity torque");
}

int main() {
  std::vector<Link> links{{1.0, 1.2}, {0.7, 0.8}};
  auto tau = GravityTorques({0.0, 0.0}, links);
  std::cout << std::fixed << std::setprecision(3) << tau[0] << " " << tau[1] << "\\n";
}`,
  solutionCode: `#include <cmath>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <utility>
#include <vector>

struct Link {
  double length;
  double mass;
};

std::vector<double> GravityTorques(const std::vector<double>& q, const std::vector<Link>& links, double g = 9.81) {
  if (q.size() != links.size()) throw std::runtime_error("q/link size mismatch");
  const int n = static_cast<int>(q.size());
  std::vector<std::pair<double, double>> joint(n);
  std::vector<std::pair<double, double>> com(n);
  double x = 0.0;
  double y = 0.0;
  double angle = 0.0;
  for (int i = 0; i < n; ++i) {
    joint[i] = {x, y};
    angle += q[i];
    com[i] = {x + 0.5 * links[i].length * std::cos(angle), y + 0.5 * links[i].length * std::sin(angle)};
    x += links[i].length * std::cos(angle);
    y += links[i].length * std::sin(angle);
  }
  std::vector<double> tau(n, 0.0);
  for (int j = n - 1; j >= 0; --j) {
    for (int i = j; i < n; ++i) {
      const double moment_arm_x = com[i].first - joint[j].first;
      tau[j] += links[i].mass * g * moment_arm_x;
    }
  }
  return tau;
}

int main() {
  std::vector<Link> links{{1.0, 1.2}, {0.7, 0.8}};
  auto tau = GravityTorques({0.0, 0.0}, links);
  std::cout << std::fixed << std::setprecision(3) << tau[0] << " " << tau[1] << "\\n";
}`,
  testCode: `// Save as test_cpp_newton_euler_planar_gravity.cpp and compile with the solution above.
#include <cassert>
#include <cmath>
#include <vector>

int main() {
  std::vector<Link> links{{1.0, 1.2}, {0.7, 0.8}};
  auto horizontal = GravityTorques({0.0, 0.0}, links);
  assert(horizontal[0] > horizontal[1]);
  auto vertical = GravityTorques({1.57079632679, 0.0}, links);
  assert(std::abs(vertical[0]) < 1e-6);
}`,
  expectedOutput: "16.481 2.747",
  runCommand: "g++ -std=c++17 cpp_newton_euler_planar_gravity.cpp -o cpp_newton_euler_planar_gravity && ./cpp_newton_euler_planar_gravity",
  commonBugs: [
    "distal link 질량이 proximal joint torque에도 기여한다는 점을 빼먹음",
    "outward pass의 누적 joint angle 대신 각 link q만 사용함",
    "gravity compensation torque와 gravity force moment 부호를 구분하지 않음",
  ],
  extensionTask: "속도/가속도 항을 추가해 RNEA outward angular velocity pass와 inward wrench pass를 분리하라.",
};

const feedforwardLab = {
  id: "lab_feedforward_gravity_compensation",
  title: "Feedforward Gravity Compensation Gate",
  language: "python" as const,
  theoryConnection: "tau = tau_ff(q,qd,qdd_ref) + Kp(q_ref-q) + Kd(qd_ref-qd), then torque saturation",
  starterCode: `import numpy as np

def pd_plus_feedforward(q, qd, q_ref, qd_ref, gravity_tau, kp=20.0, kd=2.0, limit=30.0):
    # TODO: feedback + gravity feedforward + saturation
    raise NotImplementedError

if __name__ == "__main__":
    tau = pd_plus_feedforward(np.array([0.0, 0.0]), np.zeros(2), np.zeros(2), np.zeros(2), np.array([16.5, 2.7]))
    print(np.round(tau, 2))`,
  solutionCode: `import numpy as np

def pd_plus_feedforward(q, qd, q_ref, qd_ref, gravity_tau, kp=20.0, kd=2.0, limit=30.0):
    q = np.asarray(q, dtype=float)
    qd = np.asarray(qd, dtype=float)
    q_ref = np.asarray(q_ref, dtype=float)
    qd_ref = np.asarray(qd_ref, dtype=float)
    gravity_tau = np.asarray(gravity_tau, dtype=float)
    feedback = kp * (q_ref - q) + kd * (qd_ref - qd)
    raw = gravity_tau + feedback
    return np.clip(raw, -limit, limit)

if __name__ == "__main__":
    tau = pd_plus_feedforward(np.array([0.0, 0.0]), np.zeros(2), np.zeros(2), np.zeros(2), np.array([16.5, 2.7]))
    print(np.round(tau, 2))`,
  testCode: `import numpy as np
from feedforward_gravity_compensation import pd_plus_feedforward

def test_zero_error_returns_gravity_torque():
    tau = pd_plus_feedforward(np.zeros(2), np.zeros(2), np.zeros(2), np.zeros(2), np.array([4.0, 1.0]))
    assert np.allclose(tau, [4.0, 1.0])

def test_torque_saturation_clamps_command():
    tau = pd_plus_feedforward(np.zeros(1), np.zeros(1), np.array([10.0]), np.zeros(1), np.zeros(1), limit=3.0)
    assert np.allclose(tau, [3.0])`,
  expectedOutput: "[16.5  2.7]",
  runCommand: "python feedforward_gravity_compensation.py && pytest test_feedforward_gravity_compensation.py",
  commonBugs: [
    "gravity feedforward를 error가 있을 때만 더해 정지 자세 보상을 놓침",
    "q_ref-q 부호를 뒤집어 feedback이 오차를 키움",
    "torque saturation 뒤에 anti-windup/fault logging을 남기지 않음",
  ],
  extensionTask: "payload 질량 오차가 있을 때 feedforward under-compensation이 steady-state error로 남는지 sweep하라.",
};

const ukfLab = {
  id: "lab_ukf_sigma_point_pendulum",
  title: "UKF Sigma Point Propagation",
  language: "python" as const,
  theoryConnection: "sigma points through nonlinear f(x), weighted mean/covariance instead of EKF Jacobian",
  starterCode: `import numpy as np

def sigma_points_1d(mean, variance, alpha=1.0, kappa=2.0):
    # TODO: return sigma points and weights for 1D UKF
    raise NotImplementedError

def unscented_predict(mean, variance, fn):
    # TODO: propagate sigma points through nonlinear fn and recover mean/variance
    raise NotImplementedError

if __name__ == "__main__":
    m, v = unscented_predict(0.2, 0.04, lambda x: np.sin(x))
    print(round(m, 4), round(v, 4))`,
  solutionCode: `import numpy as np

def sigma_points_1d(mean, variance, alpha=1.0, kappa=2.0):
    n = 1
    lam = alpha ** 2 * (n + kappa) - n
    c = n + lam
    spread = np.sqrt(c * variance)
    points = np.array([mean, mean + spread, mean - spread], dtype=float)
    weights = np.array([lam / c, 1.0 / (2.0 * c), 1.0 / (2.0 * c)], dtype=float)
    return points, weights

def unscented_predict(mean, variance, fn):
    points, weights = sigma_points_1d(mean, variance)
    propagated = np.array([fn(p) for p in points], dtype=float)
    pred_mean = float(np.sum(weights * propagated))
    pred_var = float(np.sum(weights * (propagated - pred_mean) ** 2))
    return pred_mean, pred_var

if __name__ == "__main__":
    m, v = unscented_predict(0.2, 0.04, lambda x: np.sin(x))
    print(round(m, 4), round(v, 4))`,
  testCode: `import numpy as np
from ukf_sigma_point_pendulum import sigma_points_1d, unscented_predict

def test_sigma_weights_sum_to_one():
    _, w = sigma_points_1d(0.0, 1.0)
    assert abs(w.sum() - 1.0) < 1e-12

def test_linear_function_matches_mean_variance():
    m, v = unscented_predict(2.0, 0.25, lambda x: 3.0 * x)
    assert abs(m - 6.0) < 1e-12
    assert abs(v - 2.25) < 1e-12`,
  expectedOutput: "0.1947 0.0378",
  runCommand: "python ukf_sigma_point_pendulum.py && pytest test_ukf_sigma_point_pendulum.py",
  commonBugs: [
    "sigma point weight 합이 1인지 확인하지 않음",
    "비선형 함수를 mean에만 적용해 covariance 변화를 놓침",
    "UKF가 Jacobian 없이 동작한다는 점을 EKF와 혼동함",
  ],
  extensionTask: "pendulum angle/velocity 2D state로 확장하고 EKF 선형화 결과와 covariance를 비교하라.",
};

const cbfLab = {
  id: "lab_cbf_qp_safety_filter",
  title: "Control Barrier Function Safety Filter",
  language: "python" as const,
  theoryConnection: "min ||u-u_nom||^2 subject to grad_h(x)u + alpha h(x) >= 0",
  starterCode: `import numpy as np

def cbf_filter(position, obstacle, radius, u_nom, alpha=1.0):
    # TODO: h=||p-c||^2-r^2, minimally project u_nom onto CBF half-space
    raise NotImplementedError

if __name__ == "__main__":
    u = cbf_filter(np.array([1.2, 0.0]), np.zeros(2), 1.0, np.array([-1.0, 0.0]))
    print(np.round(u, 3))`,
  solutionCode: `import numpy as np

def cbf_filter(position, obstacle, radius, u_nom, alpha=1.0):
    p = np.asarray(position, dtype=float)
    c = np.asarray(obstacle, dtype=float)
    u = np.asarray(u_nom, dtype=float)
    diff = p - c
    h = float(diff @ diff - radius ** 2)
    grad = 2.0 * diff
    lhs = float(grad @ u + alpha * h)
    if lhs >= 0.0:
        return u
    denom = float(grad @ grad)
    if denom < 1e-12:
        return np.zeros_like(u)
    correction = ((-alpha * h - float(grad @ u)) / denom) * grad
    return u + correction

if __name__ == "__main__":
    u = cbf_filter(np.array([1.2, 0.0]), np.zeros(2), 1.0, np.array([-1.0, 0.0]))
    print(np.round(u, 3))`,
  testCode: `import numpy as np
from cbf_qp_safety_filter import cbf_filter

def test_nominal_safe_command_unchanged():
    u = cbf_filter(np.array([2.0, 0.0]), np.zeros(2), 1.0, np.array([1.0, 0.0]))
    assert np.allclose(u, [1.0, 0.0])

def test_unsafe_command_projected_to_barrier_boundary():
    p = np.array([1.2, 0.0])
    u = cbf_filter(p, np.zeros(2), 1.0, np.array([-1.0, 0.0]))
    h = p @ p - 1.0
    assert 2.0 * p @ u + h >= -1e-9`,
  expectedOutput: "[-0.183  0.   ]",
  runCommand: "python cbf_qp_safety_filter.py && pytest test_cbf_qp_safety_filter.py",
  commonBugs: [
    "h<0인 unsafe state에서 제약을 만족하는지 확인하지 않음",
    "grad_h 부호를 뒤집어 장애물 안으로 더 밀어 넣음",
    "QP solver success/failure flag 없이 nominal command를 그대로 통과시킴",
  ],
  extensionTask: "여러 장애물 CBF constraint를 쌓아 OSQP 입력 행렬 A,l,u 형태로 변환하라.",
};

const ppoSacLab = {
  id: "lab_ppo_sac_reward_shaping",
  title: "PPO Clip, SAC Entropy Target, Reward Shaping",
  language: "python" as const,
  theoryConnection: "PPO min(rA, clip(r)A), SAC target r + gamma(Q-alpha log pi), shaped reward diagnostics",
  starterCode: `import numpy as np

def ppo_clipped_objective(ratio, advantage, epsilon=0.2):
    # TODO: clipped PPO surrogate for scalar ratio/advantage
    raise NotImplementedError

def sac_target(reward, gamma, q_next, logp_next, alpha=0.2):
    # TODO: entropy-regularized target
    raise NotImplementedError

def shaped_reach_reward(distance, collision=False, goal=False):
    # TODO: dense reach reward with collision penalty and goal bonus
    raise NotImplementedError

if __name__ == "__main__":
    print(round(ppo_clipped_objective(1.5, 2.0), 3))
    print(round(sac_target(1.0, 0.99, 3.0, -0.5), 3))`,
  solutionCode: `import numpy as np

def ppo_clipped_objective(ratio, advantage, epsilon=0.2):
    clipped = np.clip(ratio, 1.0 - epsilon, 1.0 + epsilon)
    return float(min(ratio * advantage, clipped * advantage))

def sac_target(reward, gamma, q_next, logp_next, alpha=0.2):
    return float(reward + gamma * (q_next - alpha * logp_next))

def shaped_reach_reward(distance, collision=False, goal=False):
    reward = -float(distance)
    if goal:
        reward += 5.0
    if collision:
        reward -= 10.0
    return reward

if __name__ == "__main__":
    print(round(ppo_clipped_objective(1.5, 2.0), 3))
    print(round(sac_target(1.0, 0.99, 3.0, -0.5), 3))`,
  testCode: `from ppo_sac_reward_shaping import ppo_clipped_objective, sac_target, shaped_reach_reward

def test_ppo_positive_advantage_clips_large_ratio():
    assert abs(ppo_clipped_objective(1.5, 2.0) - 2.4) < 1e-12

def test_sac_entropy_term_increases_target_for_negative_logp():
    assert sac_target(1.0, 1.0, 3.0, -0.5, alpha=0.2) == 4.1

def test_collision_penalty_dominates_goal_bonus():
    assert shaped_reach_reward(0.1, collision=True, goal=True) < 0.0`,
  expectedOutput: "2.4\n4.069",
  runCommand: "python ppo_sac_reward_shaping.py && pytest test_ppo_sac_reward_shaping.py",
  commonBugs: [
    "PPO ratio clipping을 loss가 아니라 action 자체 clipping으로 오해함",
    "SAC entropy term의 -alpha log pi 부호를 뒤집음",
    "goal bonus가 collision penalty보다 커서 unsafe reward hacking을 허용함",
  ],
  extensionTask: "sparse reward와 shaped reward를 같은 toy reach task에서 비교하고 reward hacking 사례를 하나 만든다.",
};

const nav2BtLab = {
  id: "lab_nav2_bt_action_contract",
  title: "Nav2 Behavior Tree and ROS2 Action Contract",
  language: "python" as const,
  theoryConnection: "BT XML flow + NavigateToPose action goal/feedback/result contract",
  starterCode: `import xml.etree.ElementTree as ET

def extract_bt_nodes(xml_text):
    # TODO: return non-root behavior tree node tags in traversal order
    raise NotImplementedError

def action_contract(goal_pose, feedback_hz, result_status):
    # TODO: validate minimal NavigateToPose action contract
    raise NotImplementedError

if __name__ == "__main__":
    xml = "<root><Sequence><ComputePathToPose/><FollowPath/><RecoveryNode/></Sequence></root>"
    print(extract_bt_nodes(xml))
    print(action_contract({"frame_id": "map"}, 5.0, "SUCCEEDED"))`,
  solutionCode: `import xml.etree.ElementTree as ET

def extract_bt_nodes(xml_text):
    root = ET.fromstring(xml_text)
    return [node.tag for node in root.iter() if node is not root]

def action_contract(goal_pose, feedback_hz, result_status):
    has_frame = bool(goal_pose.get("frame_id"))
    feedback_ok = feedback_hz > 0.0
    result_ok = result_status in {"SUCCEEDED", "FAILED", "CANCELED"}
    return has_frame and feedback_ok and result_ok

if __name__ == "__main__":
    xml = "<root><Sequence><ComputePathToPose/><FollowPath/><RecoveryNode/></Sequence></root>"
    print(extract_bt_nodes(xml))
    print(action_contract({"frame_id": "map"}, 5.0, "SUCCEEDED"))`,
  testCode: `from nav2_bt_action_contract import extract_bt_nodes, action_contract

def test_extracts_nav2_nodes():
    nodes = extract_bt_nodes("<root><Sequence><ComputePathToPose/><FollowPath/></Sequence></root>")
    assert nodes == ["Sequence", "ComputePathToPose", "FollowPath"]

def test_action_contract_requires_frame_feedback_result():
    assert action_contract({"frame_id": "map"}, 5.0, "SUCCEEDED")
    assert not action_contract({}, 5.0, "SUCCEEDED")
    assert not action_contract({"frame_id": "map"}, 0.0, "SUCCEEDED")`,
  expectedOutput: "['Sequence', 'ComputePathToPose', 'FollowPath', 'RecoveryNode']\nTrue",
  runCommand: "python nav2_bt_action_contract.py && pytest test_nav2_bt_action_contract.py",
  commonBugs: [
    "BT XML 순서를 무시하고 recovery가 planner/controller 앞에 실행되는 구조를 만듦",
    "NavigateToPose goal frame_id를 비워 map frame 목표를 해석하지 못함",
    "action feedback/result timeout을 감시하지 않아 stuck 상태를 놓침",
  ],
  extensionTask: "ComputePathToPose 실패 시 ClearCostmap 후 재시도하고, 반복 실패 시 CANCELED를 반환하는 BT를 설계하라.",
};

const tensorRtLab = {
  id: "lab_tensorrt_onnx_quantization_contract",
  title: "TensorRT/ONNX Shape, Precision, and Latency Contract",
  language: "python" as const,
  theoryConnection: "CPU mock lab: ONNX export contract -> actual GPU TensorRT engine guide -> latency and accuracy gate. 이 lab은 TensorRT 실행이 아니라 CPU mock contract test이며, 실제 Jetson/NVIDIA GPU 배포는 engine build/calibration/benchmark 절차를 따라야 한다.",
  starterCode: `def validate_tensor_contract(shape, dtype, expected_shape=(1, 3, 640, 640), expected_dtype="float16"):
    # CPU mock: this checks only ONNX/Tensor contract, not real TensorRT GPU execution.
    # TODO: check shape and dtype contract
    raise NotImplementedError

def choose_precision(fp32_ms, fp16_ms, int8_ms, int8_accuracy_drop, max_drop=0.02):
    # TODO: choose int8 only if accuracy drop is acceptable, otherwise fp16 if faster than fp32
    raise NotImplementedError

if __name__ == "__main__":
    print(validate_tensor_contract((1,3,640,640), "float16"))
    print(choose_precision(42.0, 18.0, 11.0, 0.015))`,
  solutionCode: `def validate_tensor_contract(shape, dtype, expected_shape=(1, 3, 640, 640), expected_dtype="float16"):
    # CPU mock: actual TensorRT deployment still requires GPU engine build, calibration cache, and benchmark.
    return tuple(shape) == tuple(expected_shape) and str(dtype) == expected_dtype

def choose_precision(fp32_ms, fp16_ms, int8_ms, int8_accuracy_drop, max_drop=0.02):
    if int8_accuracy_drop <= max_drop and int8_ms <= fp16_ms:
        return "int8"
    if fp16_ms < fp32_ms:
        return "fp16"
    return "fp32"

if __name__ == "__main__":
    print(validate_tensor_contract((1,3,640,640), "float16"))
    print(choose_precision(42.0, 18.0, 11.0, 0.015))`,
  testCode: `from tensorrt_onnx_quantization_contract import validate_tensor_contract, choose_precision

def test_shape_contract_rejects_nhwc():
    assert validate_tensor_contract((1, 3, 640, 640), "float16")
    assert not validate_tensor_contract((1, 640, 640, 3), "float16")

def test_precision_gate_keeps_accuracy():
    assert choose_precision(40.0, 18.0, 10.0, 0.01) == "int8"
    assert choose_precision(40.0, 18.0, 10.0, 0.05) == "fp16"`,
  expectedOutput: "True\nint8",
  runCommand: "python tensorrt_onnx_quantization_contract.py && pytest test_tensorrt_onnx_quantization_contract.py",
  commonBugs: [
    "CPU mock contract test를 실제 TensorRT GPU inference 성공으로 착각함",
    "NHWC 이미지를 NCHW ONNX 모델에 그대로 넣음",
    "INT8 calibration accuracy drop을 확인하지 않고 latency만 보고 선택함",
    "Python preprocessing과 C++/TensorRT preprocessing normalize 계약을 다르게 둠",
  ],
  extensionTask: "실제 GPU 배포 가이드: nvidia-docker 또는 Jetson에서 trtexec/polygraphy로 engine build, calibration cache, warmup 제외 latency, class별 recall, ROS2 timestamp delay를 기록하라.",
};

const rtLoopLab = {
  id: "lab_cpp_realtime_control_loop_jitter",
  title: "C++ 1kHz Control Loop Jitter Profiler",
  language: "cpp" as const,
  theoryConnection: "period_i=t_i-t_{i-1}, jitter=abs(period-target), deadline miss when period>target+tolerance",
  starterCode: `#include <cmath>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <vector>

struct JitterStats {
  double max_jitter;
  int deadline_misses;
};

JitterStats ProfileLoop(const std::vector<double>& stamps, double target_period, double tolerance) {
  // TODO: compute max absolute jitter and deadline misses.
  throw std::runtime_error("implement ProfileLoop");
}

int main() {
  auto stats = ProfileLoop({0.000, 0.001, 0.0021, 0.0040}, 0.001, 0.0002);
  std::cout << std::fixed << std::setprecision(4) << stats.max_jitter << " " << stats.deadline_misses << "\\n";
}`,
  solutionCode: `#include <cmath>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <vector>

struct JitterStats {
  double max_jitter;
  int deadline_misses;
};

JitterStats ProfileLoop(const std::vector<double>& stamps, double target_period, double tolerance) {
  if (stamps.size() < 2) return {0.0, 0};
  double max_jitter = 0.0;
  int misses = 0;
  for (size_t i = 1; i < stamps.size(); ++i) {
    const double period = stamps[i] - stamps[i - 1];
    const double jitter = std::abs(period - target_period);
    max_jitter = std::max(max_jitter, jitter);
    if (period > target_period + tolerance) ++misses;
  }
  return {max_jitter, misses};
}

int main() {
  auto stats = ProfileLoop({0.000, 0.001, 0.0021, 0.0040}, 0.001, 0.0002);
  std::cout << std::fixed << std::setprecision(4) << stats.max_jitter << " " << stats.deadline_misses << "\\n";
}`,
  testCode: `// Save as test_cpp_realtime_control_loop_jitter.cpp and compile with the solution above.
#include <cassert>
#include <cmath>
#include <vector>

int main() {
  auto ok = ProfileLoop({0.0, 0.001, 0.002, 0.003}, 0.001, 0.0002);
  assert(ok.deadline_misses == 0);
  auto bad = ProfileLoop({0.0, 0.001, 0.003}, 0.001, 0.0002);
  assert(bad.deadline_misses == 1);
  assert(std::abs(bad.max_jitter - 0.001) < 1e-12);
}`,
  expectedOutput: "0.0009 1",
  runCommand: "g++ -std=c++17 cpp_realtime_control_loop_jitter.cpp -o cpp_realtime_control_loop_jitter && ./cpp_realtime_control_loop_jitter",
  commonBugs: [
    "평균 period만 보고 tail deadline miss를 놓침",
    "milliseconds와 seconds 단위를 섞어 1kHz target_period를 1.0으로 둠",
    "제어 루프 안에서 메모리 할당, logging, blocking I/O를 수행함",
  ],
  extensionTask: "clock_nanosleep 기반 absolute-time loop와 sleep_for relative loop의 max jitter를 비교하라.",
};

const vlmLab = {
  id: "lab_vlm_embedding_grounding_bridge",
  title: "VLM Embedding Grounding Bridge to VLA",
  language: "python" as const,
  theoryConnection: "normalize image/text embeddings, cosine retrieval, confidence gate before action head",
  starterCode: `import numpy as np

def normalize_rows(x):
    # TODO: row-wise L2 normalization
    raise NotImplementedError

def cosine_scores(image_embeddings, text_embedding):
    # TODO: normalized cosine similarity scores
    raise NotImplementedError

def grounding_gate(scores, threshold=0.6):
    # TODO: return best index or -1 if confidence too low
    raise NotImplementedError

if __name__ == "__main__":
    image = np.array([[1.0, 0.0], [0.0, 1.0]])
    text = np.array([0.8, 0.2])
    scores = cosine_scores(image, text)
    print(np.round(scores, 3))
    print(grounding_gate(scores, 0.6))`,
  solutionCode: `import numpy as np

def normalize_rows(x):
    x = np.asarray(x, dtype=float)
    norm = np.linalg.norm(x, axis=-1, keepdims=True)
    return x / np.maximum(norm, 1e-12)

def cosine_scores(image_embeddings, text_embedding):
    image_z = normalize_rows(image_embeddings)
    text_z = normalize_rows(np.asarray(text_embedding, dtype=float).reshape(1, -1))[0]
    return image_z @ text_z

def grounding_gate(scores, threshold=0.6):
    scores = np.asarray(scores, dtype=float)
    idx = int(np.argmax(scores))
    return idx if scores[idx] >= threshold else -1

if __name__ == "__main__":
    image = np.array([[1.0, 0.0], [0.0, 1.0]])
    text = np.array([0.8, 0.2])
    scores = cosine_scores(image, text)
    print(np.round(scores, 3))
    print(grounding_gate(scores, 0.6))`,
  testCode: `import numpy as np
from vlm_embedding_grounding_bridge import cosine_scores, grounding_gate, normalize_rows

def test_normalize_rows_unit_norm():
    z = normalize_rows(np.array([[3.0, 4.0]]))
    assert abs(np.linalg.norm(z[0]) - 1.0) < 1e-12

def test_grounding_gate_rejects_low_confidence():
    assert grounding_gate(np.array([0.2, 0.3]), threshold=0.6) == -1
    assert grounding_gate(np.array([0.7, 0.3]), threshold=0.6) == 0`,
  expectedOutput: "[0.97  0.243]\n0",
  runCommand: "python vlm_embedding_grounding_bridge.py && pytest test_vlm_embedding_grounding_bridge.py",
  commonBugs: [
    "embedding normalization 없이 dot product 크기만 보고 grounding을 판단함",
    "confidence가 낮은데도 VLA action head로 보내 안전 gate를 우회함",
    "image crop 좌표를 robot frame grasp target으로 바로 오해함",
  ],
  extensionTask: "CLIP-style top-k grounding 결과를 VLA action candidate와 연결하고 low confidence에서는 human confirmation으로 분기하라.",
};

const criticalQuizDetails: Record<string, {
  conceptAnswer: string;
  calculationAnswer: string;
  debugAnswer: string;
  visualAnswer: string;
  robotAnswer: string;
  designAnswer: string;
}> = {
  laplace_z: {
    conceptAnswer: "Laplace/z-domain PID의 핵심은 연속시간 pole, sampling time, Tustin 변환 뒤 discrete pole 위치를 함께 보며 gain margin과 phase lag를 설명하는 것이다.",
    calculationAnswer: "z=(1+sT/2)/(1-sT/2)를 적용한 뒤 |z|<1인지 확인해야 한다. T가 커지면 같은 s pole도 unit circle에 가까워져 디지털 PID가 진동할 수 있다.",
    debugAnswer: "Hz/rad/s 혼동, sampling period 단위, derivative filtering, actuator delay, phase margin 로그를 먼저 확인한다.",
    visualAnswer: "damping이 작거나 sample time이 커질 때 z pole이 unit circle 경계로 이동하고 Bode peak가 커지는지 본다.",
    robotAnswer: "1kHz 제어 주기와 actuator delay를 포함한 closed-loop margin을 확인하고, gain 변경은 low-speed replay와 stop fallback을 거친다.",
    designAnswer: "s-plane pole 손계산, Tustin z-map 단위테스트, Bode margin sweep, discrete PID simulation, jitter 포함 hardware-in-loop 순서로 검증한다.",
  },
  newton_euler: {
    conceptAnswer: "Newton-Euler의 핵심은 base에서 말단으로 운동량을 전파하고 말단에서 base로 wrench를 누적해 tau를 O(n)에 계산하는 outward/inward recursion이다.",
    calculationAnswer: "tau_j=sum_{i>=j} r_{j,i} x F_i이므로 distal payload는 proximal joint torque에도 누적된다. actuator limit과 payload 모델을 같이 확인해야 한다.",
    debugAnswer: "누적 joint angle, COM 위치, distal force 누락, gravity 방향, joint axis projection, URDF inertial frame을 먼저 확인한다.",
    visualAnswer: "payload나 link count를 키울 때 distal force가 base torque로 누적되고 torque limit warning이 먼저 어느 joint에서 뜨는지 본다.",
    robotAnswer: "RNEA torque가 continuous/peak limit을 넘으면 trajectory를 늘리거나 payload 모델을 수정하고 slow/fault mode로 전환한다.",
    designAnswer: "2-link 손계산, C++ unit test, URDF inertial replay, Pinocchio/KDL 비교, 1kHz loop timing 측정, low-speed gravity compensation 순서로 검증한다.",
  },
  feedforward: {
    conceptAnswer: "Feedforward gravity compensation은 오차가 0이어도 필요한 모델 토크 g(q)를 미리 더하고 feedback은 모델 오차와 외란만 보정하게 만드는 구조다.",
    calculationAnswer: "q=q_ref이면 feedback은 0이지만 tau_cmd=g(q)여야 한다. payload가 바뀌면 gravity_tau와 saturation 여부를 다시 계산해야 한다.",
    debugAnswer: "gravity sign, payload mass, joint order, torque unit, saturation count, PD gain이 feedforward 누락을 억지로 보상하는지 확인한다.",
    visualAnswer: "payload가 증가할 때 feedforward 항과 feedback 항이 분리되어 보이고, torque_limit을 넘으면 saturation 표시가 떠야 한다.",
    robotAnswer: "명령 전 torque clamp, stale model fallback, payload mismatch 감지, current/thermal limit 로그를 safety gate로 둔다.",
    designAnswer: "정지 자세 손계산, gravity table unit test, payload sweep simulation, torque saturation replay, low-speed hold test 순서로 검증한다.",
  },
  ukf: {
    conceptAnswer: "UKF의 핵심은 평균과 공분산을 보존하는 2n+1 sigma point를 비선형 함수에 직접 통과시켜 Jacobian 없이 belief를 복원하는 것이다.",
    calculationAnswer: "1D이면 sigma point는 mean, mean+spread, mean-spread 세 개이며 weight 합과 angle wrapping을 확인해야 공분산이 과소평가되지 않는다.",
    debugAnswer: "lambda/weight 부호, Cholesky spread, angle normalization, process/measurement noise 단위, covariance positive definiteness를 먼저 확인한다.",
    visualAnswer: "variance가 커질 때 sigma point가 비선형 함수 뒤 비대칭으로 퍼지고 복원 mean/covariance가 EKF 선형화와 달라지는지 본다.",
    robotAnswer: "GPS/IMU yaw나 range-bearing 관측에서 innovation gate와 covariance floor를 두고 EKF/UKF 로그를 replay로 비교한다.",
    designAnswer: "1D sigma point 손계산, nonlinear pendulum unit test, angle wrap edge case, logged bag replay, covariance consistency check 순서로 검증한다.",
  },
  nav2_bt: {
    conceptAnswer: "Nav2 BT/Action의 핵심은 planner, controller, recovery가 Behavior Tree status로 흐르고 장시간 task는 goal-feedback-result action contract로 관리된다는 점이다.",
    calculationAnswer: "feedback timeout, recovery budget, result status를 함께 확인해야 한다. goal이 도착해도 stale feedback이면 action server는 성공으로 처리하면 안 된다.",
    debugAnswer: "BT XML node 이름, plugin registration, blackboard key, action feedback 주기, result code, costmap frame/timestamp를 먼저 확인한다.",
    visualAnswer: "recovery_count가 늘거나 feedback timeout이 발생할 때 BT가 fallback/recovery branch로 전환되는지 본다.",
    robotAnswer: "navigation goal 실행 전 costmap freshness, transform availability, action timeout, recovery budget, cancel path를 safety gate로 둔다.",
    designAnswer: "BT XML static check, action contract unit test, fake feedback timeout, Gazebo recovery scenario, real robot low-speed route 순서로 검증한다.",
  },
  tensorrt: {
    conceptAnswer: "TensorRT/ONNX 배포의 핵심은 latency만 줄이는 것이 아니라 input shape/dtype 계약, calibration set, safety-critical recall drop을 함께 고정하는 것이다.",
    calculationAnswer: "INT8이 deadline 안이어도 accuracy drop이 허용치, 특히 사람/장애물 recall 기준을 넘으면 FP16 fallback을 선택해야 한다.",
    debugAnswer: "NCHW/NHWC, normalization, dynamic shape, dtype mismatch, calibration coverage, warmup 제외 latency, ROS2 timestamp를 먼저 확인한다.",
    visualAnswer: "precision을 낮출수록 latency는 줄지만 accuracy drop이나 safety class recall 손실이 budget을 넘는 지점을 본다.",
    robotAnswer: "perception deadline, stale image timeout, confidence threshold, FP16 fallback, watchdog을 ROS2 image pipeline에 둔다.",
    designAnswer: "ONNX export contract, ORT parity test, TensorRT engine build, calibration audit, latency/accuracy Pareto, rosbag replay 순서로 검증한다.",
  },
  rt_loop: {
    conceptAnswer: "C++ RT loop의 핵심은 평균 주기가 아니라 p99/worst-case jitter와 deadline miss를 제어 안전 budget 안에 유지하는 것이다.",
    calculationAnswer: "target 1ms에서 period 1.9ms이면 jitter 0.9ms이고 tolerance 0.2ms를 넘으므로 deadline miss다. 평균이 좋아도 tail miss가 위험하다.",
    debugAnswer: "dynamic allocation, blocking logging, mutex wait, service call, page fault, clock source, scheduler priority를 먼저 확인한다.",
    visualAnswer: "histogram의 꼬리가 deadline threshold를 넘는지, p99와 max jitter가 평균보다 얼마나 큰지 본다.",
    robotAnswer: "miss count가 budget을 넘으면 command hold/stop/fault로 전환하고 controller update 내부에서 blocking 작업을 제거한다.",
    designAnswer: "steady clock unit test, synthetic sleep jitter, histogram logger, ros2_control update profiling, load stress, low-speed hardware test 순서로 검증한다.",
  },
  cbf: {
    conceptAnswer: "CBF-QP의 핵심은 안전 집합 h(x)>=0을 유지하는 입력 부등식을 만들고 nominal action을 최소 수정해 actuator 직전에서 통과시키는 것이다.",
    calculationAnswer: "grad_h u + alpha h가 음수이면 h가 안전 경계 쪽으로 너무 빨리 감소하므로 u를 half-space 경계로 projection해야 한다.",
    debugAnswer: "h 부호 정의, grad_h 방향, alpha 단위, solver infeasible flag, actuator clamp 순서, frame 변환을 먼저 확인한다.",
    visualAnswer: "nominal command가 장애물 방향일 때 QP projection이 safety set 경계 접선 방향 또는 감속으로 바뀌는지 본다.",
    robotAnswer: "QP infeasible, stale obstacle, solver timeout이면 nominal command를 보내지 않고 stop/hold/fallback controller로 전환한다.",
    designAnswer: "2D single-integrator 손계산, projection unit test, obstacle sweep, solver failure injection, VLA action clamp, low-speed field test 순서로 검증한다.",
  },
  ppo_sac: {
    conceptAnswer: "PPO/SAC reward shaping의 핵심은 policy update 제한, entropy exploration, reward와 safety metric 분리를 함께 설계해 reward hacking을 막는 것이다.",
    calculationAnswer: "ratio=1.5, A=2, eps=0.2이면 clipped ratio 1.2라 objective는 min(3.0,2.4)=2.4다. 큰 update는 제한된다.",
    debugAnswer: "advantage normalization, clip fraction, entropy temperature, reward scale, collision penalty, action limit, seed별 variance를 먼저 확인한다.",
    visualAnswer: "return이 오르면서 collision rate도 오르면 shaping 실패이며, success curve와 safety curve를 분리해서 본다.",
    robotAnswer: "실제 로봇 전에는 action clamp, CBF safety filter, domain randomization, latency replay, low-speed eval gate를 둔다.",
    designAnswer: "reward/safety metric 분리, PPO/SAC seed sweep, failure episode replay, domain randomization, CBF clamp, sim-to-real low-speed test 순서로 검증한다.",
  },
  vlm_bridge: {
    conceptAnswer: "VLM-to-VLA의 핵심은 visual/text embedding 또는 cross-attention grounding confidence를 확인한 뒤에만 action head나 planner로 넘기는 것이다.",
    calculationAnswer: "cos(v,t)가 threshold보다 낮으면 argmax가 있어도 action을 실행하지 않는다. ambiguous grounding은 stop/escalate가 정답이다.",
    debugAnswer: "embedding normalization, crop/object association, prompt token, threshold, camera-to-robot frame, action scale을 먼저 확인한다.",
    visualAnswer: "text embedding과 후보 object embedding 거리가 가까운지, threshold 근처 ambiguous 후보가 여러 개인지 본다.",
    robotAnswer: "low confidence, multiple candidate, stale image, frame mismatch이면 VLA action을 막고 human confirmation 또는 재관측으로 분기한다.",
    designAnswer: "embedding unit test, grounding threshold sweep, ambiguous scene replay, action scaling check, CBF gate, human-confirm fallback 순서로 검증한다.",
  },
};

const quizSeed = (id: string, topic: string, formula: string, code: string) => {
  const detail = criticalQuizDetails[id];
  if (!detail) throw new Error(`Missing critical quiz details for ${id}`);
  return {
    id,
    conceptQuestion: `${topic}에서 보고서가 지적한 핵심 공백은 무엇인가?`,
    conceptAnswer: detail.conceptAnswer,
    calculationQuestion: `${formula}를 적용할 때 안정/안전 조건을 함께 확인해야 하는 이유는?`,
    calculationAnswer: detail.calculationAnswer,
    codeQuestion: `${topic} 코드랩의 핵심 구현 한 줄은?`,
    codeAnswer: code,
    debugQuestion: `${topic}이 시뮬레이션에서는 맞지만 실제 시스템에서 실패하면 무엇을 먼저 보는가?`,
    debugAnswer: detail.debugAnswer,
    visualQuestion: `${topic} 시각화에서 실패 상황은 어떤 신호로 드러나는가?`,
    visualAnswer: detail.visualAnswer,
    robotQuestion: `${topic}을 실제 로봇에 배포할 때 첫 safety gate는?`,
    robotAnswer: detail.robotAnswer,
    designQuestion: `${topic}을 A+ 수준 프로젝트에 넣는 검증 순서는?`,
    designAnswer: detail.designAnswer,
  };
};

export const criticalMathSessions: Session[] = [
  withExtraQuizzes(
    makeAdvancedSession({
      id: "laplace_z_bode_pid_design",
      part: "Part 1. Physical AI를 위한 기초수학",
      title: "Laplace/z-domain과 Bode 기반 PID 설계",
      prerequisites: ["ode_euler_rk4", "pid_control_v2", "signal_processing_fft_filter"],
      objectives: ["s-domain pole과 안정성을 연결한다.", "Tustin 변환으로 discrete pole 위치를 계산한다.", "Bode magnitude로 bandwidth와 gain 조정을 해석한다."],
      definition: "Laplace/z-domain 분석은 연속시간 제어계를 pole/zero와 주파수 응답으로 보고, 디지털 제어기에서 같은 동작이 discrete pole로 어떻게 바뀌는지 확인하는 방법이다.",
      whyItMatters: "PID를 공식으로만 튜닝하면 gain margin, phase margin, sampling period 영향을 설명할 수 없다.",
      intuition: "시간 그래프만 보는 대신 시스템의 떨림 성향과 감쇠를 pole 위치와 주파수 응답 지도 위에서 보는 것이다.",
      equations: [
        { label: "Second-order poles", expression: "s=-\\zeta\\omega_n\\pm j\\omega_n\\sqrt{1-\\zeta^2}", terms: [["ζ", "damping ratio"], ["ωn", "natural frequency"]], explanation: "실수부가 음수이면 연속시간 응답이 감쇠한다." },
        { label: "Tustin transform", expression: "z=\\frac{1+sT/2}{1-sT/2}", terms: [["T", "sampling period"]], explanation: "stable s-plane pole을 unit circle 안 z pole로 보낸다." },
        { label: "Bode magnitude", expression: "|G(j\\omega)|_{dB}=20\\log_{10}|G(j\\omega)|", terms: [["ω", "angular frequency"]], explanation: "주파수별 증폭/감쇠를 dB로 읽는다." },
      ],
      derivation: [["특성방정식", "2차 표준형 denominator를 s에 대해 푼다."], ["안정성", "실수부가 음수이면 e^{st}가 감쇠한다."], ["이산화", "Tustin map으로 s pole을 z plane에 옮긴다."], ["주파수", "s=jω를 대입해 주파수 응답을 계산한다."]],
      handCalculation: { problem: "s=-2+4j, T=0.02일 때 z pole 크기가 1보다 작으면?", given: { s: "-2+4j", T: 0.02 }, steps: ["z=(1+sT/2)/(1-sT/2)를 계산한다.", "안정한 s pole이면 Tustin 후 |z|<1이다."], answer: "discrete pole도 안정 영역(unit circle 안)에 있다." },
      robotApplication: "1kHz joint PID에서 sampling period가 커지면 phase lag가 증가해 안정 margin이 줄어든다. Bode와 z-pole로 gain 조정 근거를 만든다.",
      lab: laplaceZLab,
      visualization: { id: "vis_laplace_z_bode_pid", title: "Pole-zero and Bode PID Slider", equation: "z=(1+sT/2)/(1-sT/2)", parameters: [{ name: "zeta", symbol: "\\zeta", min: 0.1, max: 1.5, default: 0.4, description: "damping ratio" }, { name: "sample_time_ms", symbol: "T", min: 1, max: 50, default: 20, description: "sampling period ms" }], normalCase: "poles are left-half-plane and mapped inside unit circle.", failureCase: "sample time이 커지면 discrete pole이 unit circle에 가까워져 진동 위험이 커진다." },
      quiz: quizSeed("laplace_z", "Laplace/z-domain PID", "z=(1+sT/2)/(1-sT/2)", "return (1 + s*dt/2) / (1 - s*dt/2)"),
      wrongTagLabel: "Laplace/z-domain PID 안정성 해석 오류",
      nextSessions: ["pid_control_v2", "cpp_realtime_control_loop_jitter"],
    }),
    [
      {
        id: "q08_derivation",
        type: "derivation",
        difficulty: "hard",
        question: "왜 stable s-plane pole은 Tustin 변환 뒤 unit circle 안으로 가는지 설명하라.",
        expectedAnswer: "Re(s)<0이면 bilinear transform z=(1+sT/2)/(1-sT/2)의 분자 크기가 분모보다 작아져 |z|<1이 된다.",
        explanation: "연속시간 안정성 기준과 이산시간 안정성 기준을 연결하는 핵심 유도다.",
        errorType: "formula_misunderstanding",
        retryQuestionType: "calculation",
      },
      {
        id: "q09_counterexample",
        type: "counterexample",
        difficulty: "hard",
        question: "`PID gain은 step response만 보고 조정해도 충분하다`는 주장에 대한 반례를 들어라.",
        expectedAnswer: "sampling period가 커져 phase lag가 증가한 경우 시간 영역의 한 조건에서는 좋아 보여도 gain/phase margin이 작아져 다른 주파수 외란에서 진동할 수 있다.",
        explanation: "주파수 응답과 시간 영역 검증은 서로 보완 관계다.",
        errorType: "safety_misjudgment",
        retryQuestionType: "visualization_interpretation",
        counterexampleHint: "제어 주기가 느려지고 actuator delay가 있는 상황을 생각한다.",
        expectedFailureMode: "phase margin 감소, oscillation, deadline miss와 결합된 불안정",
      },
    ],
  ),
];

export const criticalRobotDynamicsSessions: Session[] = [
  withExtraQuizzes(
    makeAdvancedSession({
      id: "robot_dynamics_newton_euler_recursive",
      part: "Part 3. 로봇 동역학과 제어",
      title: "Newton-Euler Recursive Dynamics와 실시간 토크 계산",
      prerequisites: ["robot_dynamics_2link_lagrange", "cpp_eigen_ik_2link"],
      objectives: ["outward/inward recursion 구조를 설명한다.", "distal link 힘이 proximal torque에 누적되는 이유를 계산한다.", "Lagrange와 RNEA의 실시간성 차이를 이해한다."],
      definition: "Recursive Newton-Euler Algorithm은 link별 속도/가속도/힘을 outward와 inward pass로 전파해 joint torque를 O(n)에 계산하는 동역학 알고리즘이다.",
      whyItMatters: "실제 로봇팔 제어 주기에서는 URDF 기반 토크 계산이 빠르고 결정적으로 끝나야 하므로 RNEA, KDL, Pinocchio 감각이 필요하다.",
      intuition: "base에서 말단까지 운동 상태를 전파하고, 말단에서 base로 힘과 모멘트를 되돌려 각 관절이 부담하는 토크를 누적한다.",
      equations: [
        { label: "Manipulator torque", expression: "\\tau=M(q)\\ddot q+C(q,\\dot q)\\dot q+g(q)", terms: [["τ", "joint torque"]], explanation: "RNEA는 이 식의 값을 재귀적으로 빠르게 계산한다." },
        { label: "Moment", expression: "\\tau_j=\\sum_{i\\ge j}(r_{j,i}\\times F_i)_z", terms: [["r", "joint to COM vector"], ["F", "link gravity/inertial force"]], explanation: "distal link force가 proximal joint torque에 누적된다." },
        { label: "Complexity", expression: "T_{RNEA}=O(n)", terms: [["n", "link count"]], explanation: "link 수에 선형으로 계산 시간이 늘어난다." },
      ],
      derivation: [["outward pass", "joint pose, velocity, acceleration, COM 위치를 base에서 말단으로 계산한다."], ["link force", "각 link의 gravity/inertia force를 구한다."], ["inward pass", "말단에서 base 방향으로 force/moment를 누적한다."], ["joint projection", "각 joint axis에 moment를 투영해 torque를 얻는다."]],
      handCalculation: { problem: "수평 2-link에서 joint1 torque가 joint2보다 큰 이유는?", given: { link1: "proximal", link2: "distal" }, steps: ["joint2는 link2 일부만 지탱한다.", "joint1은 link1과 link2 전체 moment arm을 지탱한다."], answer: "tau1 > tau2" },
      robotApplication: "ros2_control hardware loop에서 매 tick마다 gravity/feedforward torque를 계산할 때 Pinocchio/KDL의 RNEA 함수를 쓰는 이유가 여기에 있다.",
      lab: newtonEulerLab,
      visualization: { id: "vis_newton_euler_recursion", title: "Newton-Euler Outward/Inward Pass", equation: "tau_j=sum r x F", parameters: [{ name: "link_count", symbol: "n", min: 1, max: 7, default: 2, description: "number of links" }, { name: "payload", symbol: "m_p", min: 0, max: 5, default: 0, description: "end-effector payload kg" }], normalCase: "distal force가 proximal torque로 누적되고 torque limit 안에 있다.", failureCase: "payload가 커지면 base joint torque가 limit을 넘는다." },
      quiz: quizSeed("newton_euler", "Newton-Euler Recursive Dynamics", "tau=sum r x F", "tau[j] += links[i].mass * g * moment_arm_x"),
      wrongTagLabel: "Newton-Euler recursion/torque 누적 오류",
      nextSessions: ["robot_dynamics_feedforward_gravity_compensation", "cpp_realtime_control_loop_jitter"],
    }),
    [
      {
        id: "q08_safety",
        type: "safety_analysis",
        difficulty: "hard",
        question: "RNEA torque가 actuator continuous torque limit을 30% 넘으면 controller는 어떻게 해야 하는가?",
        expectedAnswer: "명령을 제한하고 trajectory duration/payload/model을 재검토하며 fault 또는 slow mode로 전환해야 한다.",
        explanation: "토크 계산은 feedforward 성능뿐 아니라 하드웨어 보호 판단에 쓰인다.",
        errorType: "safety_misjudgment",
        retryQuestionType: "robot_scenario",
      },
    ],
  ),
  withExtraQuizzes(
    makeAdvancedSession({
      id: "robot_dynamics_feedforward_gravity_compensation",
      part: "Part 3. 로봇 동역학과 제어",
      title: "Feedforward Control과 Gravity Compensation",
      prerequisites: ["robot_dynamics_newton_euler_recursive", "pid_control_v2"],
      objectives: ["feedback과 feedforward 역할을 구분한다.", "zero error에서도 gravity torque가 필요한 이유를 설명한다.", "torque saturation을 안전 gate로 연결한다."],
      definition: "Feedforward control은 목표 궤적과 모델에서 예상되는 토크를 미리 더하고, feedback은 남은 오차를 보정하는 제어 구조다.",
      whyItMatters: "로봇팔이 수평으로 물체를 들고 있을 때 오차가 0이어도 중력을 버틸 토크가 필요하다.",
      intuition: "feedback이 넘어지고 나서 바로잡는 균형 감각이라면 feedforward는 들 물체의 무게를 미리 알고 힘을 주는 준비 동작이다.",
      equations: [
        { label: "PD plus feedforward", expression: "\\tau=\\tau_{ff}+K_p(q_d-q)+K_d(\\dot q_d-\\dot q)", terms: [["τff", "model torque"]], explanation: "모델 기반 토크와 오차 보정을 더한다." },
        { label: "Gravity compensation", expression: "\\tau_{ff}=g(q)", terms: [["g(q)", "gravity torque"]], explanation: "정지 자세에서 중력을 상쇄한다." },
        { label: "Torque saturation", expression: "\\tau_{cmd}=clip(\\tau,\\tau_{min},\\tau_{max})", terms: [["clip", "limit gate"]], explanation: "actuator limit을 넘지 않게 한다." },
      ],
      derivation: [["목표 동역학", "원하는 q, qdot, qddot에서 필요한 모델 토크를 계산한다."], ["오차 보정", "모델 오차와 외란은 PD feedback으로 줄인다."], ["제한", "최종 torque는 actuator limit과 thermal limit을 통과해야 한다."], ["로그", "saturation count는 모델/trajectory 문제의 신호로 남긴다."]],
      handCalculation: { problem: "q=q_ref, qdot=0, gravity_tau=[4,1]이면 PD+feedforward torque는?", given: { error: 0, gravity: "[4,1]" }, steps: ["feedback=0", "tau=gravity_tau+0"], answer: "[4,1]" },
      robotApplication: "MoveIt trajectory 실행 중 gravity feedforward를 넣으면 같은 PID gain에서도 tracking error와 steady motor current가 줄어든다.",
      lab: feedforwardLab,
      visualization: { id: "vis_feedforward_gravity_compensation", title: "Feedforward + Feedback Torque Split", equation: "tau=tau_ff+Kp e+Kd edot", parameters: [{ name: "payload", symbol: "m_p", min: 0, max: 5, default: 1, description: "payload mass kg" }, { name: "torque_limit", symbol: "\\tau_{max}", min: 2, max: 50, default: 30, description: "torque limit Nm" }], normalCase: "gravity term이 정지 오차를 줄이고 torque limit 안에 있다.", failureCase: "payload 모델이 틀리면 under/over compensation과 saturation이 발생한다." },
      quiz: quizSeed("feedforward", "Feedforward gravity compensation", "tau=tau_ff+Kp e+Kd edot", "raw = gravity_tau + feedback"),
      wrongTagLabel: "Feedforward/gravity compensation 오류",
      nextSessions: ["impedance_control_1d_contact", "cbf_qp_safety_filter"],
    }),
    [
      {
        id: "q08_counterexample",
        type: "counterexample",
        difficulty: "hard",
        question: "`오차가 0이면 제어 입력도 0이어야 한다`는 주장에 대한 로봇팔 반례를 들어라.",
        expectedAnswer: "수평 자세에서 물체를 들고 정지한 로봇팔은 q=q_ref여도 중력을 버티는 gravity compensation torque가 필요하다.",
        explanation: "정상상태 오차가 0인 것과 필요한 actuator torque가 0인 것은 다르다.",
        errorType: "concept_confusion",
        retryQuestionType: "robot_scenario",
        counterexampleHint: "수평으로 팔을 뻗고 payload를 든 정지 자세를 생각한다.",
        expectedFailureMode: "gravity sag, steady-state error, motor current increase",
      },
    ],
  ),
];

export const criticalDrivingSessions: Session[] = [
  withExtraQuizzes(
    makeAdvancedSession({
      id: "ukf_sigma_point_localization",
      part: "Part 4. 자율주행과 SLAM",
      title: "UKF Sigma Point Localization",
      prerequisites: ["kalman_filter_1d", "ekf_observation_jacobian"],
      objectives: ["sigma point와 weight를 계산한다.", "비선형 함수를 통과한 평균/공분산을 복원한다.", "EKF Jacobian 선형화와 UKF 차이를 비교한다."],
      definition: "Unscented Kalman Filter는 평균과 공분산을 대표하는 sigma point들을 비선형 모델에 통과시켜 Gaussian belief를 갱신하는 필터다.",
      whyItMatters: "강한 비선형 관측이나 angle wrapping이 있는 localization에서 EKF Jacobian이 부정확하면 UKF가 더 안정적인 선택이 될 수 있다.",
      intuition: "분포 전체를 한 점에서 미분하지 않고, 분포 주변의 대표 점들을 직접 움직여 평균과 퍼짐이 어떻게 변하는지 보는 방식이다.",
      equations: [
        { label: "Sigma spread", expression: "X_0=\\mu,\\;X_{i}=\\mu\\pm\\sqrt{(n+\\lambda)P}", terms: [["P", "covariance"]], explanation: "평균 주변에 대표 점을 둔다." },
        { label: "Unscented mean", expression: "\\bar y=\\sum_i W_i f(X_i)", terms: [["W_i", "sigma point weight"]], explanation: "비선형 함수 통과 후 가중평균을 구한다." },
        { label: "Unscented covariance", expression: "P_y=\\sum_i W_i(y_i-\\bar y)(y_i-\\bar y)^T", terms: [["P_y", "predicted covariance"]], explanation: "퍼짐도 sigma point로 재구성한다." },
      ],
      derivation: [["sigma point", "mean/covariance를 보존하도록 대표 점과 weight를 만든다."], ["propagation", "각 점을 nonlinear motion/measurement model에 통과시킨다."], ["recover", "가중 평균과 공분산을 다시 계산한다."], ["update", "Kalman update 구조로 measurement를 반영한다."]],
      handCalculation: { problem: "1D UKF는 sigma point가 몇 개인가?", given: { n: 1 }, steps: ["일반적으로 2n+1개", "2*1+1=3"], answer: "3개" },
      robotApplication: "robot_localization의 UKF 구성이나 비선형 yaw/range 관측 localization에서 EKF와 UKF 로그를 비교할 때 sigma point 해석이 필요하다.",
      lab: ukfLab,
      visualization: { id: "vis_ukf_sigma_points", title: "UKF Sigma Point Propagation", equation: "Y_i=f(X_i)", parameters: [{ name: "variance", symbol: "P", min: 0.001, max: 1, default: 0.04, description: "state variance" }, { name: "nonlinearity", symbol: "\\beta", min: 0, max: 2, default: 1, description: "nonlinear function strength" }], normalCase: "sigma point가 비선형 함수를 통과해 mean/covariance를 안정적으로 복원한다.", failureCase: "variance가 너무 크면 Gaussian 근사가 약해진다." },
      quiz: quizSeed("ukf", "UKF sigma point localization", "2n+1", "points = np.array([mean, mean + spread, mean - spread])"),
      wrongTagLabel: "UKF sigma point/weight 오류",
      nextSessions: ["sensor_fusion_gps_imu", "imu_preintegration_bias_drift"],
    }),
    [
      {
        id: "q08_derivation",
        type: "derivation",
        difficulty: "hard",
        question: "UKF가 EKF처럼 Jacobian을 직접 쓰지 않는 이유를 sigma point 관점에서 설명하라.",
        expectedAnswer: "UKF는 평균 주변 sigma point를 실제 비선형 함수에 통과시켜 평균/공분산을 복원하므로 한 점의 Jacobian 선형화가 필요 없다.",
        explanation: "이 차이가 비선형성이 큰 시스템에서 UKF를 쓰는 핵심 이유다.",
        errorType: "formula_misunderstanding",
        retryQuestionType: "concept",
      },
    ],
  ),
  withExtraQuizzes(
    makeAdvancedSession({
      id: "nav2_behavior_tree_action_server",
      part: "Part 4. 자율주행과 SLAM",
      title: "Nav2 Behavior Tree와 ROS2 Action Server 연결",
      prerequisites: ["dwa_obstacle_avoidance", "ros2_package_build_ament_cmake", "safety_watchdog_timer"],
      objectives: ["Nav2 BT XML 흐름을 읽는다.", "NavigateToPose action의 goal/feedback/result 계약을 설명한다.", "planner/controller/recovery 실패 분기를 설계한다."],
      definition: "Nav2 Behavior Tree는 navigation task를 planner, controller, recovery, condition node의 실행 트리로 구성하고 ROS2 action은 장기 작업의 goal/feedback/result 계약을 제공한다.",
      whyItMatters: "실제 자율주행 스택 수정은 planner 수식만으로 끝나지 않고 BT, costmap, action timeout, recovery policy를 함께 다룬다.",
      intuition: "목표로 가는 일을 길 찾기, 따라가기, 막히면 회복하기, 실패하면 취소하기 같은 행동 노드들의 업무 흐름으로 만든 것이다.",
      equations: [
        { label: "BT tick", expression: "status\\in\\{RUNNING,SUCCESS,FAILURE\\}", terms: [["status", "node return"]], explanation: "각 노드는 tick마다 상태를 반환한다." },
        { label: "Action contract", expression: "goal\\rightarrow feedback^*\\rightarrow result", terms: [["goal", "target pose"], ["feedback", "progress"], ["result", "final status"]], explanation: "장기 navigation 작업의 통신 계약이다." },
        { label: "Recovery budget", expression: "N_{recovery}\\le N_{max}", terms: [["N", "retry count"]], explanation: "무한 recovery loop를 막는다." },
      ],
      derivation: [["goal", "NavigateToPose goal pose와 frame_id를 받는다."], ["plan", "ComputePathToPose가 costmap과 planner를 사용한다."], ["control", "FollowPath가 controller server로 cmd_vel을 만든다."], ["recover", "실패 시 clear costmap, spin, wait 등을 제한 횟수 안에서 실행한다."]],
      handCalculation: { problem: "BT node가 세 번 recovery 후에도 FAILURE이면 action result는?", given: { max_recovery: 3, status: "FAILURE" }, steps: ["retry budget 소진", "goal을 계속 RUNNING으로 둘 수 없음"], answer: "FAILED 또는 CANCELED result를 반환한다." },
      robotApplication: "Nav2에서 로봇이 같은 자리에서 recovery를 반복하면 BT XML, costmap clearing 조건, action timeout, controller feedback을 같이 확인해야 한다.",
      lab: nav2BtLab,
      visualization: { id: "vis_nav2_bt_action_flow", title: "Nav2 BT Action Flow", equation: "goal -> plan -> follow -> recover -> result", parameters: [{ name: "recovery_count", symbol: "N_r", min: 0, max: 10, default: 1, description: "recovery attempts" }, { name: "feedback_hz", symbol: "f_b", min: 0, max: 20, default: 5, description: "action feedback frequency" }], normalCase: "planner와 controller가 SUCCESS를 반환하고 action result가 SUCCEEDED가 된다.", failureCase: "feedback이 끊기거나 recovery budget이 넘으면 FAILED/CANCELED로 끝난다." },
      quiz: quizSeed("nav2_bt", "Nav2 Behavior Tree/Action", "goal->feedback->result", "return has_frame and feedback_ok and result_ok"),
      wrongTagLabel: "Nav2 BT/action 계약 오류",
      nextSessions: ["cpp_realtime_control_loop_jitter", "integration_nav2_stack_project"],
    }),
    [
      {
        id: "q08_pipeline",
        type: "integration_pipeline",
        difficulty: "hard",
        question: "Nav2 NavigateToPose가 목표에 못 가는 로그를 받았을 때 planner, controller, BT, costmap 순서로 진단 pipeline을 쓰라.",
        expectedAnswer: "goal frame과 TF를 확인하고, global path 생성 여부, local controller feedback, costmap obstacle/inflation, BT recovery/timeout 순서로 분리해 본다.",
        explanation: "Nav2 실패는 한 노드 문제가 아니라 서버와 BT 계약이 연결된 시스템 문제다.",
        errorType: "system_design_error",
        retryQuestionType: "system_design",
      },
    ],
  ),
];

export const criticalVisionDeploymentSessions: Session[] = [
  withExtraQuizzes(
    makeAdvancedSession({
      id: "tensorrt_onnx_quantization_pipeline",
      part: "Part 5. 인식 AI와 로봇 비전",
      title: "TensorRT/ONNX Quantization과 Edge 추론 최적화",
      prerequisites: ["ai_foundations_onnx_runtime_deploy", "object_detection_iou_nms"],
      objectives: ["ONNX input/output shape 계약을 검증한다.", "FP16/INT8 precision 선택 기준을 설명한다.", "latency와 accuracy drop을 함께 보고 배포 결정을 내린다."],
      definition: "TensorRT 최적화는 ONNX 등으로 export한 모델을 GPU/Jetson inference engine으로 변환하고 precision, calibration, memory layout을 맞춰 latency를 줄이는 배포 단계다.",
      whyItMatters: "로봇 edge 컴퓨터에서 perception이 늦으면 제어 루프가 오래된 장면을 보고 움직이므로 30fps/10ms 같은 시간 예산이 안전과 직결된다.",
      intuition: "학습 모델을 현장용 엔진으로 다시 포장하되, 입력 모양과 숫자 정밀도가 바뀌어도 같은 의미의 결과를 내는지 확인하는 과정이다.",
      equations: [
        { label: "Latency budget", expression: "T_{perception}+T_{planning}+T_{control}<T_{deadline}", terms: [["T", "pipeline latency"]], explanation: "전체 지연이 deadline 안에 있어야 한다." },
        { label: "INT8 gate", expression: "\\Delta metric \\le \\epsilon_{acc}", terms: [["Δ metric", "accuracy drop"]], explanation: "속도 향상이 정확도 손실 기준을 넘으면 배포하지 않는다." },
        { label: "Shape contract", expression: "input=(N,C,H,W), dtype\\in\\{FP16,INT8\\}", terms: [["NCHW", "tensor layout"]], explanation: "전처리와 engine 입력 계약을 고정한다." },
      ],
      derivation: [["export", "PyTorch 모델을 고정 input shape/dtype으로 ONNX export한다."], ["validate", "ONNX Runtime과 원본 모델 출력을 같은 입력에서 비교한다."], ["build", "TensorRT FP16/INT8 engine을 만들고 calibration set을 기록한다."], ["benchmark", "latency, throughput, memory, accuracy drop을 측정한다."]],
      handCalculation: { problem: "fp32=42ms, fp16=18ms, int8=11ms, int8 accuracy drop=1.5%이고 허용 drop=2%이면?", given: { fp16: "18ms", int8: "11ms", drop: "0.015" }, steps: ["drop 0.015 <= 0.02", "int8이 가장 빠름"], answer: "int8 선택 가능" },
      robotApplication: "Jetson에서 YOLO/segmentation을 ROS2 image pipeline에 넣기 전 NCHW/NHWC, normalization, precision, latency를 모두 로그로 고정한다.",
      lab: tensorRtLab,
      visualization: { id: "vis_tensorrt_latency_pareto", title: "TensorRT Latency/Accuracy Pareto", equation: "latency deadline and accuracy drop gate", parameters: [{ name: "int8_drop_percent", symbol: "\\Delta acc", min: 0, max: 10, default: 1.5, description: "INT8 accuracy drop percent" }, { name: "deadline_ms", symbol: "T_d", min: 5, max: 100, default: 33, description: "perception deadline ms" }], normalCase: "latency가 deadline 안이고 accuracy drop이 허용 범위 안이다.", failureCase: "INT8은 빠르지만 calibration drop이 크면 FP16으로 되돌린다." },
      quiz: quizSeed("tensorrt", "TensorRT/ONNX deployment", "T_total<T_deadline", "return tuple(shape) == tuple(expected_shape) and str(dtype) == expected_dtype"),
      wrongTagLabel: "TensorRT/ONNX 추론 계약 오류",
      nextSessions: ["ros2_image_inference_node", "cpp_realtime_control_loop_jitter"],
    }),
    [
      {
        id: "q08_safety",
        type: "safety_analysis",
        difficulty: "hard",
        question: "INT8 모델이 FP16보다 8ms 빠르지만 사람 class recall이 6% 떨어지면 바로 배포해도 되는가?",
        expectedAnswer: "안전 class recall drop이 허용 기준을 넘으면 배포하면 안 되며 calibration set, threshold, FP16 fallback을 재검토해야 한다.",
        explanation: "로봇 perception 최적화는 latency만의 문제가 아니라 safety-critical metric 보존 문제다.",
        errorType: "safety_misjudgment",
        retryQuestionType: "system_design",
      },
    ],
  ),
];

export const criticalRos2Sessions: Session[] = [
  withExtraQuizzes(
    makeAdvancedSession({
      id: "cpp_realtime_control_loop_jitter",
      part: "Part C++. C++ 로봇SW 기초",
      title: "C++ 1kHz Real-time Control Loop와 Jitter 측정",
      prerequisites: ["ros2_control_pid_hardware_loop", "safety_latency_jitter_profiling"],
      objectives: ["1kHz target period를 seconds 단위로 계산한다.", "max jitter와 deadline miss를 평균 latency와 구분한다.", "RT loop에서 피해야 할 blocking 작업을 설명한다."],
      definition: "실시간 제어 루프는 정해진 period 안에 sensor read, control compute, actuator write를 반복하고 jitter/deadline miss를 안전 지표로 기록하는 실행 구조다.",
      whyItMatters: "로봇 소프트웨어는 계산이 맞아도 늦으면 실패한다. 1kHz 관절 제어에서는 1ms 주기를 넘는 tail latency가 tracking과 안전에 영향을 준다.",
      intuition: "매번 1ms 박자에 맞춰 움직여야 하는 메트로놈이며, 가끔 크게 늦는 한 번이 평균보다 더 위험할 수 있다.",
      equations: [
        { label: "Period", expression: "T_i=t_i-t_{i-1}", terms: [["t_i", "loop timestamp"]], explanation: "연속 loop tick 사이 실제 주기다." },
        { label: "Jitter", expression: "J_i=|T_i-T_{target}|", terms: [["J_i", "period deviation"]], explanation: "목표 주기에서 얼마나 흔들렸는지 본다." },
        { label: "Deadline miss", expression: "miss_i = T_i>T_{target}+\\epsilon", terms: [["ε", "allowed tolerance"]], explanation: "허용 범위를 넘으면 miss로 기록한다." },
      ],
      derivation: [["timestamp", "각 tick 시작/끝 시간을 monotonic clock으로 기록한다."], ["period", "이전 tick과 현재 tick 차이를 계산한다."], ["jitter", "target period와의 절댓값 차이를 구한다."], ["gate", "deadline miss가 누적되면 slow/stop/fault 상태로 전환한다."]],
      handCalculation: { problem: "target=0.001s, 실제 period=0.0019s, tolerance=0.0002s이면?", given: { target: 0.001, period: 0.0019 }, steps: ["jitter=0.0009s", "0.0019 > 0.0012"], answer: "deadline miss 1회" },
      robotApplication: "ros2_control controller update에서 logging, dynamic allocation, blocking service call을 loop 밖으로 빼고 jitter histogram을 남긴다.",
      lab: rtLoopLab,
      visualization: { id: "vis_cpp_realtime_jitter_histogram", title: "1kHz Control Loop Jitter Histogram", equation: "jitter=abs(period-target)", parameters: [{ name: "target_hz", symbol: "f", min: 100, max: 2000, default: 1000, description: "target control frequency" }, { name: "max_jitter_us", symbol: "J_{max}", min: 0, max: 2000, default: 900, description: "max jitter microseconds" }], normalCase: "max jitter와 miss count가 safety budget 안에 있다.", failureCase: "tail latency가 커져 deadline miss가 누적되면 controller를 stop/fault로 전환한다." },
      quiz: quizSeed("rt_loop", "C++ real-time control loop", "J=abs(T-Ttarget)", "max_jitter = std::max(max_jitter, jitter)"),
      wrongTagLabel: "실시간 제어 루프/jitter 판단 오류",
      nextSessions: ["cbf_qp_safety_filter", "nav2_behavior_tree_action_server"],
    }),
    [
      {
        id: "q08_counterexample",
        type: "counterexample",
        difficulty: "hard",
        question: "`평균 loop period가 1ms면 실시간 제어는 안전하다`는 주장에 대한 반례를 들어라.",
        expectedAnswer: "대부분 0.5ms이고 가끔 5ms로 튀어 평균은 1ms에 가까워도 tail deadline miss가 actuator command를 늦춰 불안정해질 수 있다.",
        explanation: "실시간성은 평균보다 worst-case와 tail latency가 중요하다.",
        errorType: "safety_misjudgment",
        retryQuestionType: "safety_analysis",
        counterexampleHint: "평균은 같지만 p99가 큰 loop 로그를 생각한다.",
        expectedFailureMode: "deadline miss, stale command, oscillation",
      },
    ],
  ),
];

export const criticalSafetySessions: Session[] = [
  withExtraQuizzes(
    makeAdvancedSession({
      id: "cbf_qp_safety_filter",
      part: "Part 8. 실시간성, 안전성, 시스템 통합",
      title: "Control Barrier Function과 QP Safety Filter",
      prerequisites: ["convex_optimization_qp_basics", "robot_dynamics_feedforward_gravity_compensation"],
      objectives: ["CBF h(x)>=0 safety set을 정의한다.", "nominal command를 최소 수정하는 QP 구조를 설명한다.", "constraint 위반 시 safe command로 projection한다."],
      definition: "Control Barrier Function은 안전 집합 h(x)>=0을 유지하도록 제어 입력에 부등식 제약을 걸고, QP safety filter는 nominal command를 가능한 적게 바꿔 그 제약을 만족시킨다.",
      whyItMatters: "Physical AI policy나 MPC가 좋은 명령을 내도 사람/장애물/관절 한계를 침범하면 safety filter가 마지막 방어선이 되어야 한다.",
      intuition: "정책이 가고 싶은 방향을 존중하되, 안전 울타리를 넘으려는 순간 가장 작은 수정으로 울타리 안쪽으로 방향을 돌리는 장치다.",
      equations: [
        { label: "Safety set", expression: "\\mathcal C=\\{x|h(x)\\ge0\\}", terms: [["h", "barrier function"]], explanation: "h가 0 이상이면 안전 집합 안이다." },
        { label: "CBF constraint", expression: "\\nabla h(x)u+\\alpha h(x)\\ge0", terms: [["u", "control input"], ["α", "barrier gain"]], explanation: "다음 순간에도 h가 줄어드는 속도를 제한한다." },
        { label: "Safety QP", expression: "\\min_u\\|u-u_{nom}\\|^2\\;s.t.\\;A_{cbf}u\\ge b_{cbf}", terms: [["u_nom", "nominal command"]], explanation: "명령을 최소 수정해 안전 제약을 만족한다." },
      ],
      derivation: [["barrier", "장애물 밖이면 양수인 h를 설계한다."], ["미분", "single integrator에서 hdot=grad h dot u를 구한다."], ["constraint", "hdot+alpha h>=0을 입력 부등식으로 만든다."], ["projection", "nominal u가 위반하면 half-space 경계로 최소 이동한다."]],
      handCalculation: { problem: "p=[1.2,0], obstacle radius=1, u_nom=[-1,0]이면 왜 위험한가?", given: { h: "1.2^2-1=0.44" }, steps: ["u_nom은 obstacle 중심 쪽", "grad h dot u가 음수로 크다.", "h가 빠르게 감소한다."], answer: "CBF filter가 속도를 줄이거나 방향을 바꿔야 한다." },
      robotApplication: "VLA/RL action을 base controller나 arm servo에 넣기 전 CBF-QP로 obstacle distance, workspace, joint limit을 마지막으로 확인한다.",
      lab: cbfLab,
      visualization: { id: "vis_cbf_safety_set", title: "CBF Safety Set and QP Projection", equation: "grad_h u + alpha h >= 0", parameters: [{ name: "obstacle_radius", symbol: "r", min: 0.2, max: 2, default: 1, description: "obstacle safety radius" }, { name: "alpha", symbol: "\\alpha", min: 0.1, max: 5, default: 1, description: "CBF gain" }], normalCase: "nominal command가 safety set 밖으로 h를 줄이지 않는다.", failureCase: "장애물 방향 command는 QP projection으로 감속 또는 우회된다." },
      quiz: quizSeed("cbf", "CBF-QP safety filter", "grad_h u + alpha h >= 0", "correction = ((-alpha*h - grad@u) / (grad@grad)) * grad"),
      wrongTagLabel: "CBF/QP safety filter 오류",
      nextSessions: ["cpp_realtime_control_loop_jitter", "integration_project_safety_pipeline"],
    }),
    [
      {
        id: "q08_safety",
        type: "safety_analysis",
        difficulty: "hard",
        question: "CBF-QP solver가 infeasible을 반환했는데 nominal command를 그대로 보내도 되는가?",
        expectedAnswer: "안 된다. infeasible이면 stop/hold/fallback controller로 전환하고 fault log를 남겨야 한다.",
        explanation: "solver 실패를 무시하면 safety layer가 사라진다.",
        errorType: "safety_misjudgment",
        retryQuestionType: "robot_scenario",
      },
      {
        id: "q09_pipeline",
        type: "integration_pipeline",
        difficulty: "hard",
        question: "VLA action에서 actuator command까지 CBF safety filter가 들어가는 위치를 pipeline으로 쓰라.",
        expectedAnswer: "VLA/RL raw action, action scale/TF 변환, limit clamp, CBF-QP safety filter, controller command, watchdog/fault logger 순서로 둔다.",
        explanation: "CBF는 모델 앞이 아니라 actuator 직전 safety gate 중 하나로 배치해야 한다.",
        errorType: "system_design_error",
        retryQuestionType: "system_design",
      },
    ],
  ),
];

export const criticalPhysicalAISessions: Session[] = [
  withExtraQuizzes(
    makeAdvancedSession({
      id: "rl_ppo_sac_reward_shaping",
      part: "Part 7. Physical AI / Embodied AI",
      title: "PPO/SAC와 Reward Shaping: 로봇 RL 실전 기초",
      prerequisites: ["rl_q_learning_policy_gradient_basics", "sim2real_domain_randomization"],
      objectives: ["PPO clipped surrogate를 계산한다.", "SAC entropy term과 exploration 의미를 설명한다.", "reward shaping이 unsafe behavior를 만들 수 있음을 분석한다."],
      definition: "PPO는 policy update 비율을 clip해 급격한 정책 변화를 막고, SAC는 entropy-regularized objective로 exploration을 유지하는 deep RL 알고리즘이다.",
      whyItMatters: "로봇 RL 프로젝트는 Q-learning 개념만으로 부족하고 PPO/SAC, reward shaping, safety constraint를 함께 알아야 sim-to-real 학습을 설계할 수 있다.",
      intuition: "PPO는 한 번에 너무 크게 배우지 못하게 안전벨트를 걸고, SAC는 다양한 행동을 시도할 여지를 보상에 포함한다.",
      equations: [
        { label: "PPO clip", expression: "L^{CLIP}=E[\\min(r_tA_t,clip(r_t,1-\\epsilon,1+\\epsilon)A_t)]", terms: [["r_t", "probability ratio"], ["A_t", "advantage"]], explanation: "policy update가 너무 커지는 것을 제한한다." },
        { label: "SAC target", expression: "y=r+\\gamma(Q(s',a')-\\alpha\\log\\pi(a'|s'))", terms: [["α", "entropy temperature"]], explanation: "Q target에 entropy 보너스를 포함한다." },
        { label: "Shaped reward", expression: "r=-d+R_{goal}-P_{collision}", terms: [["d", "distance"]], explanation: "dense reward와 안전 penalty 균형이 중요하다." },
      ],
      derivation: [["ratio", "new policy와 old policy의 action probability ratio를 계산한다."], ["advantage", "그 action이 평균보다 좋았는지 추정한다."], ["clip", "ratio가 허용 범위를 넘으면 objective 기여를 제한한다."], ["safety reward", "goal bonus보다 collision penalty가 커야 reward hacking을 줄인다."]],
      handCalculation: { problem: "ratio=1.5, advantage=2, epsilon=0.2이면 PPO clipped objective는?", given: { ratio: 1.5, A: 2, eps: 0.2 }, steps: ["clip ratio=1.2", "min(1.5*2,1.2*2)=2.4"], answer: "2.4" },
      robotApplication: "로봇팔 reach/grasp를 PPO로 학습할 때 action limit, collision penalty, curriculum, simulator reset 조건을 함께 설계해야 한다.",
      lab: ppoSacLab,
      visualization: { id: "vis_ppo_sac_reward_curve", title: "PPO/SAC Reward and Safety Curve", equation: "min(rA,clip(r)A)", parameters: [{ name: "clip_epsilon", symbol: "\\epsilon", min: 0.05, max: 0.4, default: 0.2, description: "PPO clip range" }, { name: "collision_penalty", symbol: "P_c", min: 0, max: 20, default: 10, description: "collision penalty magnitude" }], normalCase: "reward가 증가하면서 collision rate가 낮게 유지된다.", failureCase: "goal bonus가 penalty보다 크면 unsafe reward hacking이 생긴다." },
      quiz: quizSeed("ppo_sac", "PPO/SAC reward shaping", "Lclip=min(rA,clip(r)A)", "return float(min(ratio * advantage, clipped * advantage))"),
      wrongTagLabel: "PPO/SAC/reward shaping 오류",
      nextSessions: ["cbf_qp_safety_filter", "world_model_dreamer_overview"],
    }),
    [
      {
        id: "q08_counterexample",
        type: "counterexample",
        difficulty: "hard",
        question: "`reward가 계속 올라가면 로봇 정책은 안전해진다`는 주장에 대한 반례를 들어라.",
        expectedAnswer: "goal bonus가 collision penalty보다 크면 로봇이 부딪히며 빠르게 목표에 가는 정책으로 reward를 올릴 수 있다.",
        explanation: "reward curve와 safety metric은 반드시 분리해서 봐야 한다.",
        errorType: "safety_misjudgment",
        retryQuestionType: "safety_analysis",
        counterexampleHint: "goal reward +5, collision penalty -1 같은 shaping을 생각한다.",
        expectedFailureMode: "reward hacking, collision 증가, unsafe shortcut",
      },
      {
        id: "q09_pipeline",
        type: "integration_pipeline",
        difficulty: "hard",
        question: "PPO로 로봇팔 reach를 학습해 실제 로봇에 올리기 전 pipeline을 쓰라.",
        expectedAnswer: "sim task 정의, reward/safety metric 분리, PPO 학습, seed별 eval, domain randomization, CBF/action clamp, latency profiling, low-speed real test 순서로 진행한다.",
        explanation: "로봇 RL은 알고리즘 하나가 아니라 안전한 실험 pipeline이다.",
        errorType: "system_design_error",
        retryQuestionType: "system_design",
      },
    ],
  ),
  withExtraQuizzes(
    makeAdvancedSession({
      id: "vlm_architecture_to_vla_bridge",
      part: "Part 7. Physical AI / Embodied AI",
      title: "VLM Architecture: CLIP/LLaVA에서 VLA로 이어지는 구조",
      prerequisites: ["vla_architecture_concepts", "attention_mechanism_vla_basics"],
      objectives: ["image/text embedding alignment를 설명한다.", "VLM grounding confidence를 action gate와 연결한다.", "VLM과 VLA의 출력 차이를 구분한다."],
      definition: "VLM은 이미지와 언어를 같은 의미 공간이나 cross-attention 구조로 연결해 설명, 질의응답, grounding을 수행하고, VLA는 그 grounding을 robot action 생성으로 확장한다.",
      whyItMatters: "VLA를 이해하려면 먼저 VLM이 visual token과 language token을 어떻게 정렬하고 confidence를 만드는지 알아야 한다.",
      intuition: "VLM은 장면에서 '빨간 컵'이 무엇인지 찾고 말로 설명하는 눈과 언어의 연결부이고, VLA는 그 결과를 잡기/이동 같은 행동으로 바꾼다.",
      equations: [
        { label: "Cosine grounding", expression: "score_i=\\frac{v_i^Tt}{\\|v_i\\|\\|t\\|}", terms: [["v_i", "image embedding"], ["t", "text embedding"]], explanation: "이미지 후보와 텍스트 명령의 유사도를 계산한다." },
        { label: "VLM output", expression: "p(text|image,prompt)", terms: [["prompt", "language query"]], explanation: "VLM은 주로 언어/grounding 출력을 낸다." },
        { label: "VLA policy", expression: "a_t=\\pi(image,text,state)", terms: [["a_t", "robot action"]], explanation: "VLA는 action을 직접 또는 token으로 낸다." },
      ],
      derivation: [["visual encoder", "image/crop을 embedding 또는 token으로 바꾼다."], ["text encoder", "명령/질문을 embedding 또는 language token으로 바꾼다."], ["alignment", "contrastive cosine 또는 cross attention으로 관련 영역을 찾는다."], ["action bridge", "confidence가 충분할 때만 VLA action head 또는 planner로 넘긴다."]],
      handCalculation: { problem: "normalized image score가 [0.97,0.24]이고 threshold=0.6이면 선택 index는?", given: { scores: "[0.97,0.24]" }, steps: ["최대 score=0.97", "0.97>=0.6"], answer: "index 0" },
      robotApplication: "언어 지시 기반 pick task에서 VLM grounding score가 낮으면 VLA action을 실행하지 않고 사용자 확인 또는 재관측을 요청한다.",
      lab: vlmLab,
      visualization: { id: "vis_vlm_embedding_space", title: "VLM Embedding Space to VLA Gate", equation: "cos(v,t)>threshold", parameters: [{ name: "grounding_threshold", symbol: "\\tau_g", min: 0, max: 1, default: 0.6, description: "grounding confidence threshold" }, { name: "visual_noise", symbol: "\\sigma_v", min: 0, max: 1, default: 0.1, description: "visual embedding noise" }], normalCase: "명령과 물체 embedding이 가까워 action gate를 통과한다.", failureCase: "confidence가 낮거나 ambiguous하면 action을 stop/escalate로 바꾼다." },
      quiz: quizSeed("vlm_bridge", "VLM to VLA architecture", "score=cos(v,t)", "return idx if scores[idx] >= threshold else -1"),
      wrongTagLabel: "VLM grounding/VLA 연결 오류",
      nextSessions: ["robot_foundation_model_deployment", "cbf_qp_safety_filter"],
    }),
    [
      {
        id: "q08_safety",
        type: "safety_analysis",
        difficulty: "hard",
        question: "VLM grounding score가 threshold보다 낮은데 VLA action head가 높은 속도 명령을 냈다. 실행해도 되는가?",
        expectedAnswer: "안 된다. grounding confidence gate에서 stop 또는 human confirmation으로 보내야 한다.",
        explanation: "언어-시각 grounding 실패는 잘못된 물체 조작으로 이어지는 안전 문제다.",
        errorType: "safety_misjudgment",
        retryQuestionType: "robot_scenario",
      },
    ],
  ),
];
