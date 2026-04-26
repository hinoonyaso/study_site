import type { Session } from "../types";
import {
  ensureCodeLabShape,
  makeCoreQuizzes,
  makeEquation,
  makeVisualization,
  makeWrongTags,
  session,
  step,
} from "./v2SessionHelpers";

const eigenFKLab = ensureCodeLabShape({
  id: "lab_cpp_eigen_fk_2link",
  title: "C++ Eigen: 2-link FK with Homogeneous Transform",
  language: "cpp",
  theoryConnection: "T = T01 * T12, T_i = [R | p; 0 | 1]",
  starterCode: `#include <Eigen/Dense>
#include <cmath>
#include <iostream>
#include <stdexcept>

using Eigen::Matrix4d;
using Eigen::Vector3d;

// Eigen 설치: sudo apt install libeigen3-dev
// 컴파일: g++ -std=c++17 -I/usr/include/eigen3 eigen_fk.cpp -o eigen_fk

Matrix4d make_transform(double theta, double dx, double dy) {
    // TODO: z축 회전 theta와 local 이동 (dx, dy)를 4x4 동차변환으로 만든다.
    // local 이동은 회전된 frame 기준이므로 translation도 R*[dx,dy]로 들어간다.
    throw std::runtime_error("implement make_transform");
}

Vector3d forward_kinematics_2link(double q1, double q2, double l1, double l2) {
    // TODO: T01 * T12를 곱해서 end-effector의 x, y 좌표를 계산한다.
    throw std::runtime_error("implement FK");
}

int main() {
    double q1 = M_PI / 6.0;
    double q2 = M_PI / 4.0;
    double l1 = 1.0, l2 = 0.7;
    Vector3d ee = forward_kinematics_2link(q1, q2, l1, l2);
    std::cout << "End-effector: ("
              << std::round(ee.x() * 1000) / 1000 << ", "
              << std::round(ee.y() * 1000) / 1000 << ")" << std::endl;
    return 0;
}`,
  solutionCode: `#include <Eigen/Dense>
#include <cmath>
#include <iostream>
#include <stdexcept>

using Eigen::Matrix4d;
using Eigen::Vector3d;

Matrix4d make_transform(double theta, double dx, double dy) {
    const double c = std::cos(theta);
    const double s = std::sin(theta);
    Matrix4d T = Matrix4d::Identity();
    T(0, 0) = c;
    T(0, 1) = -s;
    T(1, 0) = s;
    T(1, 1) = c;
    T(0, 3) = c * dx - s * dy;
    T(1, 3) = s * dx + c * dy;
    return T;
}

Vector3d forward_kinematics_2link(double q1, double q2, double l1, double l2) {
    Matrix4d T01 = make_transform(q1, l1, 0.0);
    Matrix4d T12 = make_transform(q2, l2, 0.0);
    Matrix4d T02 = T01 * T12;
    return Vector3d(T02(0, 3), T02(1, 3), 0.0);
}

int main() {
    double q1 = M_PI / 6.0;
    double q2 = M_PI / 4.0;
    double l1 = 1.0, l2 = 0.7;
    Vector3d ee = forward_kinematics_2link(q1, q2, l1, l2);
    std::cout << "End-effector: ("
              << std::round(ee.x() * 1000) / 1000 << ", "
              << std::round(ee.y() * 1000) / 1000 << ")" << std::endl;
    return 0;
}`,
  testCode: `#include <Eigen/Dense>
#include <cassert>
#include <cmath>
#include <iostream>

using Eigen::Matrix4d;
using Eigen::Vector3d;

Matrix4d make_transform(double theta, double dx, double dy) {
    const double c = std::cos(theta);
    const double s = std::sin(theta);
    Matrix4d T = Matrix4d::Identity();
    T(0, 0) = c;
    T(0, 1) = -s;
    T(1, 0) = s;
    T(1, 1) = c;
    T(0, 3) = c * dx - s * dy;
    T(1, 3) = s * dx + c * dy;
    return T;
}

Vector3d forward_kinematics_2link(double q1, double q2, double l1, double l2) {
    Matrix4d T01 = make_transform(q1, l1, 0.0);
    Matrix4d T12 = make_transform(q2, l2, 0.0);
    Matrix4d T02 = T01 * T12;
    return Vector3d(T02(0, 3), T02(1, 3), 0.0);
}

int main() {
    auto ee1 = forward_kinematics_2link(0.0, 0.0, 1.0, 0.7);
    assert(std::abs(ee1.x() - 1.7) < 1e-9);
    assert(std::abs(ee1.y()) < 1e-9);

    auto ee2 = forward_kinematics_2link(M_PI / 2.0, 0.0, 1.0, 0.7);
    assert(std::abs(ee2.x()) < 1e-9);
    assert(std::abs(ee2.y() - 1.7) < 1e-9);

    auto ee3 = forward_kinematics_2link(0.0, M_PI, 1.0, 1.0);
    assert(std::abs(ee3.x()) < 1e-9);
    assert(std::abs(ee3.y()) < 1e-9);

    std::cout << "All FK tests passed!" << std::endl;
    return 0;
}`,
  expectedOutput: "End-effector: (1.047, 1.176)",
  runCommand: "g++ -std=c++17 -I/usr/include/eigen3 eigen_fk.cpp -o eigen_fk && ./eigen_fk",
  commonBugs: [
    "T01 * T12를 T12 * T01로 바꿔 좌표 변환 순서가 틀림",
    "local translation을 회전시키지 않아 FK가 l1+l2*cos(q2) 형태로 틀어짐",
    "T(0,3), T(1,3)이 아니라 T(3,0), T(3,1)에 이동을 씀",
    "degree를 radian으로 변환하지 않고 cos/sin에 넣음",
  ],
  extensionTask:
    "3-link로 확장하고 Eigen::Matrix<double,2,3> Jacobian을 중앙차분으로 계산하라.",
});

export const cppEigenSessions: Session[] = [
  session({
    id: "cpp_eigen_fk_jacobian",
    part: "Part C++. C++ 로봇SW 기초",
    title: "C++ Eigen으로 FK와 동차변환 구현",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 90,
    prerequisites: ["robot_math_forward_kinematics", "robot_math_homogeneous_transform_se3", "pid_control_v2"],
    learningObjectives: [
      "Eigen::Matrix4d로 4x4 동차변환행렬을 만든다.",
      "local translation convention을 지켜 T01*T12로 2-link FK를 계산한다.",
      "g++ -std=c++17 -I/usr/include/eigen3로 컴파일하고 실행한다.",
      "Python FK 수식과 C++ Eigen FK 결과를 같은 입력으로 검산한다.",
    ],
    theory: {
      definition:
        "Eigen은 C++에서 행렬과 벡터 연산을 빠르게 수행하는 헤더 전용 선형대수 라이브러리다. ROS2, MoveIt2, Pinocchio 같은 로봇 소프트웨어에서 광범위하게 쓰인다.",
      whyItMatters:
        "Python으로 이해한 FK/Jacobian을 실제 1kHz 제어 루프와 ROS2 node에 넣으려면 C++ Eigen 구현 능력이 필요하다.",
      intuition:
        "NumPy의 4x4 행렬을 C++에서는 Eigen::Matrix4d로 쓰는 것이다. Python의 A @ B는 Eigen에서 A * B이고, translation column은 T(0,3), T(1,3), T(2,3)에 있다.",
      equations: [
        makeEquation(
          "동차변환행렬",
          "T = \\begin{bmatrix} R & p \\\\ 0 & 1 \\end{bmatrix}",
          [
            ["R", "회전행렬"],
            ["p", "이동 벡터"],
          ],
          "회전과 이동을 하나의 행렬 곱 체인으로 표현한다.",
        ),
        makeEquation(
          "2-link FK chain",
          "T_{02} = T_{01}T_{12}",
          [["T_ij", "i frame에서 j frame으로의 변환"]],
          "행렬 곱은 교환법칙이 성립하지 않으므로 순서가 중요하다.",
        ),
        makeEquation(
          "Planar FK",
          "x=l_1\\cos q_1+l_2\\cos(q_1+q_2), \\quad y=l_1\\sin q_1+l_2\\sin(q_1+q_2)",
          [
            ["q1,q2", "관절각"],
            ["l1,l2", "링크 길이"],
          ],
          "동차변환 곱이 올바르면 이 폐형식 FK와 같은 결과가 나온다.",
        ),
      ],
      derivation: [
        step("Eigen 헤더 포함", "#include <Eigen/Dense>와 using Eigen::Matrix4d를 선언한다."),
        step("단위행렬 초기화", "Matrix4d T = Matrix4d::Identity()로 시작한다."),
        step("회전 채우기", "T(0,0)=cosθ, T(0,1)=-sinθ, T(1,0)=sinθ, T(1,1)=cosθ를 넣는다."),
        step("local 이동 채우기", "translation은 R*[dx,dy]이므로 T(0,3)=c*dx-s*dy, T(1,3)=s*dx+c*dy이다."),
        step("체인 곱", "T02=T01*T12를 계산하고 마지막 열에서 위치를 읽는다."),
      ],
      handCalculation: {
        problem: "q1=0, q2=0, l1=1, l2=0.7이면 end-effector 위치는?",
        given: { q1: 0, q2: 0, l1: 1.0, l2: 0.7 },
        steps: ["첫 링크는 x방향 1.0m", "둘째 링크도 x방향 0.7m", "합은 x=1.7, y=0"],
        answer: "EE = (1.7, 0.0)",
      },
      robotApplication:
        "MoveIt2와 ros2_control의 kinematics/dynamics 경로는 Eigen 기반 행렬 연산을 사용한다. FK 결과는 geometry_msgs::msg::TransformStamped로 publish되거나 controller 내부 상태 계산에 들어간다.",
    },
    codeLabs: [eigenFKLab],
    visualizations: [
      makeVisualization(
        "vis_cpp_eigen_fk",
        "2-link FK End-effector 위치",
        "cpp_eigen_fk_jacobian",
        "T02 = T01 * T12",
        eigenFKLab.id,
        [
          { name: "q1_deg", symbol: "q_1", min: -180, max: 180, default: 30, description: "링크1 각도 (degree)" },
          { name: "q2_deg", symbol: "q_2", min: -180, max: 180, default: 45, description: "링크2 상대각 (degree)" },
        ],
        "FK 행렬 곱이 올바르면 EE가 폐형식 FK 위치와 일치한다.",
        "행렬 곱 순서나 translation convention이 틀리면 EE가 다른 위치에 놓인다.",
      ),
    ],
    quizzes: makeCoreQuizzes({
      id: "cpp_eigen_fk",
      conceptTag: "cpp_eigen_fk_jacobian",
      reviewSession: "C++ Eigen FK",
      conceptQuestion: "Eigen에서 4x4 단위행렬을 만드는 코드는?",
      conceptAnswer: "Matrix4d T = Matrix4d::Identity();",
      calculationQuestion: "q1=0, q2=0, l1=1, l2=0.7이면 EE 위치는?",
      calculationAnswer: "두 링크가 모두 x축 방향이므로 EE=(1.7,0.0)이다.",
      codeQuestion: "T01와 T12를 곱해 T02를 얻는 C++ 코드 한 줄은?",
      codeAnswer: "Matrix4d T02 = T01 * T12;",
      debugQuestion: "q1=90도, q2=0도인데 EE가 (0,1.0)만 나온다면 무엇이 빠졌는가?",
      debugAnswer: "둘째 링크 l2의 transform 또는 T01*T12 체인 곱이 빠졌을 가능성이 크다.",
      visualQuestion: "q1=90도, q2=0도이면 EE는 어디에 있어야 하는가?",
      visualAnswer: "l1=1, l2=0.7이면 EE는 대략 (0,1.7)에 있어야 한다.",
      robotQuestion: "ROS2에서 FK 결과를 TF로 publish할 때 메시지 타입은?",
      robotAnswer: "geometry_msgs::msg::TransformStamped를 tf2_ros::TransformBroadcaster로 publish한다.",
      designQuestion: "6DOF 로봇 FK에서 직접 행렬 6개를 손으로 곱하는 대신 Pinocchio를 쓰는 이유는?",
      designAnswer: "URDF에서 kinematic tree를 읽어 FK/Jacobian/dynamics를 일관되게 계산하므로 실수와 유지보수 비용을 줄인다.",
    }),
    wrongAnswerTags: makeWrongTags("cpp_eigen_fk_jacobian", "Eigen 행렬 연산 오류", [
      "robot_math_forward_kinematics",
      "robot_math_homogeneous_transform_se3",
    ]),
    nextSessions: ["ros2_tf2_transform", "robot_dynamics_2link_lagrange"],
  }),
];
