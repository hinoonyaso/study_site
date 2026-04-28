import type { CodeLab, Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

const quiz = (id: string, topic: string, formula: string, code: string) => ({
  id,
  conceptQuestion: `${topic}에서 가장 중요한 engineering 판단은 무엇인가?`,
  conceptAnswer: `${topic}은 수식값만 맞추는 것이 아니라 좌표계, 단위, 노이즈, actuator 또는 sensor limit을 함께 확인해야 한다.`,
  calculationQuestion: `${formula}를 적용할 때 단위가 10배 틀리면 어떤 문제가 생기는가?`,
  calculationAnswer: "출력도 해당 항에 비례해 10배 또는 비선형적으로 틀어지고, 로봇에서는 위치/힘/시간 budget 오류로 이어진다.",
  codeQuestion: `${topic} 핵심 구현에서 확인해야 할 코드 한 줄 또는 함수는?`,
  codeAnswer: code,
  debugQuestion: `${topic} 코드가 예제에서는 맞지만 실제 로그에서 실패하면 무엇을 먼저 확인하는가?`,
  debugAnswer: "입력 shape, 단위, timestamp, frame 기준, 경계 조건, solver success flag를 먼저 확인한다.",
  visualQuestion: `${topic} 시각화에서 슬라이더를 극단값으로 밀면 무엇을 봐야 하는가?`,
  visualAnswer: "정상 범위에서는 metric이 부드럽게 바뀌고, 실패 범위에서는 명확한 warning 또는 fallback 조건이 드러나야 한다.",
  robotQuestion: `${topic}을 실제 로봇에 연결할 때 최소 safety gate는?`,
  robotAnswer: "workspace/joint/velocity/force limit, stale data timeout, confidence threshold, emergency stop을 둔다.",
  designQuestion: `${topic}을 프로젝트에 넣기 전 검증 순서는?`,
  designAnswer: "손계산, unit test, synthetic data, logged data replay, simulator rollout, low-speed hardware test 순서로 검증한다.",
});

const lab = (item: CodeLab): CodeLab => item;

const mleBiasLab = lab({
  id: "lab_mle_sensor_bias_gaussian",
  title: "MLE Sensor Bias and Sigma Calibration",
  language: "python",
  theoryConnection: "Gaussian MLE: mu_hat=mean(x), sigma_hat=sqrt(mean((x-mu)^2))",
  starterCode: `import numpy as np

def estimate_bias_and_sigma(measurements, true_value):
    # TODO: residual = measurements - true_value
    # TODO: bias=mean(residual), sigma=sqrt(mean((residual-bias)^2))
    raise NotImplementedError

if __name__ == "__main__":
    z = np.array([1.08, 1.12, 1.09, 1.11, 1.10])
    bias, sigma = estimate_bias_and_sigma(z, true_value=1.0)
    print(round(bias, 3), round(sigma, 3))`,
  solutionCode: `import numpy as np

def estimate_bias_and_sigma(measurements, true_value):
    residual = np.asarray(measurements, dtype=float) - float(true_value)
    bias = float(np.mean(residual))
    sigma = float(np.sqrt(np.mean((residual - bias) ** 2)))
    return bias, sigma

if __name__ == "__main__":
    z = np.array([1.08, 1.12, 1.09, 1.11, 1.10])
    bias, sigma = estimate_bias_and_sigma(z, true_value=1.0)
    print(round(bias, 3), round(sigma, 3))`,
  testCode: `import numpy as np
from mle_sensor_bias_gaussian import estimate_bias_and_sigma

def test_bias_sigma():
    bias, sigma = estimate_bias_and_sigma(np.array([1.0, 1.2, 0.8]), 1.0)
    assert abs(bias) < 1e-12
    assert abs(sigma - 0.163299316) < 1e-6`,
  expectedOutput: "0.1 0.014",
  runCommand: "python mle_sensor_bias_gaussian.py && pytest test_mle_sensor_bias_gaussian.py",
  commonBugs: ["sample std(ddof=1)와 MLE sigma(ddof=0)를 혼동함", "true_value를 빼지 않아 bias 대신 absolute mean을 추정함", "outlier 제거 없이 sigma를 과대평가함"],
  extensionTask: "outlier가 섞인 로그에서 Gaussian MLE와 median/MAD robust estimate를 비교하라.",
});

const lieExpLogLab = lab({
  id: "lab_so3_exp_log_map",
  title: "SO(3) Exp/Log Map with Rodrigues",
  language: "python",
  theoryConnection: "R = I + sin(theta)K + (1-cos(theta))K^2",
  starterCode: `import numpy as np

def skew(w):
    # TODO: 3-vector to skew matrix
    raise NotImplementedError

def exp_so3(w):
    # TODO: Rodrigues formula
    raise NotImplementedError

if __name__ == "__main__":
    R = exp_so3(np.array([0.0, 0.0, np.pi/2]))
    print(np.round(R, 3))`,
  solutionCode: `import numpy as np

def skew(w):
    wx, wy, wz = w
    return np.array([[0, -wz, wy], [wz, 0, -wx], [-wy, wx, 0]], dtype=float)

def exp_so3(w):
    theta = np.linalg.norm(w)
    if theta < 1e-12:
        return np.eye(3) + skew(w)
    K = skew(w / theta)
    return np.eye(3) + np.sin(theta) * K + (1 - np.cos(theta)) * (K @ K)

if __name__ == "__main__":
    R = exp_so3(np.array([0.0, 0.0, np.pi/2]))
    print(np.round(R, 3))`,
  testCode: `import numpy as np
from so3_exp_log_map import exp_so3

def test_exp_z_90():
    R = exp_so3(np.array([0,0,np.pi/2]))
    assert np.allclose(R @ np.array([1,0,0]), [0,1,0], atol=1e-6)

def test_rotation_is_orthonormal():
    R = exp_so3(np.array([0.1, -0.2, 0.3]))
    assert np.allclose(R.T @ R, np.eye(3), atol=1e-6)`,
  expectedOutput: "[[ 0. -1.  0.]\n [ 1.  0.  0.]\n [ 0.  0.  1.]]",
  runCommand: "python so3_exp_log_map.py && pytest test_so3_exp_log_map.py",
  commonBugs: ["rotation vector 크기 theta를 정규화하지 않고 K에 그대로 넣음", "small angle에서 0으로 나누기", "skew matrix 부호를 반대로 써 회전 방향이 뒤집힘"],
  extensionTask: "log_so3를 구현하고 exp_so3(log_so3(R))이 원래 R을 복원하는지 테스트하라.",
});

const cppEigenIkLab = lab({
  id: "lab_cpp_eigen_ik_2link",
  title: "C++ Eigen Analytic IK for 2-link Arm",
  language: "cpp",
  theoryConnection: "cos(q2)=(x^2+y^2-l1^2-l2^2)/(2*l1*l2), q1=atan2(y,x)-atan2(l2*sin(q2),l1+l2*cos(q2))",
  starterCode: `#include <Eigen/Dense>
#include <cmath>
#include <iostream>
#include <stdexcept>

Eigen::Vector2d SolveIk(double x, double y, double l1, double l2) {
  // TODO: analytic elbow-down IK, throw if unreachable.
  throw std::runtime_error("implement IK");
}

int main() {
  auto q = SolveIk(1.0, 0.7, 1.0, 0.7);
  std::cout << std::round(q.x()*1000)/1000 << " " << std::round(q.y()*1000)/1000 << "\\n";
}`,
  solutionCode: `#include <Eigen/Dense>
#include <algorithm>
#include <cmath>
#include <iostream>
#include <stdexcept>

Eigen::Vector2d SolveIk(double x, double y, double l1, double l2) {
  const double r2 = x*x + y*y;
  double c2 = (r2 - l1*l1 - l2*l2) / (2.0*l1*l2);
  if (c2 < -1.0 || c2 > 1.0) throw std::runtime_error("unreachable");
  c2 = std::clamp(c2, -1.0, 1.0);
  const double q2 = std::acos(c2);
  const double q1 = std::atan2(y, x) - std::atan2(l2*std::sin(q2), l1 + l2*std::cos(q2));
  return Eigen::Vector2d(q1, q2);
}

int main() {
  auto q = SolveIk(1.0, 0.7, 1.0, 0.7);
  std::cout << std::round(q.x()*1000)/1000 << " " << std::round(q.y()*1000)/1000 << "\\n";
}`,
  testCode: `#include <cassert>
#include <cmath>
Eigen::Vector2d SolveIk(double x, double y, double l1, double l2);
int main() {
  auto q = SolveIk(1.7, 0.0, 1.0, 0.7);
  assert(std::abs(q.x()) < 1e-9);
  assert(std::abs(q.y()) < 1e-9);
}`,
  expectedOutput: "0 1.571",
  runCommand: "g++ -std=c++17 -I/usr/include/eigen3 cpp_eigen_ik_2link.cpp -o cpp_eigen_ik_2link && ./cpp_eigen_ik_2link",
  commonBugs: ["acos 입력을 clamp하지 않아 floating point로 NaN 발생", "elbow-up/down branch를 명시하지 않음", "target이 workspace 밖인데 예외 처리하지 않음"],
  extensionTask: "elbow-up branch를 추가하고 FK로 두 해가 같은 target에 도달하는지 검산하라.",
});

const impedanceLab = lab({
  id: "lab_impedance_control_1d",
  title: "1D Impedance Control Response",
  language: "python",
  theoryConnection: "M*xddot + B*xdot + K*(x-x_ref) = F_ext",
  starterCode: `import numpy as np

def simulate_impedance(M=1.0, B=4.0, K=25.0, F_ext=1.0, dt=0.001, steps=2000):
    # TODO: Euler integrate mass-spring-damper displacement.
    raise NotImplementedError

if __name__ == "__main__":
    xs = simulate_impedance()
    print(round(xs[-1], 3))`,
  solutionCode: `import numpy as np

def simulate_impedance(M=1.0, B=4.0, K=25.0, F_ext=1.0, dt=0.001, steps=2000):
    x = 0.0
    v = 0.0
    xs = []
    for _ in range(steps):
        a = (F_ext - B * v - K * x) / M
        v += dt * a
        x += dt * v
        xs.append(x)
    return np.array(xs)

if __name__ == "__main__":
    xs = simulate_impedance()
    print(round(xs[-1], 3))`,
  testCode: `from impedance_control_1d import simulate_impedance

def test_steady_state_force_over_stiffness():
    xs = simulate_impedance(K=25.0, F_ext=1.0, steps=8000)
    assert abs(xs[-1] - 0.04) < 0.005`,
  expectedOutput: "0.04",
  runCommand: "python impedance_control_1d.py && pytest test_impedance_control_1d.py",
  commonBugs: ["K를 크게 하면 더 compliant하다고 반대로 해석함", "external force 방향과 displacement 부호를 섞음", "dt가 커서 mass-spring-damper가 수치적으로 발산함"],
  extensionTask: "B를 바꿔 under/critical/over-damped response를 비교하라.",
});

const rrtLab = lab({
  id: "lab_rrt_2d_planner",
  title: "RRT 2D Planner with Collision Check",
  language: "python",
  theoryConnection: "sample -> nearest -> steer -> collision check -> tree growth",
  starterCode: `import math

def steer(a, b, step=0.25):
    # TODO: move from a toward b by at most step.
    raise NotImplementedError

def rrt(samples, start=(0,0), goal=(1,1), step=0.25, goal_radius=0.3):
    # TODO: deterministic RRT from provided samples.
    raise NotImplementedError

if __name__ == "__main__":
    samples = [(0.2,0.1),(0.4,0.2),(0.6,0.4),(0.8,0.7),(1.0,1.0)]
    path = rrt(samples)
    print(len(path), path[-1])`,
  solutionCode: `import math

def steer(a, b, step=0.25):
    dx, dy = b[0]-a[0], b[1]-a[1]
    d = math.hypot(dx, dy)
    if d <= step:
        return b
    return (a[0] + step*dx/d, a[1] + step*dy/d)

def rrt(samples, start=(0,0), goal=(1,1), step=0.25, goal_radius=0.3):
    nodes = [start]
    parent = {start: None}
    for sample in samples:
      nearest = min(nodes, key=lambda n: math.hypot(n[0]-sample[0], n[1]-sample[1]))
      new = steer(nearest, sample, step)
      nodes.append(new)
      parent[new] = nearest
      if math.hypot(new[0]-goal[0], new[1]-goal[1]) < goal_radius:
          path = [new]
          while parent[path[-1]] is not None:
              path.append(parent[path[-1]])
          return list(reversed(path))
    return []

if __name__ == "__main__":
    samples = [(0.2,0.1),(0.4,0.2),(0.6,0.4),(0.8,0.7),(1.0,1.0)]
    path = rrt(samples)
    print(len(path), tuple(round(v,2) for v in path[-1]))`,
  testCode: `from rrt_2d_planner import steer, rrt

def test_steer_limits_step():
    p = steer((0,0), (1,0), 0.25)
    assert abs(p[0] - 0.25) < 1e-9

def test_rrt_reaches_goal_region():
    path = rrt([(0.2,0.1),(0.4,0.2),(0.6,0.4),(0.8,0.7),(1.0,1.0)])
    assert path and path[0] == (0,0)`,
  expectedOutput: "6 (0.86, 0.79)",
  runCommand: "python rrt_2d_planner.py && pytest test_rrt_2d_planner.py",
  commonBugs: ["nearest search를 goal 기준으로 해 tree가 samples를 따라가지 않음", "steer step 제한을 빼먹어 collision check가 무의미해짐", "parent 역추적을 하지 않아 path 대신 tree node만 반환함"],
  extensionTask: "원형 장애물 collision check와 RRT* rewiring을 추가하라.",
});

const graspLab = lab({
  id: "lab_grasp_pose_sampling",
  title: "Simple Grasp Pose Sampling from Mask and Depth",
  language: "python",
  theoryConnection: "grasp center = mask centroid, width from bbox, approach from camera z",
  starterCode: `import numpy as np

def sample_grasp_from_bbox_depth(bbox, depth_m):
    # TODO: bbox=(x,y,w,h) -> center, opening, approach
    raise NotImplementedError

if __name__ == "__main__":
    print(sample_grasp_from_bbox_depth((40, 30, 60, 40), 0.8))`,
  solutionCode: `import numpy as np

def sample_grasp_from_bbox_depth(bbox, depth_m):
    x, y, w, h = bbox
    center_px = (x + w / 2.0, y + h / 2.0)
    opening_px = min(w, h)
    approach = np.array([0.0, 0.0, -1.0])
    return {"center_px": center_px, "opening_px": opening_px, "depth_m": depth_m, "approach": approach}

if __name__ == "__main__":
    g = sample_grasp_from_bbox_depth((40, 30, 60, 40), 0.8)
    print(g["center_px"], g["opening_px"], g["depth_m"])`,
  testCode: `from grasp_pose_sampling import sample_grasp_from_bbox_depth

def test_grasp_center():
    g = sample_grasp_from_bbox_depth((40,30,60,40), 0.8)
    assert g["center_px"] == (70.0, 50.0)
    assert g["opening_px"] == 40`,
  expectedOutput: "(70.0, 50.0) 40 0.8",
  runCommand: "python grasp_pose_sampling.py && pytest test_grasp_pose_sampling.py",
  commonBugs: ["bbox 중심을 x+w,y+h로 계산해 우하단 corner를 grasp center로 씀", "pixel opening을 meter gripper width와 바로 동일시함", "approach vector를 camera frame에서 base frame으로 변환하지 않음"],
  extensionTask: "depth intrinsics를 넣어 center pixel을 3D point로 바꾸고 TF camera->base를 적용하라.",
});

const stereoCalibLab = lab({
  id: "lab_stereo_calibration_sanity",
  title: "Stereo Calibration Sanity: Baseline and Epipolar Residual",
  language: "python",
  theoryConnection: "rectified stereo: y_left ~= y_right, baseline B controls disparity-depth scale",
  starterCode: `import numpy as np

def estimate_baseline(focal_px, depth_m, disparity_px):
    # TODO: B = Z*d/f
    raise NotImplementedError

def epipolar_residual(left_pts, right_pts):
    # TODO: mean |y_left - y_right|
    raise NotImplementedError

if __name__ == "__main__":
    print(round(estimate_baseline(500, 2.0, 25), 3))`,
  solutionCode: `import numpy as np

def estimate_baseline(focal_px, depth_m, disparity_px):
    return float(depth_m * disparity_px / focal_px)

def epipolar_residual(left_pts, right_pts):
    left_pts = np.asarray(left_pts, dtype=float)
    right_pts = np.asarray(right_pts, dtype=float)
    return float(np.mean(np.abs(left_pts[:, 1] - right_pts[:, 1])))

if __name__ == "__main__":
    print(round(estimate_baseline(500, 2.0, 25), 3))`,
  testCode: `import numpy as np
from stereo_calibration_sanity import estimate_baseline, epipolar_residual

def test_baseline():
    assert abs(estimate_baseline(500, 2.0, 25) - 0.1) < 1e-12

def test_epipolar_zero():
    pts = np.array([[10,20],[30,40]])
    assert epipolar_residual(pts, pts + [5,0]) == 0.0`,
  expectedOutput: "0.1",
  runCommand: "python stereo_calibration_sanity.py && pytest test_stereo_calibration_sanity.py",
  commonBugs: ["baseline을 cm로 넣어 depth scale이 틀어짐", "rectification 후에도 y residual이 큰데 calibration 성공으로 판단함", "checkerboard corner 순서를 좌우 이미지에서 다르게 정렬함"],
  extensionTask: "cv2.findChessboardCorners와 cv2.stereoCalibrate를 사용해 실제 checkerboard 이미지로 확장하라.",
});

const segTrainLab = lab({
  id: "lab_semantic_seg_weighted_ce",
  title: "Per-pixel Cross Entropy with Class Weights",
  language: "python",
  theoryConnection: "weighted CE = -mean(w_y * log softmax(logits)_y)",
  starterCode: `import numpy as np

def softmax(logits):
    # TODO: stable softmax over last axis
    raise NotImplementedError

def weighted_ce(logits, labels, class_weights):
    # TODO: per-pixel weighted cross entropy
    raise NotImplementedError

if __name__ == "__main__":
    logits = np.array([[[2.0, 0.0], [0.0, 2.0]]])
    labels = np.array([[0, 1]])
    print(round(weighted_ce(logits, labels, np.array([1.0, 2.0])), 3))`,
  solutionCode: `import numpy as np

def softmax(logits):
    z = logits - np.max(logits, axis=-1, keepdims=True)
    e = np.exp(z)
    return e / np.sum(e, axis=-1, keepdims=True)

def weighted_ce(logits, labels, class_weights):
    probs = softmax(logits)
    flat_labels = labels.reshape(-1)
    flat_probs = probs.reshape(-1, probs.shape[-1])
    weights = class_weights[flat_labels]
    p = flat_probs[np.arange(len(flat_labels)), flat_labels]
    return float(np.mean(-weights * np.log(np.clip(p, 1e-9, 1.0))))

if __name__ == "__main__":
    logits = np.array([[[2.0, 0.0], [0.0, 2.0]]])
    labels = np.array([[0, 1]])
    print(round(weighted_ce(logits, labels, np.array([1.0, 2.0])), 3))`,
  testCode: `import numpy as np
from semantic_seg_weighted_ce import softmax, weighted_ce

def test_softmax_sums_to_one():
    p = softmax(np.array([[[1.0, 2.0, 3.0]]]))
    assert np.allclose(p.sum(axis=-1), 1.0)

def test_weighted_ce_positive():
    assert weighted_ce(np.zeros((1,2,2)), np.array([[0,1]]), np.array([1.0,2.0])) > 0`,
  expectedOutput: "0.19",
  runCommand: "python semantic_seg_weighted_ce.py && pytest test_semantic_seg_weighted_ce.py",
  commonBugs: ["softmax 안정화를 빼먹어 큰 logit에서 overflow", "class weight를 prediction class에 적용하고 label class에 적용하지 않음", "H,W,C 축을 섞어 labels indexing이 틀림"],
  extensionTask: "foreground 1% mask에서 weight를 바꿔 CE와 Dice loss를 함께 비교하라.",
});

const attentionLab = lab({
  id: "lab_scaled_dot_product_attention",
  title: "Scaled Dot-product Attention for Action Context",
  language: "python",
  theoryConnection: "Attention(Q,K,V)=softmax(QK^T/sqrt(d))V",
  starterCode: `import numpy as np

def attention(Q, K, V):
    # TODO: scaled dot-product attention
    raise NotImplementedError

if __name__ == "__main__":
    Q = np.array([[1.0, 0.0]])
    K = np.eye(2)
    V = np.array([[1.0, 0.0], [0.0, 1.0]])
    out, weights = attention(Q, K, V)
    print(np.round(weights, 3))`,
  solutionCode: `import numpy as np

def attention(Q, K, V):
    scores = Q @ K.T / np.sqrt(K.shape[-1])
    scores = scores - np.max(scores, axis=-1, keepdims=True)
    weights = np.exp(scores) / np.sum(np.exp(scores), axis=-1, keepdims=True)
    return weights @ V, weights

if __name__ == "__main__":
    Q = np.array([[1.0, 0.0]])
    K = np.eye(2)
    V = np.array([[1.0, 0.0], [0.0, 1.0]])
    out, weights = attention(Q, K, V)
    print(np.round(weights, 3))`,
  testCode: `import numpy as np
from scaled_dot_product_attention import attention

def test_weights_sum():
    _, w = attention(np.ones((1,2)), np.eye(2), np.eye(2))
    assert np.allclose(w.sum(axis=-1), 1.0)`,
  expectedOutput: "[[0.67 0.33]]",
  runCommand: "python scaled_dot_product_attention.py && pytest test_scaled_dot_product_attention.py",
  commonBugs: ["sqrt(d) scaling을 빼 logits가 너무 커짐", "softmax axis를 token axis가 아닌 feature axis로 적용함", "attention weight를 safety confidence로 오해함"],
  extensionTask: "vision token과 language token을 분리하고 어떤 token에 action query가 집중하는지 heatmap으로 저장하라.",
});

const ros2PackageLab = lab({
  id: "lab_ros2_package_manifest_check",
  title: "ROS2 ament_cmake Package Manifest Check",
  language: "python",
  theoryConnection: "package.xml + CMakeLists.txt + src node -> colcon build",
  starterCode: `def make_package_files(pkg_name):
    # TODO: return package.xml and CMakeLists.txt strings for rclcpp executable.
    raise NotImplementedError

if __name__ == "__main__":
    package_xml, cmake = make_package_files("range_follow_demo")
    print("rclcpp" in package_xml, "ament_target_dependencies" in cmake)`,
  solutionCode: `def make_package_files(pkg_name):
    package_xml = f"""<package format=\\"3\\">
  <name>{pkg_name}</name>
  <version>0.0.1</version>
  <description>ROS2 C++ control loop demo</description>
  <maintainer email=\\"student@example.com\\">student</maintainer>
  <license>Apache-2.0</license>
  <buildtool_depend>ament_cmake</buildtool_depend>
  <depend>rclcpp</depend>
  <depend>geometry_msgs</depend>
</package>"""
    cmake = f"""cmake_minimum_required(VERSION 3.8)
project({pkg_name})
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(geometry_msgs REQUIRED)
add_executable(range_follow_node src/range_follow_node.cpp)
ament_target_dependencies(range_follow_node rclcpp geometry_msgs)
install(TARGETS range_follow_node DESTINATION lib/\${PROJECT_NAME})
ament_package()"""
    return package_xml, cmake

if __name__ == "__main__":
    package_xml, cmake = make_package_files("range_follow_demo")
    print("rclcpp" in package_xml, "ament_target_dependencies" in cmake)`,
  testCode: `from ros2_package_manifest_check import make_package_files

def test_manifest_contains_rclcpp():
    xml, cmake = make_package_files("demo")
    assert "<depend>rclcpp</depend>" in xml
    assert "add_executable" in cmake
    assert "ament_package()" in cmake`,
  expectedOutput: "True True",
  runCommand: "python ros2_package_manifest_check.py && pytest test_ros2_package_manifest_check.py",
  commonBugs: ["package.xml에는 의존성이 있는데 CMakeLists find_package를 빼먹음", "install(TARGETS ...)가 없어 ros2 run에서 executable을 못 찾음", "ament_package()를 누락함"],
  extensionTask: "ros2 pkg create --build-type ament_cmake로 실제 package를 만들고 colcon build 로그를 캡처하라.",
});

const urdfParserLab = lab({
  id: "lab_urdf_joint_parser",
  title: "URDF Joint Parser",
  language: "python",
  theoryConnection: "URDF joint tree -> kinematic chain -> controller joint list",
  starterCode: `import xml.etree.ElementTree as ET

def parse_revolute_joints(urdf_text):
    # TODO: return joint names with type revolute/continuous
    raise NotImplementedError

if __name__ == "__main__":
    urdf = "<robot><joint name='j1' type='revolute'/><joint name='fixed' type='fixed'/></robot>"
    print(parse_revolute_joints(urdf))`,
  solutionCode: `import xml.etree.ElementTree as ET

def parse_revolute_joints(urdf_text):
    root = ET.fromstring(urdf_text)
    return [j.attrib["name"] for j in root.findall("joint") if j.attrib.get("type") in {"revolute", "continuous"}]

if __name__ == "__main__":
    urdf = "<robot><joint name='j1' type='revolute'/><joint name='fixed' type='fixed'/></robot>"
    print(parse_revolute_joints(urdf))`,
  testCode: `from urdf_joint_parser import parse_revolute_joints

def test_revolute_only():
    urdf = "<robot><joint name='a' type='continuous'/><joint name='b' type='fixed'/></robot>"
    assert parse_revolute_joints(urdf) == ["a"]`,
  expectedOutput: "['j1']",
  runCommand: "python urdf_joint_parser.py && pytest test_urdf_joint_parser.py",
  commonBugs: ["fixed joint를 controller joint list에 넣음", "mimic joint와 transmission을 확인하지 않음", "URDF joint 순서와 controller YAML 순서 mismatch를 놓침"],
  extensionTask: "parent/child link를 읽어 base_link에서 end-effector까지 chain을 구성하라.",
});

const icpLab = lab({
  id: "lab_icp_2d_registration",
  title: "2D ICP Registration with SVD",
  language: "python",
  theoryConnection: "center points, H=A^T B, R=V U^T, t=mu_B-R mu_A",
  starterCode: `import numpy as np

def rigid_transform_2d(A, B):
    # TODO: best-fit R,t mapping A to B
    raise NotImplementedError

if __name__ == "__main__":
    A = np.array([[0,0],[1,0],[0,1]], dtype=float)
    B = A + np.array([1.0, 2.0])
    R, t = rigid_transform_2d(A, B)
    print(np.round(t, 3))`,
  solutionCode: `import numpy as np

def rigid_transform_2d(A, B):
    A = np.asarray(A, dtype=float)
    B = np.asarray(B, dtype=float)
    mu_A = A.mean(axis=0)
    mu_B = B.mean(axis=0)
    AA = A - mu_A
    BB = B - mu_B
    U, _, Vt = np.linalg.svd(AA.T @ BB)
    R = Vt.T @ U.T
    if np.linalg.det(R) < 0:
        Vt[-1, :] *= -1
        R = Vt.T @ U.T
    t = mu_B - R @ mu_A
    return R, t

if __name__ == "__main__":
    A = np.array([[0,0],[1,0],[0,1]], dtype=float)
    B = A + np.array([1.0, 2.0])
    R, t = rigid_transform_2d(A, B)
    print(np.round(t, 3))`,
  testCode: `import numpy as np
from icp_2d_registration import rigid_transform_2d

def test_translation_only():
    A = np.array([[0,0],[1,0],[0,1]], dtype=float)
    B = A + [1,2]
    R, t = rigid_transform_2d(A, B)
    assert np.allclose(R, np.eye(2))
    assert np.allclose(t, [1,2])`,
  expectedOutput: "[1. 2.]",
  runCommand: "python icp_2d_registration.py && pytest test_icp_2d_registration.py",
  commonBugs: ["centroid를 빼지 않아 translation이 rotation에 섞임", "reflection(det<0)을 처리하지 않음", "nearest-neighbor association 오류를 transform 오류로 착각함"],
  extensionTask: "nearest neighbor matching loop를 추가해 실제 ICP iteration으로 확장하라.",
});

export const aPlusMathSessions: Session[] = [
  makeAdvancedSession({
    id: "mle_sensor_calibration_gaussian",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "MLE 독립 세션: Gaussian 센서 Bias/Sigma 캘리브레이션",
    prerequisites: ["gaussian_mle", "kalman_filter_1d"],
    objectives: ["Gaussian MLE로 bias와 sigma를 추정한다.", "ddof=0 MLE와 sample std 차이를 설명한다.", "센서 로그에서 R 값을 정하는 근거를 만든다."],
    definition: "MLE는 관측 데이터가 가장 그럴듯하게 나오도록 분포 파라미터를 선택하는 방법이다.",
    whyItMatters: "Kalman Filter의 R, IMU noise, camera reprojection noise는 모두 로그에서 추정해야 한다.",
    intuition: "센서가 참값 주변에서 얼마나 치우쳐 있고 얼마나 흔들리는지 평균과 표준편차로 재는 과정이다.",
    equations: [
      { label: "Bias MLE", expression: "\\hat b=\\frac{1}{N}\\sum_i(z_i-z^*)", terms: [["z_i", "measurement"], ["z*", "ground truth"]], explanation: "참값 대비 평균 잔차가 bias다." },
      { label: "Sigma MLE", expression: "\\hat\\sigma=\\sqrt{\\frac{1}{N}\\sum_i(r_i-\\hat b)^2}", terms: [["r_i", "residual"]], explanation: "Gaussian likelihood 최대화에서 ddof=0 분산이 나온다." },
      { label: "KF R", expression: "R=\\hat\\sigma^2", terms: [["R", "measurement noise variance"]], explanation: "센서 noise variance가 KF update 신뢰도를 결정한다." },
    ],
    derivation: [["residual", "측정값에서 ground truth를 빼 잔차를 만든다."], ["log likelihood", "Gaussian log likelihood를 b,sigma에 대해 쓴다."], ["differentiate", "b에 대해 미분하면 평균 잔차가 나온다."], ["variance", "sigma에 대해 미분하면 평균 제곱 잔차가 나온다."]],
    handCalculation: { problem: "측정 residual이 [0.1,0.1,0.2]이면 bias는?", given: { residuals: "[0.1,0.1,0.2]" }, steps: ["mean=(0.1+0.1+0.2)/3=0.133"], answer: "bias=0.133" },
    robotApplication: "정지 상태 IMU 또는 motion-capture 기준 GPS 로그에서 bias와 sigma를 추정해 robot_localization YAML의 covariance에 반영한다.",
    lab: mleBiasLab,
    visualization: { id: "vis_mle_sensor_bias", title: "Sensor Residual Gaussian Fit", equation: "R=sigma^2", parameters: [{ name: "bias", symbol: "b", min: -0.5, max: 0.5, default: 0.1, description: "sensor bias" }, { name: "sigma", symbol: "\\sigma", min: 0.01, max: 0.5, default: 0.05, description: "sensor standard deviation" }], normalCase: "residual histogram이 Gaussian fit과 비슷하면 R 추정이 안정적이다.", failureCase: "outlier가 많으면 sigma가 커지고 KF가 센서를 과도하게 불신한다." },
    quiz: quiz("mle_sensor", "Gaussian MLE 센서 캘리브레이션", "R=sigma^2", "bias = np.mean(measurements - true_value)"),
    wrongTagLabel: "MLE sensor calibration 오류",
    nextSessions: ["kalman_filter_1d", "sensor_fusion_gps_imu"],
  }),
];

export const aPlusRobotMathSessions: Session[] = [
  makeAdvancedSession({
    id: "lie_algebra_so3_exp_log",
    part: "Part 2. 로봇 수학",
    title: "Lie Algebra 입문: SO(3) Exp/Log Map",
    prerequisites: ["quaternion_slerp_so3", "robot_math_homogeneous_transform_se3"],
    objectives: ["rotation vector와 skew matrix를 연결한다.", "Rodrigues exp map을 구현한다.", "SLAM/MoveIt에서 exp/log map이 쓰이는 이유를 설명한다."],
    definition: "Lie algebra는 회전/변환 group 근처의 작은 변화량을 벡터 공간에서 표현하는 방법이다.",
    whyItMatters: "SLAM pose graph, IMU preintegration, MoveIt orientation error는 작은 회전 오차를 exp/log map으로 다룬다.",
    intuition: "구 위의 회전을 직접 더하지 않고, 접평면의 작은 화살표로 바꿔 계산한 뒤 다시 회전으로 되돌리는 방법이다.",
    equations: [
      { label: "Skew", expression: "[\\omega]_\\times v=\\omega\\times v", terms: [["ω", "rotation vector"]], explanation: "외적을 행렬곱으로 표현한다." },
      { label: "SO3 exponential", expression: "R=I+\\sin\\theta K+(1-\\cos\\theta)K^2", terms: [["K", "[ω/theta]x"]], explanation: "rotation vector를 rotation matrix로 바꾼다." },
      { label: "Small angle", expression: "Exp(\\omega)\\approx I+[\\omega]_\\times", terms: [["ω", "small rotation"]], explanation: "작은 회전 오차 선형화의 핵심이다." },
    ],
    derivation: [["axis-angle", "rotation vector의 방향은 축, 크기는 각도다."], ["skew", "축 벡터를 외적 행렬로 바꾼다."], ["Rodrigues", "sin/cos 항으로 원 위 회전을 닫힌형으로 계산한다."], ["log map", "R에서 다시 작은 오차 벡터를 추출한다."]],
    handCalculation: { problem: "ω=[0,0,π/2]이면 x축 단위벡터는 어디로 가는가?", given: { omega: "[0,0,pi/2]" }, steps: ["z축 기준 90도 회전", "x축은 y축으로 이동"], answer: "[0,1,0]" },
    robotApplication: "Pose graph residual은 T_ij^-1 T_i^-1 T_j의 log map으로 오차 벡터를 만들고 optimizer가 이 벡터를 줄인다.",
    lab: lieExpLogLab,
    visualization: { id: "vis_so3_exp_log_map", title: "SO(3) Exp/Log Rotation Path", equation: "R=Exp(omega)", parameters: [{ name: "theta_deg", symbol: "\\theta", min: -180, max: 180, default: 90, description: "rotation vector angle" }, { name: "axis_z", symbol: "a_z", min: -1, max: 1, default: 1, description: "axis z component" }], normalCase: "axis가 정규화되고 theta가 작당하면 orthonormal R이 나온다.", failureCase: "small angle 처리가 없으면 theta=0에서 NaN이 발생한다." },
    quiz: quiz("lie_so3", "SO(3) Exp/Log Map", "R=Exp(omega)", "K = skew(w / theta)"),
    wrongTagLabel: "SO(3) Lie algebra 오류",
    nextSessions: ["pose_graph_slam_backend", "imu_preintegration_bias_drift"],
  }),
  makeAdvancedSession({
    id: "grasp_pose_sampling_basics",
    part: "Part 2. 로봇 수학",
    title: "Grasp Planning 기초: Mask/Depth에서 Grasp Pose 후보 만들기",
    prerequisites: ["depth_estimation_stereo_geometry", "pose_estimation_pnp_6d"],
    objectives: ["bbox/mask 중심에서 grasp 후보를 만든다.", "pixel grasp를 3D point로 변환해야 함을 설명한다.", "approach vector와 gripper opening을 구분한다."],
    definition: "Grasp planning은 perception 결과에서 end-effector가 접근할 위치, 방향, gripper opening을 고르는 문제다.",
    whyItMatters: "물체를 잡는 작업은 detection box가 아니라 grasp pose와 collision-free approach가 필요하다.",
    intuition: "물체 영역의 가운데를 잡되, 얼마나 벌리고 어느 방향에서 들어갈지까지 정하는 과정이다.",
    equations: [
      { label: "Mask centroid", expression: "c=\\frac{1}{|M|}\\sum_{p\\in M}p", terms: [["M", "object mask"]], explanation: "grasp 중심 후보의 첫 근사다." },
      { label: "Back projection", expression: "P=ZK^{-1}[u,v,1]^T", terms: [["P", "3D grasp point"]], explanation: "pixel 후보를 camera frame 3D point로 바꾼다." },
      { label: "Approach pose", expression: "T_{grasp}=[R_{approach}|P]", terms: [["R", "gripper orientation"]], explanation: "위치와 방향을 함께 표현해야 MoveIt pose goal이 된다." },
    ],
    derivation: [["mask/bbox", "object region을 찾는다."], ["center", "centroid 또는 medial axis에서 후보 중심을 고른다."], ["depth", "해당 pixel depth로 3D point를 만든다."], ["orientation", "surface normal 또는 heuristic approach를 붙인다."]],
    handCalculation: { problem: "bbox=(40,30,60,40)이면 중심 pixel은?", given: { bbox: "(40,30,60,40)" }, steps: ["x=40+60/2=70", "y=30+40/2=50"], answer: "(70,50)" },
    robotApplication: "Mask R-CNN/SAM mask와 depth camera를 결합해 grasp 후보를 만들고, MoveIt collision check로 안전한 후보만 실행한다.",
    lab: graspLab,
    visualization: { id: "vis_grasp_pose_sampling", title: "Grasp Pose Candidate from Mask", equation: "P=ZK^{-1}p", parameters: [{ name: "bbox_width", symbol: "w", min: 20, max: 160, default: 60, description: "bbox width px" }, { name: "depth", symbol: "Z", min: 0.3, max: 2, default: 0.8, description: "depth meter" }], normalCase: "mask 중심과 depth가 안정적이면 grasp candidate가 물체 중심에 놓인다.", failureCase: "mask가 배경을 포함하면 grasp center가 물체 밖으로 밀린다." },
    quiz: quiz("grasp_sampling", "Grasp pose sampling", "P=ZK^{-1}p", "center_px = (x + w / 2, y + h / 2)"),
    wrongTagLabel: "Grasp pose sampling 오류",
    nextSessions: ["ros2_control_pid_hardware_loop", "robot_foundation_model_deployment"],
  }),
];

export const aPlusCppRobotSessions: Session[] = [
  makeAdvancedSession({
    id: "cpp_eigen_ik_2link",
    part: "Part C++. C++ 로봇SW 기초",
    title: "C++ Eigen 2-link IK와 FK 검산",
    prerequisites: ["cpp_eigen_fk_jacobian", "inverse_kinematics"],
    objectives: ["C++ Eigen::Vector2d로 analytic IK를 구현한다.", "workspace 밖 target을 예외 처리한다.", "IK 결과를 FK로 검산한다."],
    definition: "C++ analytic IK는 목표 말단 위치에서 관절각을 닫힌형 수식으로 구하고 실시간 제어 코드에서 빠르게 실행하는 방법이다.",
    whyItMatters: "MoveIt plugin과 embedded controller 코드는 C++로 작성되므로 Python IK 이해를 Eigen 코드로 옮겨야 한다.",
    intuition: "목표점과 두 링크가 만드는 삼각형을 풀어 elbow angle과 shoulder angle을 찾는 것이다.",
    equations: [
      { label: "Cosine law", expression: "\\cos q_2=(x^2+y^2-l_1^2-l_2^2)/(2l_1l_2)", terms: [["q2", "elbow angle"]], explanation: "두 링크와 목표 거리 삼각형에서 나온다." },
      { label: "Shoulder angle", expression: "q_1=atan2(y,x)-atan2(l_2\\sin q_2,l_1+l_2\\cos q_2)", terms: [["q1", "shoulder angle"]], explanation: "목표 방향에서 elbow triangle offset을 뺀다." },
      { label: "Reachability", expression: "|l_1-l_2|\\le r\\le l_1+l_2", terms: [["r", "target distance"]], explanation: "workspace 밖 target은 해가 없다." },
    ],
    derivation: [["distance", "r^2=x^2+y^2를 계산한다."], ["q2", "cosine law로 elbow angle을 구한다."], ["q1", "target bearing에서 elbow offset을 뺀다."], ["verify", "FK(q)를 다시 계산해 target과 비교한다."]],
    handCalculation: { problem: "l1=1,l2=0.7,target=(1,0.7)이면 cos(q2)는?", given: { r2: 1.49 }, steps: ["cos q2=(1.49-1-0.49)/(1.4)=0"], answer: "q2=pi/2" },
    robotApplication: "산업용 pick-place에서 target pose가 반복되는 경우 analytic IK는 numerical IK보다 빠르고 deterministic하다.",
    lab: cppEigenIkLab,
    visualization: { id: "vis_cpp_eigen_ik", title: "C++ Eigen IK Workspace", equation: "cos(q2)=...", parameters: [{ name: "target_x", symbol: "x", min: -1.7, max: 1.7, default: 1.0, description: "target x" }, { name: "target_y", symbol: "y", min: -1.7, max: 1.7, default: 0.7, description: "target y" }], normalCase: "target이 annulus workspace 안이면 두 IK branch가 존재한다.", failureCase: "workspace 밖 target은 acos domain error가 아니라 unreachable 예외로 처리한다." },
    quiz: quiz("cpp_eigen_ik", "C++ Eigen IK", "cos(q2)=...", "return Eigen::Vector2d(q1, q2);"),
    wrongTagLabel: "C++ Eigen IK 오류",
    nextSessions: ["ros2_control_pid_hardware_loop", "trajectory_quintic_time_scaling"],
  }),
];

export const aPlusControlSessions: Session[] = [
  makeAdvancedSession({
    id: "impedance_control_1d_contact",
    part: "Part 3. 로봇 동역학과 제어",
    title: "Impedance/Admittance Control 기초: 1D 접촉 응답",
    prerequisites: ["pid_control_v2", "ode_euler_rk4"],
    objectives: ["impedance control 식을 mass-spring-damper로 해석한다.", "stiffness/damping 변화가 접촉 힘 응답에 미치는 영향을 시뮬레이션한다.", "force-sensitive 작업에서 PID와 다른 목표를 설명한다."],
    definition: "Impedance control은 로봇이 외부 힘에 대해 원하는 질량-댐퍼-스프링처럼 반응하도록 만드는 접촉 제어 방법이다.",
    whyItMatters: "조립, polishing, peg-in-hole처럼 접촉이 필요한 작업은 위치만 정확히 따라가는 PID보다 힘에 순응하는 제어가 필요하다.",
    intuition: "딱딱한 막대가 아니라 적절히 눌리는 스프링처럼 로봇이 환경과 상호작용하게 만드는 것이다.",
    equations: [
      { label: "Impedance", expression: "M\\ddot x+B\\dot x+K(x-x_d)=F_{ext}", terms: [["K", "stiffness"], ["B", "damping"]], explanation: "외력에 대한 변위 응답을 설계한다." },
      { label: "Steady displacement", expression: "x_{ss}=F_{ext}/K", terms: [["x_ss", "steady deflection"]], explanation: "stiffness가 클수록 같은 힘에서 덜 밀린다." },
      { label: "Damping ratio", expression: "\\zeta=B/(2\\sqrt{MK})", terms: [["ζ", "damping ratio"]], explanation: "진동/과감쇠를 가르는 지표다." },
    ],
    derivation: [["model", "접촉 방향 1D 동역학을 둔다."], ["force balance", "외력과 spring/damper/inertia 항을 균형시킨다."], ["integrate", "ODE로 x,v를 시뮬레이션한다."], ["tune", "K,B로 compliance와 overshoot를 조절한다."]],
    handCalculation: { problem: "F=1N,K=25N/m이면 steady displacement는?", given: { F: 1, K: 25 }, steps: ["x=F/K=1/25"], answer: "0.04m" },
    robotApplication: "협동로봇이 표면을 닦거나 부품을 끼울 때 force/torque sensor와 impedance control로 과도한 접촉 힘을 줄인다.",
    lab: impedanceLab,
    visualization: { id: "vis_impedance_contact_response", title: "Impedance Contact Response", equation: "Mxdd+Bxd+Kx=F", parameters: [{ name: "stiffness", symbol: "K", min: 5, max: 80, default: 25, description: "stiffness N/m" }, { name: "damping", symbol: "B", min: 0.1, max: 20, default: 4, description: "damping Ns/m" }], normalCase: "적절한 damping이면 힘에 순응하면서 진동이 작다.", failureCase: "damping이 너무 작으면 접촉 후 진동한다." },
    quiz: quiz("impedance", "Impedance control", "x=F/K", "a = (F_ext - B*v - K*x) / M"),
    wrongTagLabel: "Impedance/admittance control 오류",
    nextSessions: ["ros2_control_pid_hardware_loop", "force_torque_filtering"],
  }),
];

export const aPlusDrivingSessions: Session[] = [
  makeAdvancedSession({
    id: "rrt_2d_motion_planning",
    part: "Part 4. 자율주행과 SLAM",
    title: "RRT 경로계획: Sampling-based Motion Planning",
    prerequisites: ["path_planning_astar", "dwa_obstacle_avoidance"],
    objectives: ["RRT의 sample-nearest-steer 구조를 설명한다.", "A*와 RRT가 유리한 공간 차이를 비교한다.", "tree parent 역추적으로 path를 만든다."],
    definition: "RRT는 연속 공간에서 random sample을 향해 tree를 확장해 feasible path를 찾는 sampling-based planner다.",
    whyItMatters: "MoveIt/OMPL의 로봇팔 motion planning은 고차원 joint space에서 RRT 계열 planner를 많이 사용한다.",
    intuition: "미로 안에서 나무가 랜덤 방향으로 가지를 뻗다가 목표 근처에 닿으면 그 가지들을 따라 경로를 얻는 방식이다.",
    equations: [
      { label: "Nearest", expression: "q_{near}=argmin_q\\|q-q_{rand}\\|", terms: [["q_rand", "random sample"]], explanation: "tree에서 sample에 가장 가까운 node를 찾는다." },
      { label: "Steer", expression: "q_{new}=q_{near}+\\eta\\frac{q_{rand}-q_{near}}{\\|q_{rand}-q_{near}\\|}", terms: [["η", "step size"]], explanation: "한 번에 너무 멀리 확장하지 않는다." },
      { label: "Goal test", expression: "\\|q_{new}-q_{goal}\\|<\\epsilon", terms: [["ε", "goal radius"]], explanation: "목표 근처에 도달했는지 확인한다." },
    ],
    derivation: [["sample", "free space에서 random state를 뽑는다."], ["nearest", "기존 tree node 중 가장 가까운 점을 찾는다."], ["steer", "step size만큼 새 node를 만든다."], ["collision", "edge가 장애물을 통과하지 않으면 tree에 추가한다."]],
    handCalculation: { problem: "q_near=(0,0), q_rand=(1,0), step=0.25이면 q_new는?", given: { step: 0.25 }, steps: ["방향은 +x", "0.25만 이동"], answer: "(0.25,0)" },
    robotApplication: "6DOF 팔의 joint space는 격자로 만들기 어렵기 때문에 A*보다 RRT/PRM 같은 sampling planner가 실용적이다.",
    lab: rrtLab,
    visualization: { id: "vis_rrt_tree_growth", title: "RRT Tree Growth", equation: "nearest + steer", parameters: [{ name: "step", symbol: "\\eta", min: 0.05, max: 0.5, default: 0.25, description: "extension step" }, { name: "samples", symbol: "N", min: 10, max: 500, default: 80, description: "sample count" }], normalCase: "step이 적절하면 장애물을 피해 목표까지 tree가 성장한다.", failureCase: "step이 너무 크면 collision edge가 많아지고 좁은 통로를 놓친다." },
    quiz: quiz("rrt", "RRT motion planning", "q_new=q_near+eta*dir", "new = steer(nearest, sample, step)"),
    wrongTagLabel: "RRT sampling planner 오류",
    nextSessions: ["grasp_pose_sampling_basics", "pose_graph_slam_backend"],
  }),
];

export const aPlusVisionSessions: Session[] = [
  makeAdvancedSession({
    id: "stereo_calibration_epipolar_geometry",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "Stereo Calibration 기초: Baseline과 Epipolar Residual",
    prerequisites: ["depth_estimation_stereo_geometry", "opencv_threshold_contour_basics"],
    objectives: ["baseline이 depth scale을 결정함을 설명한다.", "rectified stereo에서 y residual을 계산한다.", "checkerboard corner 순서 오류를 진단한다."],
    definition: "Stereo calibration은 두 카메라의 intrinsics/extrinsics를 추정해 disparity가 정확한 depth로 변환되게 만드는 과정이다.",
    whyItMatters: "캘리브레이션이 틀리면 depth map 전체 scale이 틀어져 grasp/collision 위치가 위험해진다.",
    intuition: "두 눈의 거리와 정렬 상태를 정확히 알아야 가까운 물체와 먼 물체를 구분할 수 있다.",
    equations: [
      { label: "Baseline from depth", expression: "B=Zd/f", terms: [["B", "baseline"], ["d", "disparity"]], explanation: "known depth target으로 baseline sanity를 확인한다." },
      { label: "Epipolar residual", expression: "e_y=|y_L-y_R|", terms: [["yL,yR", "rectified image y coordinates"]], explanation: "rectification 후 y좌표가 같아야 한다." },
      { label: "Depth scale", expression: "Z=fB/d", terms: [["B", "baseline"]], explanation: "baseline 오차는 depth scale 오차로 직결된다." },
    ],
    derivation: [["corner detect", "좌우 checkerboard corner를 같은 순서로 찾는다."], ["intrinsics", "각 카메라 K,D를 추정한다."], ["extrinsics", "R,T baseline을 추정한다."], ["rectify", "epipolar line을 수평으로 맞춘다."]],
    handCalculation: { problem: "f=500,Z=2,d=25이면 B는?", given: { f: 500, Z: 2, d: 25 }, steps: ["B=Zd/f=2*25/500"], answer: "0.1m" },
    robotApplication: "ZED/RealSense stereo를 쓸 때 factory calibration을 신뢰하더라도 robot cell에서 checkerboard로 depth scale sanity check를 해야 한다.",
    lab: stereoCalibLab,
    visualization: { id: "vis_stereo_epipolar_residual", title: "Stereo Epipolar Residual", equation: "e_y=|yL-yR|", parameters: [{ name: "baseline_cm", symbol: "B", min: 3, max: 20, default: 10, description: "baseline cm" }, { name: "y_error", symbol: "e_y", min: 0, max: 10, default: 1, description: "epipolar y residual px" }], normalCase: "rectification이 맞으면 좌우 점의 y residual이 작다.", failureCase: "corner 순서가 뒤섞이면 residual과 depth scale이 크게 틀어진다." },
    quiz: quiz("stereo_calib", "Stereo calibration", "B=Zd/f", "baseline = depth_m * disparity_px / focal_px"),
    wrongTagLabel: "Stereo calibration 오류",
    nextSessions: ["depth_estimation_stereo_geometry", "grasp_pose_sampling_basics"],
  }),
  makeAdvancedSession({
    id: "semantic_segmentation_training_loss",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "Semantic Segmentation 학습: Per-pixel CE와 Class Weight",
    prerequisites: ["semantic_segmentation_basics", "cnn_conv2d_feature_map"],
    objectives: ["per-pixel cross entropy를 구현한다.", "class imbalance에 class weight가 필요한 이유를 설명한다.", "Dice loss와 CE의 역할 차이를 비교한다."],
    definition: "Segmentation training은 모든 pixel을 class classification 문제로 보고 loss를 평균해 CNN decoder를 학습하는 과정이다.",
    whyItMatters: "작은 물체나 안전 영역은 pixel 비율이 작아 CE만 쓰면 배경에 치우친 모델이 높은 accuracy처럼 보일 수 있다.",
    intuition: "이미지 전체를 수많은 작은 분류 문제로 쪼개고, 희귀 class는 더 큰 벌점을 주어 모델이 무시하지 못하게 한다.",
    equations: [
      { label: "Pixel CE", expression: "L=-\\frac{1}{N}\\sum_i \\log p_{i,y_i}", terms: [["p", "softmax probability"]], explanation: "정답 class 확률이 낮으면 loss가 커진다." },
      { label: "Weighted CE", expression: "L=-\\frac{1}{N}\\sum_i w_{y_i}\\log p_{i,y_i}", terms: [["w", "class weight"]], explanation: "희귀 class pixel의 손실 가중치를 키운다." },
      { label: "Softmax", expression: "p_c=e^{z_c}/\\sum_k e^{z_k}", terms: [["z", "logit"]], explanation: "pixel별 class score를 확률로 바꾼다." },
    ],
    derivation: [["logits", "decoder가 HxWxC score map을 낸다."], ["softmax", "각 pixel마다 class 확률을 만든다."], ["gather", "정답 class 확률 p_y를 뽑는다."], ["weight", "class weight를 곱해 평균한다."]],
    handCalculation: { problem: "p_y=0.8, weight=2이면 weighted CE는?", given: { p: 0.8, w: 2 }, steps: ["L=-2 log(0.8)", "log(0.8)≈-0.223"], answer: "0.446" },
    robotApplication: "사람/장애물처럼 작은 safety class를 놓치면 치명적이므로 segmentation loss에서 class imbalance를 반드시 확인한다.",
    lab: segTrainLab,
    visualization: { id: "vis_segmentation_training_loss", title: "Segmentation CE / Class Weight", equation: "L=-w_y log p_y", parameters: [{ name: "foreground_ratio", symbol: "r", min: 0.01, max: 0.5, default: 0.1, description: "foreground pixel ratio" }, { name: "class_weight", symbol: "w", min: 1, max: 20, default: 5, description: "foreground class weight" }], normalCase: "희귀 class weight가 적절하면 foreground recall이 올라간다.", failureCase: "weight가 너무 크면 false positive mask가 늘어난다." },
    quiz: quiz("seg_train", "Segmentation training loss", "L=-w log p", "loss = -weights * np.log(p)"),
    wrongTagLabel: "Segmentation CE/class weight 오류",
    nextSessions: ["grasp_pose_sampling_basics", "robot_foundation_model_deployment"],
  }),
  makeAdvancedSession({
    id: "point_cloud_icp_registration",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "Point Cloud Registration 기초: 2D ICP와 SVD 정합",
    prerequisites: ["depth_estimation_stereo_geometry", "svd_jacobian_condition_number"],
    objectives: ["point cloud registration 문제를 설명한다.", "SVD로 rigid transform을 추정한다.", "ICP nearest-neighbor loop의 실패 조건을 이해한다."],
    definition: "Point cloud registration은 두 점군 사이의 회전/이동 변환을 찾아 같은 물체나 장면을 정렬하는 문제다.",
    whyItMatters: "RGB-D 물체 인식, SLAM scan matching, grasp pose refinement에서 point cloud 정합이 자주 쓰인다.",
    intuition: "두 점 구름의 중심을 맞추고, 가장 비슷하게 겹치도록 돌린 뒤, 남은 이동을 더하는 과정이다.",
    equations: [
      { label: "Centering", expression: "\\bar A=A-\\mu_A,\\;\\bar B=B-\\mu_B", terms: [["μ", "centroid"]], explanation: "translation을 제거하고 rotation만 추정한다." },
      { label: "SVD alignment", expression: "H=\\bar A^T\\bar B=U\\Sigma V^T,\\;R=VU^T", terms: [["H", "cross covariance"]], explanation: "최소제곱 rigid rotation을 구한다." },
      { label: "Translation", expression: "t=\\mu_B-R\\mu_A", terms: [["t", "translation"]], explanation: "회전 후 centroid를 맞춘다." },
    ],
    derivation: [["associate", "A와 B의 대응점을 정한다."], ["center", "centroid를 빼 translation을 제거한다."], ["SVD", "cross covariance로 best-fit rotation을 구한다."], ["iterate", "ICP는 association과 transform estimation을 반복한다."]],
    handCalculation: { problem: "A가 B=A+[1,2]라면 R,t는?", given: { shift: "[1,2]" }, steps: ["회전 없음 R=I", "translation=[1,2]"], answer: "R=I, t=[1,2]" },
    robotApplication: "물체 CAD point cloud와 depth camera point cloud를 정합하면 grasp pose를 더 정확히 보정할 수 있다.",
    lab: icpLab,
    visualization: { id: "vis_icp_registration", title: "ICP Point Cloud Registration", equation: "R=VU^T", parameters: [{ name: "rotation_deg", symbol: "\\theta", min: -45, max: 45, default: 10, description: "initial rotation error" }, { name: "noise", symbol: "\\sigma", min: 0, max: 0.1, default: 0.02, description: "point noise" }], normalCase: "초기 오차가 작고 overlap이 충분하면 ICP가 수렴한다.", failureCase: "대칭 물체나 잘못된 대응점에서는 local minimum에 빠진다." },
    quiz: quiz("icp_registration", "Point cloud ICP registration", "R=VU^T", "U, _, Vt = np.linalg.svd(AA.T @ BB)"),
    wrongTagLabel: "ICP/SVD registration 오류",
    nextSessions: ["pose_estimation_pnp_6d", "grasp_pose_sampling_basics"],
  }),
];

export const aPlusRos2Sessions: Session[] = [
  makeAdvancedSession({
    id: "ros2_package_build_ament_cmake",
    part: "Part 6. ROS2 실전 연결",
    title: "ROS2 C++ Package Build: package.xml과 CMakeLists",
    prerequisites: ["ros2_subscriber_pub_loop", "ros2_control_pid_hardware_loop"],
    objectives: ["ament_cmake package 구조를 설명한다.", "package.xml 의존성과 CMake find_package를 맞춘다.", "install target 누락이 ros2 run 실패로 이어짐을 이해한다."],
    definition: "ROS2 C++ 패키지는 package.xml, CMakeLists.txt, src 노드 파일을 colcon build로 묶어 실행 가능한 단위로 만드는 구조다.",
    whyItMatters: "단일 cpp 파일을 컴파일하는 것과 실제 ROS2 node를 배포하는 것은 다르다. package manifest와 install 규칙을 알아야 ros2 run이 된다.",
    intuition: "소스 파일은 부품이고, package.xml/CMakeLists는 조립 설명서다. 둘 중 하나라도 빠지면 colcon이 실행 파일을 찾지 못한다.",
    equations: [
      { label: "Build dependency", expression: "package.xml depend \\leftrightarrow find_package()", terms: [["depend", "runtime/build dependency"]], explanation: "manifest와 CMake 의존성을 맞춘다." },
      { label: "Install path", expression: "install(TARGETS node DESTINATION lib/${PROJECT_NAME})", terms: [["lib/pkg", "ros2 run search path"]], explanation: "설치 규칙이 있어야 ros2 run이 executable을 찾는다." },
      { label: "Build command", expression: "colcon build --packages-select pkg", terms: [["pkg", "package name"]], explanation: "특정 패키지만 빌드해 피드백을 빠르게 한다." },
    ],
    derivation: [["create", "ros2 pkg create --build-type ament_cmake로 뼈대를 만든다."], ["dependencies", "package.xml과 CMakeLists에 rclcpp/msg 의존성을 추가한다."], ["target", "add_executable과 ament_target_dependencies를 작성한다."], ["install", "install(TARGETS...) 후 colcon build와 source install/setup.bash를 실행한다."]],
    handCalculation: { problem: "CMake에 install(TARGETS)가 없으면 ros2 run은?", given: { install: "missing" }, steps: ["빌드는 될 수 있다.", "install space에 executable이 없다."], answer: "ros2 run에서 실행 파일을 찾지 못한다." },
    robotApplication: "카메라 subscriber, controller bridge, safety node를 실제 로봇 PC에 배포하려면 모두 ament_cmake 패키지로 관리해야 한다.",
    lab: ros2PackageLab,
    visualization: { id: "vis_ros2_package_build", title: "ROS2 Package Build Pipeline", equation: "src -> colcon -> install -> ros2 run", parameters: [{ name: "dependencies", symbol: "D", min: 1, max: 8, default: 3, description: "dependency count" }, { name: "build_errors", symbol: "E", min: 0, max: 5, default: 0, description: "missing manifest/cmake errors" }], normalCase: "manifest, CMake, install이 일치하면 colcon build 후 ros2 run이 된다.", failureCase: "의존성/설치 규칙이 빠지면 빌드 또는 실행 단계에서 실패한다." },
    quiz: quiz("ros2_pkg", "ROS2 ament_cmake package", "colcon build", "ament_target_dependencies(range_follow_node rclcpp geometry_msgs)"),
    wrongTagLabel: "ROS2 package/CMake 오류",
    nextSessions: ["ros2_subscriber_pub_loop", "safety_watchdog_timer"],
  }),
  makeAdvancedSession({
    id: "urdf_joint_parser_basics",
    part: "Part 6. ROS2 실전 연결",
    title: "URDF Parsing 기초: Joint Tree와 Controller Joint List",
    prerequisites: ["robot_math_homogeneous_transform_se3", "ros2_package_build_ament_cmake"],
    objectives: ["URDF joint/link tree를 읽는다.", "fixed joint와 controllable joint를 구분한다.", "controller YAML joint list mismatch를 진단한다."],
    definition: "URDF는 로봇의 link, joint, inertial, collision, visual 정보를 XML로 표현하는 ROS 표준 robot description이다.",
    whyItMatters: "MoveIt, robot_state_publisher, ros2_control은 모두 URDF joint 이름과 구조에 의존한다.",
    intuition: "URDF는 로봇의 족보와 관절 명단이다. 제어 가능한 관절과 고정된 연결을 구분해야 controller가 제대로 움직인다.",
    equations: [
      { label: "Kinematic chain", expression: "T_{base,ee}=\\prod_i T_i(q_i)", terms: [["T_i", "URDF joint transform"]], explanation: "URDF joint tree가 FK 곱 순서를 정한다." },
      { label: "Controllable joint set", expression: "J_c={j|type(j)\\in\\{revolute,continuous,prismatic\\}}", terms: [["Jc", "controller joint list"]], explanation: "fixed joint는 controller command 대상이 아니다." },
      { label: "Name contract", expression: "controller.joints \\subseteq URDF.joints", terms: [["joints", "string identifiers"]], explanation: "이름 mismatch는 controller startup failure로 이어진다." },
    ],
    derivation: [["parse XML", "robot root에서 joint element를 찾는다."], ["filter type", "revolute/continuous/prismatic만 제어 가능으로 분류한다."], ["chain", "parent/child link로 base부터 ee까지 순서를 만든다."], ["YAML", "controller joint list와 URDF 이름을 비교한다."]],
    handCalculation: { problem: "URDF에 revolute 2개, fixed 1개면 position controller joint 수는?", given: { revolute: 2, fixed: 1 }, steps: ["fixed는 command 대상 아님", "revolute 2개만 포함"], answer: "2개" },
    robotApplication: "ros2_control controller가 configure 단계에서 joint를 못 찾으면 URDF transmission, hardware interface, YAML joint name을 함께 확인해야 한다.",
    lab: urdfParserLab,
    visualization: { id: "vis_urdf_joint_tree", title: "URDF Joint Tree", equation: "T_base_ee=prod T_i", parameters: [{ name: "joint_count", symbol: "N", min: 1, max: 12, default: 6, description: "joint count" }, { name: "fixed_count", symbol: "F", min: 0, max: 5, default: 1, description: "fixed joints" }], normalCase: "controller joint list가 controllable URDF joints와 일치한다.", failureCase: "fixed joint나 오타가 joint list에 들어가면 controller configure가 실패한다." },
    quiz: quiz("urdf_parser", "URDF joint parser", "controller.joints subset URDF.joints", "root.findall('joint')"),
    wrongTagLabel: "URDF/controller joint list 오류",
    nextSessions: ["cpp_eigen_ik_2link", "ros2_control_pid_hardware_loop"],
  }),
];

export const aPlusPhysicalAISessions: Session[] = [
  makeAdvancedSession({
    id: "attention_mechanism_vla_basics",
    part: "Part 7. Physical AI / Embodied AI",
    title: "Attention Mechanism 기초: VLA Action Context 읽기",
    prerequisites: ["vla_architecture_concepts", "backprop_chain_rule_numpy"],
    objectives: ["scaled dot-product attention을 구현한다.", "query/key/value shape를 설명한다.", "attention heatmap을 action grounding 관점에서 해석한다."],
    definition: "Attention은 query가 여러 token key와 얼마나 관련 있는지 softmax weight로 계산하고 value를 가중합하는 연산이다.",
    whyItMatters: "VLA와 transformer policy는 언어 명령과 이미지 token 중 어느 부분이 action에 영향을 주는지 attention으로 연결한다.",
    intuition: "로봇이 명령을 수행할 때 이미지의 모든 부분을 똑같이 보지 않고, 현재 action에 중요한 token에 시선을 더 주는 방식이다.",
    equations: [
      { label: "Attention", expression: "A=softmax(QK^T/\\sqrt d)", terms: [["Q,K", "query/key"]], explanation: "token 관련도를 확률 weight로 만든다." },
      { label: "Context", expression: "C=AV", terms: [["V", "value tokens"]], explanation: "중요도에 따라 value를 가중합한다." },
      { label: "Scaling", expression: "1/\\sqrt d", terms: [["d", "key dimension"]], explanation: "dimension이 커져도 logits scale을 안정화한다." },
    ],
    derivation: [["score", "query와 key dot product를 계산한다."], ["scale", "sqrt(d)로 나누어 softmax saturation을 줄인다."], ["softmax", "token별 weight 합이 1이 되게 한다."], ["weighted sum", "value token을 weight로 합쳐 context를 만든다."]],
    handCalculation: { problem: "weights=[0.7,0.3], values=[1,3]이면 context는?", given: { weights: "[0.7,0.3]" }, steps: ["0.7*1+0.3*3=1.6"], answer: "1.6" },
    robotApplication: "VLA action이 잘못된 물체를 향할 때 attention map을 보면 언어 token과 visual token grounding이 어디서 어긋났는지 단서를 얻을 수 있다.",
    lab: attentionLab,
    visualization: { id: "vis_attention_heatmap_vla", title: "Attention Heatmap for VLA Tokens", equation: "softmax(QK^T/sqrt(d))", parameters: [{ name: "temperature", symbol: "T", min: 0.1, max: 2, default: 1, description: "attention temperature" }, { name: "d_model", symbol: "d", min: 2, max: 128, default: 32, description: "key dimension" }], normalCase: "명령과 관련된 object token에 weight가 집중된다.", failureCase: "attention이 배경 token에 집중되면 action grounding 실패 가능성이 크다." },
    quiz: quiz("attention_vla", "Scaled dot-product attention", "softmax(QK^T/sqrt(d))", "weights = np.exp(scores) / np.sum(np.exp(scores), axis=-1, keepdims=True)"),
    wrongTagLabel: "Attention/token grounding 오류",
    nextSessions: ["robot_foundation_model_deployment", "world_model_dreamer_overview"],
  }),
];
