import type { QuizQuestionV2, Session, VisualizationSpec } from "../types";
import { ensureCodeLabShape, makeCoreQuizzes, makeEquation, makeVisualization, makeWrongTags, session, step } from "./v2SessionHelpers";

const part = "Part 2. 로봇 수학";

const rotation2dLab = ensureCodeLabShape({
  id: "lab_robot_math_2d_rotation_matrix",
  title: "2D Rotation Matrix with NumPy",
  language: "python",
  theoryConnection: "R(theta)=[[cos(theta),-sin(theta)],[sin(theta),cos(theta)]], p_rotated=R(theta)p",
  starterCode: `import numpy as np

def rotation_matrix(theta):
    # TODO: np.cos(theta), np.sin(theta)를 사용해 2x2 회전행렬을 만든다.
    # 힌트: theta는 degree가 아니라 radian이다.
    pass

def rotate_point(R, p):
    # TODO: 행렬 R과 점 p를 곱해 회전된 점을 반환한다.
    pass

if __name__ == "__main__":
    theta = np.pi / 2
    p = np.array([1.0, 0.0])
    R = rotation_matrix(theta)
    print(np.round(R, 3))
    print(np.round(rotate_point(R, p), 3))`,
  solutionCode: `import numpy as np

def rotation_matrix(theta):
    c = np.cos(theta)
    s = np.sin(theta)
    R = np.array([[c, -s], [s, c]])
    return R

def rotate_point(R, p):
    return R @ p

if __name__ == "__main__":
    theta = np.pi / 2
    p = np.array([1.0, 0.0])
    R = rotation_matrix(theta)
    print(np.round(R, 3))
    print(np.round(rotate_point(R, p), 3))`,
  testCode: `import numpy as np
from rotation_matrix_2d import rotation_matrix, rotate_point

def test_theta_zero_is_identity():
    R = rotation_matrix(0.0)
    assert np.allclose(R, np.eye(2), atol=1e-6)

def test_theta_pi_over_two_rotates_x_to_y():
    R = rotation_matrix(np.pi / 2)
    p = np.array([1.0, 0.0])
    assert np.allclose(rotate_point(R, p), np.array([0.0, 1.0]), atol=1e-6)

def test_rotation_matrix_shape():
    R = rotation_matrix(0.25)
    assert R.shape == (2, 2)`,
  expectedOutput: "[[ 0. -1.]\n [ 1.  0.]]\n[0. 1.]",
  runCommand: "python rotation_matrix_2d.py && pytest test_rotation_matrix_2d.py",
  commonBugs: [
    "theta=90을 그대로 넣어 degree 값을 radian처럼 사용함",
    "sin 항의 부호를 반대로 써서 시계/반시계 방향이 뒤집힘",
    "R @ p 대신 p @ R을 사용해 행렬곱 방향이 바뀜",
  ],
  extensionTask: "theta를 -pi/2, pi, 2*pi로 바꾸고 회전된 점이 단위원 위에 남는지 확인하라.",
});

const rotation2dVisualization: VisualizationSpec = {
  id: "vis_2d_rotation_matrix",
  title: "2D Rotation Matrix",
  conceptTag: "robot_math_2d_rotation_matrix",
  parameters: [
    { name: "theta", symbol: "theta", min: -3.141593, max: 3.141593, default: 1.570796, description: "회전 각도. 코드에서는 radian으로 넣는다." },
    { name: "point_x", symbol: "x", min: -2, max: 2, default: 1, description: "원래 점의 x 좌표" },
    { name: "point_y", symbol: "y", min: -2, max: 2, default: 0, description: "원래 점의 y 좌표" },
  ],
  connectedEquation: "p_rotated=R(theta)p",
  connectedCodeLab: rotation2dLab.id,
  normalCase: "theta=pi/2, p=[1,0]이면 원래 점은 x축 위에 있고 회전된 점은 y축 위의 [0,1]에 놓인다.",
  failureCase: "degree 값 90을 radian처럼 넣으면 90 radian으로 계산되어 화면의 점이 기대한 90도 위치가 아니라 엉뚱한 곳으로 간다.",
  interpretationQuestions: [
    "원래 점과 회전된 점이 같은 원 위에 있는지 확인하라.",
    "theta를 0으로 만들면 회전된 점이 원래 점과 정확히 겹치는지 말하라.",
    "theta 입력칸에 90을 넣었을 때 degree/radian 경고가 왜 필요한지 설명하라.",
  ],
};

const rotation2dQuizzes: QuizQuestionV2[] = [
  {
    id: "robot_math_2d_rotation_matrix_q01_concept",
    type: "concept",
    difficulty: "easy",
    conceptTag: "robot_math_2d_rotation_matrix",
    question: "2D 회전행렬 R(theta)는 무엇을 하는 도구인가?",
    expectedAnswer: "평면 위의 점 p를 원점 기준으로 theta만큼 회전시켜 새 점 p_rotated를 만드는 2x2 행렬이다.",
    explanation: "R(theta)를 점 p에 곱하면 길이는 유지되고 방향만 theta만큼 바뀐다. 로봇에서는 센서 좌표의 점을 로봇 좌표로 돌릴 때 이 생각을 쓴다.",
    wrongAnswerAnalysis: {
      commonWrongAnswer: "점의 x, y 위치를 그냥 더하는 도구라고 답함",
      whyWrong: "회전행렬은 translation이 아니라 방향을 바꾸는 linear transform이다.",
      errorType: "concept_confusion",
      reviewSession: "robot_math_2d_rotation_matrix",
      retryQuestionType: "calculation",
    },
  },
  {
    id: "robot_math_2d_rotation_matrix_q02_calculation",
    type: "calculation",
    difficulty: "medium",
    conceptTag: "robot_math_2d_rotation_matrix",
    question: "theta=90도=pi/2 rad, p=[1,0]일 때 R(theta)p를 손으로 계산하라.",
    expectedAnswer: "cos(pi/2)=0, sin(pi/2)=1이므로 R=[[0,-1],[1,0]], R[1,0]=[0,1]이다.",
    explanation: "x축 위의 점 [1,0]을 반시계 방향으로 90도 돌리면 y축 위의 점 [0,1]이 된다.",
    wrongAnswerAnalysis: {
      commonWrongAnswer: "[1,0] 또는 [0,-1]이라고 답함",
      whyWrong: "회전하지 않았거나 sin 부호를 반대로 쓴 것이다.",
      errorType: "calculation_error",
      reviewSession: "robot_math_2d_rotation_matrix",
      retryQuestionType: "calculation",
    },
  },
  {
    id: "robot_math_2d_rotation_matrix_q03_code_completion",
    type: "code_completion",
    difficulty: "medium",
    conceptTag: "robot_math_2d_rotation_matrix",
    question: "rotation_matrix(theta)에서 c=np.cos(theta), s=np.sin(theta)를 계산했다. 반환해야 하는 NumPy 배열 한 줄을 작성하라.",
    expectedAnswer: "return np.array([[c, -s], [s, c]])",
    explanation: "첫 행은 새 x축 계산, 둘째 행은 새 y축 계산이다. -s 위치가 틀리면 회전 방향이 뒤집힌다.",
    wrongAnswerAnalysis: {
      commonWrongAnswer: "return np.array([[c, s], [-s, c]])",
      whyWrong: "이 행렬은 theta가 아니라 -theta 방향 회전이 된다.",
      errorType: "code_logic_error",
      reviewSession: "robot_math_2d_rotation_matrix",
      retryQuestionType: "code_debug",
    },
  },
  {
    id: "robot_math_2d_rotation_matrix_q04_code_debug",
    type: "code_debug",
    difficulty: "medium",
    conceptTag: "robot_math_2d_rotation_matrix",
    question: "코드가 theta=90을 넣고 [1,0]이 [0,1]이 되지 않는다. 가장 먼저 고칠 입력은 무엇인가?",
    expectedAnswer: "theta=90 대신 theta=np.pi/2를 넣거나 np.deg2rad(90)으로 degree를 radian으로 바꾼다.",
    explanation: "NumPy의 sin, cos는 radian을 입력으로 받는다. 90은 90도가 아니라 90 radian으로 계산된다.",
    wrongAnswerAnalysis: {
      commonWrongAnswer: "np.cos 대신 np.sin을 먼저 바꾼다",
      whyWrong: "수식이 맞아도 단위가 틀리면 결과가 틀린다. 여기서는 degree/radian 단위 오류가 핵심이다.",
      errorType: "unit_error",
      reviewSession: "robot_math_2d_rotation_matrix",
      retryQuestionType: "code_completion",
    },
  },
  {
    id: "robot_math_2d_rotation_matrix_q05_visualization",
    type: "visualization_interpretation",
    difficulty: "medium",
    conceptTag: "robot_math_2d_rotation_matrix",
    question: "시각화에서 theta를 0에서 pi/2로 움직이면 원래 점 [1,0]과 회전된 점은 어떻게 보여야 하는가?",
    expectedAnswer: "원래 점은 [1,0]에 남고 회전된 점만 원 위를 따라 [0,1]로 이동한다.",
    explanation: "회전행렬은 점의 길이를 바꾸지 않는다. 그래서 회전된 점은 반지름 1인 원 위를 움직인다.",
    wrongAnswerAnalysis: {
      commonWrongAnswer: "점이 원점에서 멀어져야 한다고 답함",
      whyWrong: "순수 회전은 scale이 아니라 방향 변화라서 원점까지 거리가 유지된다.",
      errorType: "visualization_misread",
      reviewSession: "robot_math_2d_rotation_matrix",
      retryQuestionType: "calculation",
    },
  },
  {
    id: "robot_math_2d_rotation_matrix_q06_robot_scenario",
    type: "robot_scenario",
    difficulty: "hard",
    conceptTag: "robot_math_2d_rotation_matrix",
    question: "2D 모바일 로봇이 yaw=pi/2이고 로봇 앞쪽 센서 점이 [1,0]이다. 월드 좌표에서 이 방향은 어디인가?",
    expectedAnswer: "월드 좌표에서는 [0,1] 방향이다. 로봇의 앞쪽 x축이 월드의 y축 방향으로 돌아갔기 때문이다.",
    explanation: "로봇 body frame의 점을 world frame으로 바꿀 때 yaw 회전행렬을 곱한다.",
    wrongAnswerAnalysis: {
      commonWrongAnswer: "계속 [1,0]이라고 답함",
      whyWrong: "로봇 좌표계와 월드 좌표계를 같은 축으로 착각했다.",
      errorType: "robot_application_error",
      reviewSession: "robot_math_2d_rotation_matrix",
      retryQuestionType: "visualization_interpretation",
    },
  },
  {
    id: "robot_math_2d_rotation_matrix_q07_system_design",
    type: "system_design",
    difficulty: "hard",
    conceptTag: "robot_math_2d_rotation_matrix",
    question: "로봇 좌표 변환 라이브러리를 만들 때 degree/radian 오류를 줄이기 위한 API 규칙 2개를 쓰라.",
    expectedAnswer: "함수 이름이나 인자에 radian을 명시하고, degree 입력은 np.deg2rad를 통과하는 별도 함수로 분리한다.",
    explanation: "좌표 변환 버그는 시스템 전체의 위치 추정, 제어, 시각화에 퍼지므로 단위가 API에서 드러나야 한다.",
    wrongAnswerAnalysis: {
      commonWrongAnswer: "문서에만 degree를 쓰지 말라고 적는다",
      whyWrong: "문서만으로는 런타임 입력 실수를 막기 어렵다. API 이름, 테스트, 변환 함수가 함께 있어야 한다.",
      errorType: "system_design_error",
      reviewSession: "robot_math_2d_rotation_matrix",
      retryQuestionType: "robot_scenario",
    },
  },
];

const rotation3dLab = ensureCodeLabShape({
  id: "lab_robot_math_3d_rotation_so3",
  title: "3D Rotation Matrix and SO(3)",
  language: "python",
  theoryConnection: "R in SO(3) means R.T @ R = I and det(R)=1",
  starterCode: `import numpy as np

def rot_z(theta):
    # TODO: z축 기준 3D 회전행렬을 만든다.
    pass

def is_rotation_matrix(R):
    # TODO: R.T @ R이 I이고 det(R)이 1인지 검사한다.
    pass

if __name__ == "__main__":
    R = rot_z(np.pi / 2)
    print(np.round(R @ np.array([1.0, 0.0, 0.0]), 3))
    print(is_rotation_matrix(R))`,
  solutionCode: `import numpy as np

def rot_z(theta):
    c = np.cos(theta)
    s = np.sin(theta)
    return np.array([[c, -s, 0.0], [s, c, 0.0], [0.0, 0.0, 1.0]])

def is_rotation_matrix(R):
    return np.allclose(R.T @ R, np.eye(3), atol=1e-6) and np.allclose(np.linalg.det(R), 1.0, atol=1e-6)

if __name__ == "__main__":
    R = rot_z(np.pi / 2)
    print(np.round(R @ np.array([1.0, 0.0, 0.0]), 3))
    print(is_rotation_matrix(R))`,
  testCode: `import numpy as np
from rotation_so3 import rot_z, is_rotation_matrix

def test_identity_angle():
    assert np.allclose(rot_z(0.0), np.eye(3), atol=1e-6)

def test_z_rotation_maps_x_to_y():
    p = np.array([1.0, 0.0, 0.0])
    assert np.allclose(rot_z(np.pi / 2) @ p, np.array([0.0, 1.0, 0.0]), atol=1e-6)

def test_so3_properties():
    assert is_rotation_matrix(rot_z(0.7))`,
  expectedOutput: "[0. 1. 0.]\nTrue",
  runCommand: "python rotation_so3.py && pytest test_rotation_so3.py",
  commonBugs: ["R.T @ R 검사를 빼먹음", "det(R)=-1인 reflection을 회전으로 착각함", "축 순서를 roll-pitch-yaw와 섞음"],
  extensionTask: "rot_x, rot_y를 추가하고 Rz @ Ry와 Ry @ Rz의 결과가 다름을 확인하라.",
});

const homogeneousTransformLab = ensureCodeLabShape({
  id: "lab_robot_math_homogeneous_transform_se3",
  title: "Homogeneous Transform and SE(3)",
  language: "python",
  theoryConnection: "T=[[R,t],[0,0,0,1]], p_world=T @ [p_local,1]",
  starterCode: `import numpy as np

def make_transform(R, t):
    # TODO: 4x4 identity를 만들고 왼쪽 위 R, 오른쪽 위 t를 채운다.
    pass

def transform_point(T, p):
    # TODO: p를 homogeneous 좌표 [x,y,z,1]로 바꾼 뒤 T를 곱한다.
    pass

if __name__ == "__main__":
    R = np.array([[0.0, -1.0, 0.0], [1.0, 0.0, 0.0], [0.0, 0.0, 1.0]])
    T = make_transform(R, np.array([1.0, 2.0, 0.0]))
    print(np.round(transform_point(T, np.array([1.0, 0.0, 0.0])), 3))`,
  solutionCode: `import numpy as np

def make_transform(R, t):
    T = np.eye(4)
    T[:3, :3] = R
    T[:3, 3] = t
    return T

def transform_point(T, p):
    ph = np.append(p, 1.0)
    return (T @ ph)[:3]

if __name__ == "__main__":
    R = np.array([[0.0, -1.0, 0.0], [1.0, 0.0, 0.0], [0.0, 0.0, 1.0]])
    T = make_transform(R, np.array([1.0, 2.0, 0.0]))
    print(np.round(transform_point(T, np.array([1.0, 0.0, 0.0])), 3))`,
  testCode: `import numpy as np
from homogeneous_transform import make_transform, transform_point

def test_identity_transform():
    T = make_transform(np.eye(3), np.zeros(3))
    assert np.allclose(transform_point(T, np.array([1.0, 2.0, 3.0])), np.array([1.0, 2.0, 3.0]), atol=1e-6)

def test_translation():
    T = make_transform(np.eye(3), np.array([1.0, 2.0, 3.0]))
    assert np.allclose(transform_point(T, np.zeros(3)), np.array([1.0, 2.0, 3.0]), atol=1e-6)

def test_rotation_then_translation():
    R = np.array([[0.0, -1.0, 0.0], [1.0, 0.0, 0.0], [0.0, 0.0, 1.0]])
    T = make_transform(R, np.array([1.0, 2.0, 0.0]))
    assert np.allclose(transform_point(T, np.array([1.0, 0.0, 0.0])), np.array([1.0, 3.0, 0.0]), atol=1e-6)`,
  expectedOutput: "[1. 3. 0.]",
  runCommand: "python homogeneous_transform.py && pytest test_homogeneous_transform.py",
  commonBugs: ["translation을 마지막 행에 넣음", "homogeneous 좌표의 1을 빼먹음", "T_ab와 T_ba 방향을 반대로 곱함"],
  extensionTask: "inverse transform 함수를 만들고 T_inv @ T가 identity인지 검사하라.",
});

const quaternionLab = ensureCodeLabShape({
  id: "lab_robot_math_quaternion_slerp",
  title: "Quaternion and SLERP",
  language: "python",
  theoryConnection: "q(t)=slerp(q0,q1,t), ||q||=1",
  starterCode: `import numpy as np

def normalize(q):
    # TODO: q를 길이 1로 만든다.
    pass

def slerp(q0, q1, t):
    # TODO: q0, q1을 normalize하고 spherical interpolation을 계산한다.
    pass

if __name__ == "__main__":
    q0 = np.array([1.0, 0.0, 0.0, 0.0])
    q1 = np.array([0.0, 0.0, 0.0, 1.0])
    print(np.round(slerp(q0, q1, 0.5), 3))`,
  solutionCode: `import numpy as np

def normalize(q):
    return q / np.linalg.norm(q)

def slerp(q0, q1, t):
    q0 = normalize(q0)
    q1 = normalize(q1)
    dot = np.dot(q0, q1)
    if dot < 0.0:
        q1 = -q1
        dot = -dot
    dot = np.clip(dot, -1.0, 1.0)
    if dot > 0.9995:
        return normalize((1.0 - t) * q0 + t * q1)
    omega = np.arccos(dot)
    return (np.sin((1.0 - t) * omega) * q0 + np.sin(t * omega) * q1) / np.sin(omega)

if __name__ == "__main__":
    q0 = np.array([1.0, 0.0, 0.0, 0.0])
    q1 = np.array([0.0, 0.0, 0.0, 1.0])
    print(np.round(slerp(q0, q1, 0.5), 3))`,
  testCode: `import numpy as np
from quaternion_slerp import normalize, slerp

def test_normalize_unit_length():
    assert np.allclose(np.linalg.norm(normalize(np.array([2.0, 0.0, 0.0, 0.0]))), 1.0, atol=1e-6)

def test_slerp_endpoints():
    q0 = np.array([1.0, 0.0, 0.0, 0.0])
    q1 = np.array([0.0, 0.0, 0.0, 1.0])
    assert np.allclose(slerp(q0, q1, 0.0), q0, atol=1e-6)
    assert np.allclose(slerp(q0, q1, 1.0), q1, atol=1e-6)

def test_slerp_halfway_z_180():
    q = slerp(np.array([1.0, 0.0, 0.0, 0.0]), np.array([0.0, 0.0, 0.0, 1.0]), 0.5)
    assert np.allclose(q, np.array([np.sqrt(0.5), 0.0, 0.0, np.sqrt(0.5)]), atol=1e-6)`,
  expectedOutput: "[0.707 0.    0.    0.707]",
  runCommand: "python quaternion_slerp.py && pytest test_quaternion_slerp.py",
  commonBugs: ["quaternion 정규화를 하지 않음", "q와 -q가 같은 자세라는 사실을 놓침", "선형보간만 써서 회전 속도가 일정하지 않음"],
  extensionTask: "t를 0부터 1까지 0.1 간격으로 바꾸고 quaternion norm이 항상 1인지 출력하라.",
});

const dhLab = ensureCodeLabShape({
  id: "lab_robot_math_dh_parameter",
  title: "DH Parameter Transform",
  language: "python",
  theoryConnection: "A_i=Rot_z(theta_i)Trans_z(d_i)Trans_x(a_i)Rot_x(alpha_i)",
  starterCode: `import numpy as np

def dh_transform(a, alpha, d, theta):
    # TODO: standard DH 4x4 transform을 만든다.
    pass

def chain_dh(params):
    # TODO: 여러 DH transform을 순서대로 곱한다.
    pass

if __name__ == "__main__":
    params = [(1.0, 0.0, 0.0, 0.0), (1.0, 0.0, 0.0, 0.0)]
    print(np.round(chain_dh(params)[:3, 3], 3))`,
  solutionCode: `import numpy as np

def dh_transform(a, alpha, d, theta):
    ct, st = np.cos(theta), np.sin(theta)
    ca, sa = np.cos(alpha), np.sin(alpha)
    return np.array([
        [ct, -st * ca, st * sa, a * ct],
        [st, ct * ca, -ct * sa, a * st],
        [0.0, sa, ca, d],
        [0.0, 0.0, 0.0, 1.0],
    ])

def chain_dh(params):
    T = np.eye(4)
    for a, alpha, d, theta in params:
        T = T @ dh_transform(a, alpha, d, theta)
    return T

if __name__ == "__main__":
    params = [(1.0, 0.0, 0.0, 0.0), (1.0, 0.0, 0.0, 0.0)]
    print(np.round(chain_dh(params)[:3, 3], 3))`,
  testCode: `import numpy as np
from dh_parameter import dh_transform, chain_dh

def test_single_link_translation():
    T = dh_transform(1.0, 0.0, 0.0, 0.0)
    assert np.allclose(T[:3, 3], np.array([1.0, 0.0, 0.0]), atol=1e-6)

def test_two_link_straight():
    T = chain_dh([(1.0, 0.0, 0.0, 0.0), (1.0, 0.0, 0.0, 0.0)])
    assert np.allclose(T[:3, 3], np.array([2.0, 0.0, 0.0]), atol=1e-6)

def test_shape():
    assert dh_transform(1.0, 0.0, 0.0, 0.0).shape == (4, 4)`,
  expectedOutput: "[2. 0. 0.]",
  runCommand: "python dh_parameter.py && pytest test_dh_parameter.py",
  commonBugs: ["a와 d를 서로 바꿈", "theta와 alpha 축을 혼동함", "link transform 곱 순서를 뒤집음"],
  extensionTask: "2-link planar arm에서 theta1=pi/2, theta2=0일 때 말단 위치가 [0,2,0]이 되는지 확인하라.",
});

const poeLab = ensureCodeLabShape({
  id: "lab_robot_math_product_of_exponentials",
  title: "Product of Exponentials",
  language: "python",
  theoryConnection: "T(theta)=e^[S1 theta1] e^[S2 theta2] M",
  starterCode: `import numpy as np

def skew(w):
    # TODO: 3D 벡터를 skew-symmetric 행렬로 바꾼다.
    pass

def twist_exp(w, v, theta):
    # TODO: revolute 또는 prismatic twist exponential을 계산한다.
    pass

if __name__ == "__main__":
    T = twist_exp(np.array([0.0, 0.0, 1.0]), np.zeros(3), np.pi / 2)
    p = T @ np.array([1.0, 0.0, 0.0, 1.0])
    print(np.round(p[:3], 3))`,
  solutionCode: `import numpy as np

def skew(w):
    return np.array([[0.0, -w[2], w[1]], [w[2], 0.0, -w[0]], [-w[1], w[0], 0.0]])

def twist_exp(w, v, theta):
    T = np.eye(4)
    if np.linalg.norm(w) < 1e-9:
        T[:3, 3] = v * theta
        return T
    W = skew(w)
    R = np.eye(3) + np.sin(theta) * W + (1.0 - np.cos(theta)) * (W @ W)
    G = np.eye(3) * theta + (1.0 - np.cos(theta)) * W + (theta - np.sin(theta)) * (W @ W)
    T[:3, :3] = R
    T[:3, 3] = G @ v
    return T

if __name__ == "__main__":
    T = twist_exp(np.array([0.0, 0.0, 1.0]), np.zeros(3), np.pi / 2)
    p = T @ np.array([1.0, 0.0, 0.0, 1.0])
    print(np.round(p[:3], 3))`,
  testCode: `import numpy as np
from product_of_exponentials import skew, twist_exp

def test_skew_cross_product():
    w = np.array([0.0, 0.0, 1.0])
    x = np.array([1.0, 0.0, 0.0])
    assert np.allclose(skew(w) @ x, np.cross(w, x), atol=1e-6)

def test_revolute_z_90():
    T = twist_exp(np.array([0.0, 0.0, 1.0]), np.zeros(3), np.pi / 2)
    p = T @ np.array([1.0, 0.0, 0.0, 1.0])
    assert np.allclose(p[:3], np.array([0.0, 1.0, 0.0]), atol=1e-6)

def test_prismatic_translation():
    T = twist_exp(np.zeros(3), np.array([1.0, 0.0, 0.0]), 2.0)
    assert np.allclose(T[:3, 3], np.array([2.0, 0.0, 0.0]), atol=1e-6)`,
  expectedOutput: "[0. 1. 0.]",
  runCommand: "python product_of_exponentials.py && pytest test_product_of_exponentials.py",
  commonBugs: ["skew 행렬 부호를 틀림", "prismatic joint를 revolute 공식에 넣음", "M을 마지막에 곱해야 하는 순서를 놓침"],
  extensionTask: "2개 screw axis를 곱해 2-link arm FK를 POE 방식으로 계산하라.",
});

const fkLab = ensureCodeLabShape({
  id: "lab_robot_math_forward_kinematics",
  title: "Forward Kinematics for 2-Link Arm",
  language: "python",
  theoryConnection: "x=l1 cos(theta1)+l2 cos(theta1+theta2), y=l1 sin(theta1)+l2 sin(theta1+theta2)",
  starterCode: `import numpy as np

def fk_2link(l1, l2, theta1, theta2):
    # TODO: 2-link planar arm의 end-effector x, y를 계산한다.
    pass

if __name__ == "__main__":
    print(np.round(fk_2link(1.0, 1.0, np.pi / 2, 0.0), 3))`,
  solutionCode: `import numpy as np

def fk_2link(l1, l2, theta1, theta2):
    x = l1 * np.cos(theta1) + l2 * np.cos(theta1 + theta2)
    y = l1 * np.sin(theta1) + l2 * np.sin(theta1 + theta2)
    return np.array([x, y])

if __name__ == "__main__":
    print(np.round(fk_2link(1.0, 1.0, np.pi / 2, 0.0), 3))`,
  testCode: `import numpy as np
from forward_kinematics_2link import fk_2link

def test_straight_arm():
    assert np.allclose(fk_2link(1.0, 1.0, 0.0, 0.0), np.array([2.0, 0.0]), atol=1e-6)

def test_up_arm():
    assert np.allclose(fk_2link(1.0, 1.0, np.pi / 2, 0.0), np.array([0.0, 2.0]), atol=1e-6)

def test_folded_arm():
    assert np.allclose(fk_2link(1.0, 1.0, 0.0, np.pi), np.array([0.0, 0.0]), atol=1e-6)`,
  expectedOutput: "[0. 2.]",
  runCommand: "python forward_kinematics_2link.py && pytest test_forward_kinematics_2link.py",
  commonBugs: ["theta2만 두 번째 링크에 사용하고 theta1+theta2를 빼먹음", "degree 값을 radian으로 변환하지 않음", "link length 단위를 섞음"],
  extensionTask: "theta1, theta2를 grid로 훑어 reachable workspace 점들을 저장하라.",
});

const ikLab = ensureCodeLabShape({
  id: "lab_robot_math_inverse_kinematics",
  title: "Inverse Kinematics for 2-Link Arm",
  language: "python",
  theoryConnection: "cos(theta2)=(x^2+y^2-l1^2-l2^2)/(2 l1 l2)",
  starterCode: `import numpy as np

def ik_2link(l1, l2, x, y, elbow_up=False):
    # TODO: law of cosines로 theta2를 구한다.
    # TODO: atan2로 theta1을 구한다.
    # TODO: unreachable target이면 ValueError를 발생시킨다.
    pass

if __name__ == "__main__":
    print(np.round(ik_2link(1.0, 1.0, 1.0, 1.0), 3))`,
  solutionCode: `import numpy as np

def ik_2link(l1, l2, x, y, elbow_up=False):
    r2 = x * x + y * y
    c2 = (r2 - l1 * l1 - l2 * l2) / (2.0 * l1 * l2)
    if c2 < -1.0 - 1e-9 or c2 > 1.0 + 1e-9:
        raise ValueError("target is unreachable")
    c2 = np.clip(c2, -1.0, 1.0)
    s2 = np.sqrt(1.0 - c2 * c2)
    if elbow_up:
        s2 = -s2
    theta2 = np.atan2(s2, c2)
    theta1 = np.atan2(y, x) - np.atan2(l2 * s2, l1 + l2 * c2)
    return np.array([theta1, theta2])

if __name__ == "__main__":
    print(np.round(ik_2link(1.0, 1.0, 1.0, 1.0), 3))`,
  testCode: `import numpy as np
import pytest
from inverse_kinematics_2link import ik_2link

def test_reachable_target():
    theta = ik_2link(1.0, 1.0, 1.0, 1.0)
    assert np.allclose(theta, np.array([0.0, np.pi / 2]), atol=1e-6)

def test_elbow_up_changes_solution():
    down = ik_2link(1.0, 1.0, 1.0, 1.0, elbow_up=False)
    up = ik_2link(1.0, 1.0, 1.0, 1.0, elbow_up=True)
    assert not np.allclose(down, up)

def test_unreachable_target():
    with pytest.raises(ValueError):
        ik_2link(1.0, 1.0, 3.0, 0.0)`,
  expectedOutput: "[0.    1.571]",
  runCommand: "python inverse_kinematics_2link.py && pytest test_inverse_kinematics_2link.py",
  commonBugs: ["acos 입력을 [-1,1]로 clamp하지 않음", "unreachable target을 검사하지 않음", "elbow-up과 elbow-down 해를 하나로 착각함"],
  extensionTask: "FK로 다시 검산하는 함수 check_ik_solution을 추가하라.",
});

const jacobianLab = ensureCodeLabShape({
  id: "lab_robot_math_jacobian_velocity_kinematics",
  title: "Jacobian Velocity Kinematics",
  language: "python",
  theoryConnection: "v=J(q) qdot",
  starterCode: `import numpy as np

def jacobian_2link(l1, l2, theta1, theta2):
    # TODO: 2-link planar arm의 2x2 Jacobian을 계산한다.
    pass

def end_effector_velocity(J, qdot):
    # TODO: v = J @ qdot을 반환한다.
    pass

if __name__ == "__main__":
    J = jacobian_2link(1.0, 1.0, 0.0, 0.0)
    print(np.round(end_effector_velocity(J, np.array([1.0, 0.0])), 3))`,
  solutionCode: `import numpy as np

def jacobian_2link(l1, l2, theta1, theta2):
    s1 = np.sin(theta1)
    c1 = np.cos(theta1)
    s12 = np.sin(theta1 + theta2)
    c12 = np.cos(theta1 + theta2)
    return np.array([
        [-l1 * s1 - l2 * s12, -l2 * s12],
        [l1 * c1 + l2 * c12, l2 * c12],
    ])

def end_effector_velocity(J, qdot):
    return J @ qdot

if __name__ == "__main__":
    J = jacobian_2link(1.0, 1.0, 0.0, 0.0)
    print(np.round(end_effector_velocity(J, np.array([1.0, 0.0])), 3))`,
  testCode: `import numpy as np
from jacobian_velocity_2link import jacobian_2link, end_effector_velocity

def test_shape():
    assert jacobian_2link(1.0, 1.0, 0.0, 0.0).shape == (2, 2)

def test_straight_arm_velocity():
    J = jacobian_2link(1.0, 1.0, 0.0, 0.0)
    assert np.allclose(end_effector_velocity(J, np.array([1.0, 0.0])), np.array([0.0, 2.0]), atol=1e-6)

def test_zero_joint_velocity():
    J = jacobian_2link(1.0, 1.0, 0.5, 0.5)
    assert np.allclose(end_effector_velocity(J, np.zeros(2)), np.zeros(2), atol=1e-6)`,
  expectedOutput: "[0. 2.]",
  runCommand: "python jacobian_velocity_2link.py && pytest test_jacobian_velocity_2link.py",
  commonBugs: ["FK를 theta로 미분하지 않고 위치식을 그대로 씀", "qdot 순서를 theta2, theta1로 바꿈", "Jacobian shape를 2x2가 아니라 2로 반환함"],
  extensionTask: "finite difference로 FK 변화량을 계산해 J @ qdot과 비교하라.",
});

const dlsLab = ensureCodeLabShape({
  id: "lab_robot_math_singularity_dls",
  title: "Singularity and Damped Least Squares",
  language: "python",
  theoryConnection: "qdot=J.T (J J.T + lambda^2 I)^-1 e",
  starterCode: `import numpy as np

def dls_step(J, error, damping):
    # TODO: Damped Least Squares qdot을 계산한다.
    pass

if __name__ == "__main__":
    J = np.array([[1.0, 0.0], [0.0, 0.0]])
    print(np.round(dls_step(J, np.array([1.0, 1.0]), 1.0), 3))`,
  solutionCode: `import numpy as np

def dls_step(J, error, damping):
    task_dim = J.shape[0]
    A = J @ J.T + (damping * damping) * np.eye(task_dim)
    return J.T @ np.linalg.solve(A, error)

if __name__ == "__main__":
    J = np.array([[1.0, 0.0], [0.0, 0.0]])
    print(np.round(dls_step(J, np.array([1.0, 1.0]), 1.0), 3))`,
  testCode: `import numpy as np
from singularity_dls import dls_step

def test_rank_deficient_is_finite():
    qdot = dls_step(np.array([[1.0, 0.0], [0.0, 0.0]]), np.array([1.0, 1.0]), 1.0)
    assert np.all(np.isfinite(qdot))
    assert np.allclose(qdot, np.array([0.5, 0.0]), atol=1e-6)

def test_small_damping_close_to_pseudoinverse():
    J = np.eye(2)
    qdot = dls_step(J, np.array([1.0, -1.0]), 1e-6)
    assert np.allclose(qdot, np.array([1.0, -1.0]), atol=1e-5)

def test_larger_damping_reduces_gain():
    J = np.eye(2)
    fast = np.linalg.norm(dls_step(J, np.ones(2), 0.01))
    slow = np.linalg.norm(dls_step(J, np.ones(2), 10.0))
    assert slow < fast`,
  expectedOutput: "[0.5 0. ]",
  runCommand: "python singularity_dls.py && pytest test_singularity_dls.py",
  commonBugs: ["lambda^2 대신 lambda를 더함", "J.T와 J의 위치를 바꿈", "singular matrix를 직접 inverse 하려다 실패함"],
  extensionTask: "damping을 0.001부터 10까지 바꾸며 qdot norm과 task error를 표로 출력하라.",
});

const robotMathSessionsRest: Session[] = [
  session({
    id: "robot_math_3d_rotation_so3",
    part,
    title: "3D Rotation Matrix and SO(3)",
    level: "beginner",
    prerequisites: ["robot_math_2d_rotation_matrix", "vector_matrix_basics"],
    learningObjectives: ["3D 회전행렬의 SO(3) 조건을 설명한다.", "R.T R=I와 det(R)=1을 코드로 검사한다.", "roll, pitch, yaw 축 순서 오류를 진단한다."],
    theory: {
      definition: "SO(3)는 3D 공간에서 길이와 각도를 보존하는 모든 올바른 회전행렬의 집합이다.",
      whyItMatters: "로봇팔, 드론, 카메라 자세는 3D 회전으로 표현되며 SO(3) 조건이 깨지면 frame 변환과 제어가 무너진다.",
      intuition: "작은 장난감 좌표축을 손에 들고 돌린다고 생각하면 된다. 축의 길이는 그대로이고 방향만 바뀌어야 진짜 회전이다.",
      equations: [
        makeEquation("SO(3)", "SO(3)={R in R^{3x3} | R^T R=I, det(R)=1}", [["R", "3D rotation matrix"], ["I", "identity matrix"], ["det", "determinant"]], "정규직교성과 오른손 좌표계를 동시에 만족해야 한다."),
        makeEquation("Z-axis rotation", "R_z(theta)=[[c,-s,0],[s,c,0],[0,0,1]]", [["c", "cos(theta)"], ["s", "sin(theta)"], ["theta", "z축 회전각"]], "z축은 그대로 두고 x-y 평면만 회전한다."),
      ],
      derivation: [
        step("기저 벡터 보존", "회전 뒤에도 각 축 길이는 1이어야 한다.", "||r_i||=1"),
        step("축끼리 직각 유지", "서로 다른 축의 내적은 0이어야 한다.", "r_i^T r_j=0"),
        step("행렬 조건으로 묶기", "모든 길이와 직각 조건을 R^T R=I로 쓴다."),
        step("반사 제거", "det(R)=1을 요구해 mirror reflection을 제외한다."),
      ],
      handCalculation: {
        problem: "theta=90도, p=[1,0,0]일 때 Rz(theta)p를 계산하라.",
        given: { theta: "pi/2", p: "[1,0,0]" },
        steps: ["cos(pi/2)=0, sin(pi/2)=1", "Rz=[[0,-1,0],[1,0,0],[0,0,1]]", "Rz p=[0,1,0]"],
        answer: "[0,1,0]",
      },
      robotApplication: "카메라 optical frame에서 본 물체 방향을 base_link나 world frame으로 바꿀 때 3D 회전행렬이 필요하다.",
    },
    codeLabs: [rotation3dLab],
    visualizations: [
      makeVisualization("vis_3d_rotation_so3", "SO(3) Axis Rotation", "robot_math_3d_rotation_so3", "R^T R=I, det(R)=1", rotation3dLab.id, [
        { name: "yaw", symbol: "psi", min: -3.141593, max: 3.141593, default: 1.570796, description: "z축 회전각 radian" },
        { name: "orthogonality_error", symbol: "epsilon", min: 0, max: 0.2, default: 0, description: "R.T R과 I의 차이" },
      ], "orthogonality_error가 0에 가까우면 축이 직각이고 길이도 유지된다.", "det(R)<0 또는 R.T R!=I이면 회전이 아니라 반사/왜곡이다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "robot_math_3d_rotation_so3",
      conceptTag: "robot_math_3d_rotation_so3",
      reviewSession: "3D Rotation Matrix and SO(3)",
      conceptQuestion: "SO(3)의 두 조건은 무엇인가?",
      conceptAnswer: "R.T R=I이고 det(R)=1이다.",
      calculationQuestion: "Rz(pi/2)[1,0,0]의 결과는?",
      calculationAnswer: "[0,1,0]이다.",
      codeQuestion: "is_rotation_matrix에서 검사해야 하는 NumPy 식 2개는?",
      codeAnswer: "np.allclose(R.T @ R, np.eye(3))와 np.allclose(np.linalg.det(R), 1.0)이다.",
      debugQuestion: "det(R)=-1이면 왜 회전행렬이 아닌가?",
      debugAnswer: "오른손 좌표계를 뒤집는 reflection이기 때문이다.",
      visualQuestion: "orthogonality_error가 커지면 축은 어떻게 보이는가?",
      visualAnswer: "축이 직각이 아니거나 길이가 변한 것처럼 보인다.",
      robotQuestion: "드론 yaw 회전에 Rz가 필요한 이유는?",
      robotAnswer: "body frame 전방 방향을 world frame 방향으로 바꾸기 위해서다.",
      designQuestion: "자세 추정 파이프라인에서 SO(3) 검사는 어디에 넣어야 하는가?",
      designAnswer: "센서 fusion 출력 직후와 제어 명령으로 보내기 전에 넣는다.",
    }),
    wrongAnswerTags: makeWrongTags("robot_math_3d_rotation_so3", "SO(3) 조건 오류", ["robot_math_2d_rotation_matrix"]),
    nextSessions: ["robot_math_homogeneous_transform_se3", "robot_math_quaternion_slerp"],
  }),
  session({
    id: "robot_math_homogeneous_transform_se3",
    part,
    title: "Homogeneous Transform and SE(3)",
    level: "beginner",
    prerequisites: ["robot_math_3d_rotation_so3", "vector_matrix_basics"],
    learningObjectives: ["회전과 이동을 하나의 4x4 행렬로 합친다.", "점에 homogeneous 좌표 1을 붙여 변환한다.", "TF2 frame chain의 행렬곱 순서를 설명한다."],
    theory: {
      definition: "SE(3)는 3D rigid body pose를 나타내는 회전 R과 이동 t를 4x4 homogeneous transform으로 묶은 집합이다.",
      whyItMatters: "로봇의 센서, 바퀴, 팔, 카메라 frame은 모두 서로 다른 위치와 자세를 가지므로 하나의 행렬 형식으로 연결해야 한다.",
      intuition: "점 하나에 방향 바꾸기와 자리 옮기기를 한 번에 적용하는 주소 변환표라고 생각하면 된다.",
      equations: [
        makeEquation("Homogeneous transform", "T=[[R,t],[0,0,0,1]]", [["R", "3x3 rotation"], ["t", "3x1 translation"], ["T", "4x4 transform"]], "회전과 이동을 한 행렬에 담는다."),
        makeEquation("Point transform", "p_b=T_ba p_a", [["p_a", "frame a의 homogeneous point"], ["p_b", "frame b의 point"], ["T_ba", "a에서 b로 가는 transform"]], "점이 어느 frame에 있는지 아래첨자로 분명히 한다."),
      ],
      derivation: [
        step("3D 점 확장", "p=[x,y,z] 뒤에 1을 붙여 [x,y,z,1]로 만든다."),
        step("회전 적용", "왼쪽 위 3x3 R이 방향을 바꾼다.", "Rp"),
        step("이동 적용", "오른쪽 위 t가 회전된 점에 더해진다.", "Rp+t"),
        step("행렬 하나로 표현", "위 두 과정을 4x4 행렬곱으로 합친다."),
      ],
      handCalculation: {
        problem: "Rz(90도), t=[1,2,0], p=[1,0,0]일 때 변환된 점은?",
        given: { theta: "pi/2", t: "[1,2,0]", p: "[1,0,0]" },
        steps: ["Rz p=[0,1,0]", "translation을 더해 [1,3,0]", "homogeneous 마지막 값은 1"],
        answer: "[1,3,0]",
      },
      robotApplication: "ROS2 TF2의 map, odom, base_link, camera_link 변환은 SE(3) 행렬곱과 같은 구조로 이해할 수 있다.",
    },
    codeLabs: [homogeneousTransformLab],
    visualizations: [
      makeVisualization("vis_homogeneous_transform_se3", "SE(3) Transform Chain", "robot_math_homogeneous_transform_se3", "T=[[R,t],[0,0,0,1]]", homogeneousTransformLab.id, [
        { name: "yaw", symbol: "psi", min: -3.141593, max: 3.141593, default: 1.570796, description: "회전 yaw" },
        { name: "tx", symbol: "t_x", min: -2, max: 2, default: 1, description: "x translation" },
        { name: "ty", symbol: "t_y", min: -2, max: 2, default: 2, description: "y translation" },
      ], "회전한 뒤 translation이 더해져 점이 예상 frame 위치로 이동한다.", "translation 행/열 위치를 틀리면 점이 이동하지 않거나 w 값이 깨진다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "robot_math_homogeneous_transform_se3",
      conceptTag: "robot_math_homogeneous_transform_se3",
      reviewSession: "Homogeneous Transform and SE(3)",
      conceptQuestion: "SE(3) 행렬 T는 무엇을 담는가?",
      conceptAnswer: "3D 회전 R과 translation t를 하나의 4x4 행렬에 담는다.",
      calculationQuestion: "Rz(90도), t=[1,2,0], p=[1,0,0]의 결과는?",
      calculationAnswer: "Rz p=[0,1,0]이고 t를 더해 [1,3,0]이다.",
      codeQuestion: "make_transform에서 R과 t는 T의 어디에 들어가는가?",
      codeAnswer: "R은 T[:3,:3], t는 T[:3,3]에 들어간다.",
      debugQuestion: "translation을 T[3,:3]에 넣으면 왜 틀리는가?",
      debugAnswer: "점의 x,y,z에 더해지지 않고 homogeneous w 계산을 망친다.",
      visualQuestion: "yaw만 바꾸고 tx,ty를 0으로 두면 점은 어떻게 움직이는가?",
      visualAnswer: "원점 중심으로 회전하고 위치 이동은 없다.",
      robotQuestion: "camera_link 점을 base_link로 바꾸려면 무엇이 필요한가?",
      robotAnswer: "camera_link에서 base_link로 가는 올바른 SE(3) transform과 시간 일치가 필요하다.",
      designQuestion: "frame chain 시스템에서 transform 방향 오류를 줄이는 규칙은?",
      designAnswer: "T_target_source 이름 규칙과 단위 테스트로 T_inv @ T=I를 검사한다.",
    }),
    wrongAnswerTags: makeWrongTags("robot_math_homogeneous_transform_se3", "SE(3) 행렬 배치/방향 오류", ["robot_math_3d_rotation_so3"]),
    nextSessions: ["robot_math_dh_parameter", "ros2_tf2_transform"],
  }),
  session({
    id: "robot_math_quaternion_slerp",
    part,
    title: "Quaternion and SLERP",
    level: "intermediate",
    prerequisites: ["robot_math_3d_rotation_so3", "unit_circle_trigonometry"],
    learningObjectives: ["quaternion이 3D 회전을 표현하는 이유를 설명한다.", "SLERP로 일정한 회전 보간을 구현한다.", "q와 -q가 같은 자세임을 코드에서 처리한다."],
    theory: {
      definition: "Quaternion은 4개 숫자 [w,x,y,z]로 3D 회전을 표현하고, SLERP는 두 자세 사이를 구면 위에서 부드럽게 보간한다.",
      whyItMatters: "로봇팔 자세 보간, 드론 자세 제어, 카메라 orientation smoothing에서 Euler angle의 gimbal lock을 피해야 한다.",
      intuition: "지구본 표면에서 두 도시 사이를 직선으로 뚫지 않고 표면 위 최단 경로로 걷는 보간이라고 생각하면 된다.",
      equations: [
        makeEquation("Unit quaternion", "||q||=1", [["q", "[w,x,y,z] quaternion"]], "회전 quaternion은 길이가 1이어야 한다."),
        makeEquation("SLERP", "slerp(q0,q1,t)=sin((1-t)Omega)/sin(Omega) q0 + sin(t Omega)/sin(Omega) q1", [["Omega", "angle between q0 and q1"], ["t", "0 to 1 interpolation ratio"]], "구면 위에서 일정한 각속도로 보간한다."),
      ],
      derivation: [
        step("단위 길이 유지", "회전 quaternion은 4D unit sphere 위에 있어야 한다.", "||q||=1"),
        step("두 quaternion 사이 각도", "dot(q0,q1)=cos(Omega)로 구면 각도를 얻는다."),
        step("구면 보간 가중치", "sin 비율을 사용해 구면 위 경로를 따라간다."),
        step("짧은 경로 선택", "dot<0이면 q1을 -q1로 바꿔 같은 자세의 짧은 표현을 선택한다."),
      ],
      handCalculation: {
        problem: "identity quaternion [1,0,0,0]에서 z축 180도 [0,0,0,1]까지 t=0.5로 SLERP하면?",
        given: { q0: "[1,0,0,0]", q1: "[0,0,0,1]", t: 0.5 },
        steps: ["두 quaternion의 각도 Omega=pi/2", "중간은 z축 90도 회전", "q=[cos(pi/4),0,0,sin(pi/4)]"],
        answer: "[0.707,0,0,0.707]",
      },
      robotApplication: "MoveIt2나 trajectory planner가 end-effector orientation을 waypoint 사이에서 부드럽게 보간할 때 SLERP가 필요하다.",
    },
    codeLabs: [quaternionLab],
    visualizations: [
      makeVisualization("vis_quaternion_slerp", "Quaternion SLERP", "robot_math_quaternion_slerp", "slerp(q0,q1,t)", quaternionLab.id, [
        { name: "t", symbol: "t", min: 0, max: 1, default: 0.5, description: "보간 비율" },
        { name: "dot", symbol: "q0 dot q1", min: -1, max: 1, default: 0, description: "두 quaternion 사이 내적" },
      ], "t가 증가하면 자세가 일정한 각속도로 q0에서 q1로 이동한다.", "정규화나 dot<0 처리를 빼면 긴 경로로 돌거나 norm이 1에서 벗어난다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "robot_math_quaternion_slerp",
      conceptTag: "robot_math_quaternion_slerp",
      reviewSession: "Quaternion and SLERP",
      conceptQuestion: "회전 quaternion이 반드시 만족해야 하는 조건은?",
      conceptAnswer: "길이 norm이 1이어야 한다.",
      calculationQuestion: "identity와 z축 180도 quaternion의 중간 t=0.5는?",
      calculationAnswer: "[sqrt(0.5),0,0,sqrt(0.5)]이다.",
      codeQuestion: "SLERP 시작 전에 q0, q1에 해야 하는 일은?",
      codeAnswer: "둘 다 normalize하고 dot<0이면 q1을 -q1로 바꾼다.",
      debugQuestion: "보간 중 quaternion norm이 1이 아니면 무엇을 의심하는가?",
      debugAnswer: "정규화 누락이나 선형 보간 후 normalize 누락을 의심한다.",
      visualQuestion: "t=0과 t=1에서 시각화 자세는 어디에 있어야 하는가?",
      visualAnswer: "t=0은 q0, t=1은 q1과 정확히 같아야 한다.",
      robotQuestion: "로봇팔 자세 waypoint 사이에서 SLERP가 필요한 이유는?",
      robotAnswer: "orientation을 튀지 않고 일정한 회전 속도로 연결하기 위해서다.",
      designQuestion: "trajectory API에서 quaternion 순서 오류를 줄이는 방법은?",
      designAnswer: "wxyz 또는 xyzw convention을 타입 이름과 테스트에 명시한다.",
    }),
    wrongAnswerTags: makeWrongTags("robot_math_quaternion_slerp", "quaternion 정규화/순서 오류", ["robot_math_3d_rotation_so3"]),
    nextSessions: ["robot_math_homogeneous_transform_se3", "ros2_tf2_transform"],
  }),
  session({
    id: "robot_math_dh_parameter",
    part,
    title: "DH Parameter",
    level: "intermediate",
    prerequisites: ["robot_math_homogeneous_transform_se3"],
    learningObjectives: ["DH 표의 a, alpha, d, theta 의미를 구분한다.", "link transform을 순서대로 곱해 말단 pose를 계산한다.", "로봇팔 URDF와 kinematic chain의 관계를 설명한다."],
    theory: {
      definition: "DH Parameter는 로봇팔의 이웃한 링크 사이 기하 관계를 a, alpha, d, theta 네 값으로 표준화해 쓰는 방법이다.",
      whyItMatters: "로봇팔 FK를 손으로 계산하거나 오래된 매니퓰레이터 문서를 읽을 때 DH 표가 가장 흔한 출발점이다.",
      intuition: "각 관절마다 앞으로 얼마나 가고, 얼마나 비틀고, 얼마나 올라가고, 얼마나 돌지 적은 레고 조립 설명서다.",
      equations: [
        makeEquation("Standard DH", "A_i=Rot_z(theta_i)Trans_z(d_i)Trans_x(a_i)Rot_x(alpha_i)", [["a_i", "link length"], ["alpha_i", "link twist"], ["d_i", "link offset"], ["theta_i", "joint angle"]], "네 동작을 정해진 순서로 적용한다."),
        makeEquation("Chain", "T_0^n=A_1 A_2 ... A_n", [["A_i", "i번째 link transform"], ["T_0^n", "base에서 end-effector까지 transform"]], "각 link transform을 base에서 끝까지 순서대로 곱한다."),
      ],
      derivation: [
        step("z축 관절 회전", "revolute joint는 theta_i만큼 z축으로 돈다."),
        step("z축 offset", "다음 link까지 d_i만큼 z축으로 이동한다."),
        step("x축 link length", "공통 법선 방향으로 a_i만큼 이동한다."),
        step("x축 twist", "다음 z축과 맞추기 위해 alpha_i만큼 비튼다."),
      ],
      handCalculation: {
        problem: "a1=1, a2=1, 모든 alpha,d,theta가 0이면 2-link 말단 위치는?",
        given: { a1: 1, a2: 1, alpha: 0, d: 0, theta: 0 },
        steps: ["A1은 x로 1 이동", "A2도 x로 1 이동", "총 x 이동은 2"],
        answer: "[2,0,0]",
      },
      robotApplication: "산업용 로봇팔의 link length와 joint angle로 end-effector pose를 계산해 tool path를 계획한다.",
    },
    codeLabs: [dhLab],
    visualizations: [
      makeVisualization("vis_dh_parameter", "DH Link Chain", "robot_math_dh_parameter", "A_i=Rz(theta)Tz(d)Tx(a)Rx(alpha)", dhLab.id, [
        { name: "a", symbol: "a", min: 0, max: 2, default: 1, description: "link length" },
        { name: "theta", symbol: "theta", min: -3.141593, max: 3.141593, default: 0, description: "joint angle" },
        { name: "alpha", symbol: "alpha", min: -3.141593, max: 3.141593, default: 0, description: "link twist" },
      ], "a와 theta를 바꾸면 각 link frame이 정해진 순서대로 이어진다.", "a와 d를 바꾸거나 곱 순서를 틀리면 말단 위치가 다른 링크 방향으로 튄다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "robot_math_dh_parameter",
      conceptTag: "robot_math_dh_parameter",
      reviewSession: "DH Parameter",
      conceptQuestion: "DH parameter 네 가지는 무엇인가?",
      conceptAnswer: "a, alpha, d, theta이다.",
      calculationQuestion: "a1=a2=1, 모든 각도와 offset이 0이면 말단 x는?",
      calculationAnswer: "x=2이다.",
      codeQuestion: "DH chain 함수에서 link transform은 어떻게 누적하는가?",
      codeAnswer: "T = T @ dh_transform(...)로 앞에서 뒤 순서로 곱한다.",
      debugQuestion: "말단이 z 방향으로 움직이면 어떤 parameter 혼동을 의심하는가?",
      debugAnswer: "a와 d를 서로 바꿨을 가능성을 의심한다.",
      visualQuestion: "theta 슬라이더를 바꾸면 어떤 축 기준 회전이 보이는가?",
      visualAnswer: "현재 link의 z축 기준 회전이 보인다.",
      robotQuestion: "로봇팔 모델에서 DH 표가 필요한 이유는?",
      robotAnswer: "관절값에서 end-effector pose를 계산하는 kinematic chain을 만들기 위해서다.",
      designQuestion: "DH와 URDF를 함께 쓸 때 검증해야 할 것은?",
      designAnswer: "joint axis, origin transform, link length가 같은 좌표 convention인지 검증한다.",
    }),
    wrongAnswerTags: makeWrongTags("robot_math_dh_parameter", "DH parameter 축/순서 오류", ["robot_math_homogeneous_transform_se3"]),
    nextSessions: ["robot_math_forward_kinematics", "robot_math_product_of_exponentials"],
  }),
  session({
    id: "robot_math_product_of_exponentials",
    part,
    title: "Product of Exponentials",
    level: "advanced",
    prerequisites: ["robot_math_homogeneous_transform_se3", "robot_math_3d_rotation_so3"],
    learningObjectives: ["twist와 screw axis 의미를 설명한다.", "matrix exponential으로 joint motion을 SE(3)에 올린다.", "POE와 DH의 차이를 비교한다."],
    theory: {
      definition: "Product of Exponentials는 각 관절의 screw motion exponential을 곱해 로봇팔의 forward kinematics를 표현하는 방법이다.",
      whyItMatters: "복잡한 3D 로봇팔에서는 DH보다 screw axis 기반 표현이 깔끔하고 modern robotics, MoveIt2 이해에 도움이 된다.",
      intuition: "각 관절이 만드는 작은 회전/이동 마법 스탬프를 순서대로 찍으면 마지막 손 위치가 나온다고 생각하면 된다.",
      equations: [
        makeEquation("POE FK", "T(theta)=e^[S1 theta1] e^[S2 theta2] ... e^[Sn thetan] M", [["S_i", "space screw axis"], ["theta_i", "joint variable"], ["M", "home pose"]], "home pose에 각 joint motion을 순서대로 적용한다."),
        makeEquation("Rodrigues", "R=e^[w]theta=I+sin(theta)[w]+(1-cos(theta))[w]^2", [["w", "unit angular axis"], ["[w]", "skew matrix"]], "회전 exponential은 Rodrigues 공식으로 계산한다."),
      ],
      derivation: [
        step("관절 운동을 twist로 표현", "revolute는 w와 v=-w x q로 screw axis를 만든다."),
        step("twist exponential 계산", "w가 있으면 Rodrigues와 G(theta)v로 SE(3)을 만든다."),
        step("home pose 적용", "모든 관절 motion을 곱한 뒤 M을 곱한다."),
        step("space/body convention 확인", "space screw인지 body screw인지에 따라 곱 순서와 축이 달라진다."),
      ],
      handCalculation: {
        problem: "z축 원점 revolute joint 하나가 theta=90도 돌 때 p=[1,0,0]은 어디로 가는가?",
        given: { w: "[0,0,1]", v: "[0,0,0]", theta: "pi/2", p: "[1,0,0]" },
        steps: ["v=0이므로 translation은 0", "Rz(pi/2)를 만든다", "Rz p=[0,1,0]"],
        answer: "[0,1,0]",
      },
      robotApplication: "현대 로봇학 교재와 많은 manipulator library가 screw axis 기반 FK/Jacobian을 사용한다.",
    },
    codeLabs: [poeLab],
    visualizations: [
      makeVisualization("vis_product_of_exponentials", "POE Screw Motion", "robot_math_product_of_exponentials", "T(theta)=prod(exp([S_i]theta_i))M", poeLab.id, [
        { name: "theta", symbol: "theta", min: -3.141593, max: 3.141593, default: 1.570796, description: "joint displacement" },
        { name: "axis_z", symbol: "w_z", min: -1, max: 1, default: 1, description: "z angular axis component" },
      ], "unit screw axis와 theta가 맞으면 점이 screw motion 경로를 따른다.", "skew 부호가 틀리면 회전 방향이 반대로 보인다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "robot_math_product_of_exponentials",
      conceptTag: "robot_math_product_of_exponentials",
      reviewSession: "Product of Exponentials",
      conceptQuestion: "POE에서 M은 무엇인가?",
      conceptAnswer: "모든 joint displacement가 0일 때 end-effector의 home pose이다.",
      calculationQuestion: "z축 revolute theta=pi/2가 [1,0,0]에 주는 결과는?",
      calculationAnswer: "[0,1,0]이다.",
      codeQuestion: "skew(w) @ x는 어떤 벡터 연산과 같아야 하는가?",
      codeAnswer: "np.cross(w, x)와 같아야 한다.",
      debugQuestion: "회전 방향이 반대로 나오면 무엇을 확인하는가?",
      debugAnswer: "skew 행렬 부호와 screw axis 방향을 확인한다.",
      visualQuestion: "theta를 키울 때 screw motion 경로는 어떻게 변하는가?",
      visualAnswer: "축 주변 회전 또는 축 방향 이동이 더 크게 누적된다.",
      robotQuestion: "POE가 로봇팔 제어에 필요한 이유는?",
      robotAnswer: "joint motion에서 end-effector pose와 Jacobian을 일관되게 유도하기 위해서다.",
      designQuestion: "space screw와 body screw API를 설계할 때 필요한 방어 장치는?",
      designAnswer: "함수 이름에 convention을 명시하고, 같은 robot으로 FK 결과가 일치하는 테스트를 둔다.",
    }),
    wrongAnswerTags: makeWrongTags("robot_math_product_of_exponentials", "POE screw axis 오류", ["robot_math_homogeneous_transform_se3", "robot_math_dh_parameter"]),
    nextSessions: ["robot_math_forward_kinematics", "robot_math_jacobian_velocity_kinematics"],
  }),
  session({
    id: "robot_math_forward_kinematics",
    part,
    title: "Forward Kinematics",
    level: "intermediate",
    prerequisites: ["robot_math_dh_parameter", "robot_math_product_of_exponentials"],
    learningObjectives: ["joint angle에서 end-effector 위치를 계산한다.", "2-link planar FK 식을 코드로 구현한다.", "FK 결과를 IK/Jacobian의 기준값으로 사용한다."],
    theory: {
      definition: "Forward Kinematics는 로봇의 관절값 q를 알 때 end-effector의 위치와 자세를 계산하는 문제다.",
      whyItMatters: "로봇팔이 현재 어디를 가리키는지 모르면 grasp, welding, inspection 같은 실제 작업을 계획할 수 없다.",
      intuition: "어깨를 먼저 돌리고, 팔꿈치를 돌린 뒤, 각 막대 끝을 차례대로 이어서 손끝 위치를 찾는 일이다.",
      equations: [
        makeEquation("2-link FK x", "x=l1 cos(theta1)+l2 cos(theta1+theta2)", [["l1,l2", "link lengths"], ["theta1,theta2", "joint angles"]], "두 link의 x 성분을 더한다."),
        makeEquation("2-link FK y", "y=l1 sin(theta1)+l2 sin(theta1+theta2)", [["sin", "y projection"], ["theta1+theta2", "second link absolute angle"]], "두 link의 y 성분을 더한다."),
      ],
      derivation: [
        step("첫 링크 벡터", "길이 l1, 각도 theta1의 벡터를 만든다.", "[l1 cos theta1, l1 sin theta1]"),
        step("둘째 링크 절대각", "둘째 링크는 theta1+theta2 방향을 본다."),
        step("두 벡터 합", "end-effector 위치는 link 벡터 합이다."),
        step("특수 자세 검산", "theta1=theta2=0이면 [l1+l2,0]이어야 한다."),
      ],
      handCalculation: {
        problem: "l1=l2=1, theta1=90도, theta2=0이면 말단 위치는?",
        given: { l1: 1, l2: 1, theta1: "pi/2", theta2: 0 },
        steps: ["첫 링크는 [0,1]", "둘째 링크도 절대각 pi/2라서 [0,1]", "합은 [0,2]"],
        answer: "[0,2]",
      },
      robotApplication: "MoveIt2 planning scene에서 현재 joint state를 end-effector pose로 바꾸는 가장 기본 계산이다.",
    },
    codeLabs: [fkLab],
    visualizations: [
      makeVisualization("vis_forward_kinematics", "2-Link Forward Kinematics", "robot_math_forward_kinematics", "x=l1 cos(theta1)+l2 cos(theta1+theta2)", fkLab.id, [
        { name: "theta1", symbol: "theta_1", min: -3.141593, max: 3.141593, default: 1.570796, description: "shoulder joint angle" },
        { name: "theta2", symbol: "theta_2", min: -3.141593, max: 3.141593, default: 0, description: "elbow joint angle" },
        { name: "l2", symbol: "l_2", min: 0.1, max: 2, default: 1, description: "second link length" },
      ], "link 벡터 두 개가 이어져 end-effector가 계산 위치에 놓인다.", "theta2를 절대각으로 착각하면 둘째 link 방향이 틀어진다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "robot_math_forward_kinematics",
      conceptTag: "robot_math_forward_kinematics",
      reviewSession: "Forward Kinematics",
      conceptQuestion: "Forward Kinematics는 어떤 입력에서 무엇을 계산하는가?",
      conceptAnswer: "관절값 q에서 end-effector pose를 계산한다.",
      calculationQuestion: "l1=l2=1, theta1=pi/2, theta2=0의 위치는?",
      calculationAnswer: "[0,2]이다.",
      codeQuestion: "2-link FK에서 둘째 링크 각도는 무엇을 써야 하는가?",
      codeAnswer: "theta1+theta2를 써야 한다.",
      debugQuestion: "theta1=theta2=0인데 [1,0]이 나오면 무엇이 빠졌는가?",
      debugAnswer: "둘째 link 길이 l2 항이 빠졌을 가능성이 크다.",
      visualQuestion: "theta2만 움직이면 어떤 link가 상대적으로 회전하는가?",
      visualAnswer: "둘째 링크가 첫 링크 끝을 기준으로 회전한다.",
      robotQuestion: "현재 joint state를 RViz tool pose로 보여줄 때 필요한 계산은?",
      robotAnswer: "Forward Kinematics이다.",
      designQuestion: "FK 모듈 테스트에 반드시 넣을 특수 자세는?",
      designAnswer: "straight arm, folded arm, vertical arm처럼 손으로 검산 가능한 자세를 넣는다.",
    }),
    wrongAnswerTags: makeWrongTags("robot_math_forward_kinematics", "FK joint angle 누적 오류", ["robot_math_dh_parameter"]),
    nextSessions: ["robot_math_inverse_kinematics", "robot_math_jacobian_velocity_kinematics"],
  }),
  session({
    id: "robot_math_inverse_kinematics",
    part,
    title: "Inverse Kinematics",
    level: "intermediate",
    prerequisites: ["robot_math_forward_kinematics", "least_squares"],
    learningObjectives: ["목표 위치에서 관절각을 찾는다.", "2-link IK의 reachable/unreachable 조건을 검사한다.", "elbow-up과 elbow-down 다중해를 구분한다."],
    theory: {
      definition: "Inverse Kinematics는 원하는 end-effector pose가 주어졌을 때 이를 만드는 joint 값을 찾는 문제다.",
      whyItMatters: "로봇팔에게 컵 위치를 주면 관절을 얼마나 돌려야 할지 계산해야 실제로 컵을 잡을 수 있다.",
      intuition: "손끝을 목표 점에 놓고, 어깨와 팔꿈치를 어디로 접어야 손이 닿는지 거꾸로 찾는 일이다.",
      equations: [
        makeEquation("Cosine law", "cos(theta2)=(x^2+y^2-l1^2-l2^2)/(2l1l2)", [["x,y", "target position"], ["l1,l2", "link lengths"], ["theta2", "elbow angle"]], "삼각형 변 길이로 팔꿈치 각도를 구한다."),
        makeEquation("Shoulder angle", "theta1=atan2(y,x)-atan2(l2 sin(theta2), l1+l2 cos(theta2))", [["atan2", "quadrant-safe angle"], ["theta1", "shoulder angle"]], "목표 방향에서 팔꿈치가 만드는 보정각을 뺀다."),
      ],
      derivation: [
        step("목표까지 거리", "r^2=x^2+y^2를 계산한다."),
        step("코사인 법칙", "l1,l2,r로 theta2의 cos 값을 얻는다."),
        step("도달 가능성 검사", "cos(theta2)가 [-1,1] 밖이면 닿을 수 없다."),
        step("어깨각 계산", "목표 방향 atan2(y,x)에서 내부 삼각형 보정각을 뺀다."),
      ],
      handCalculation: {
        problem: "l1=l2=1, target=[1,1]일 때 elbow-down IK는?",
        given: { l1: 1, l2: 1, x: 1, y: 1 },
        steps: ["cos(theta2)=(2-1-1)/2=0", "theta2=pi/2", "theta1=atan2(1,1)-atan2(1,1)=0"],
        answer: "theta1=0, theta2=pi/2",
      },
      robotApplication: "Pick-and-place에서 target grasp pose를 받아 joint trajectory 시작점을 계산한다.",
    },
    codeLabs: [ikLab],
    visualizations: [
      makeVisualization("vis_inverse_kinematics", "2-Link Inverse Kinematics", "robot_math_inverse_kinematics", "cos(theta2)=(x^2+y^2-l1^2-l2^2)/(2l1l2)", ikLab.id, [
        { name: "target_x", symbol: "x", min: -2.5, max: 2.5, default: 1, description: "target x" },
        { name: "target_y", symbol: "y", min: -2.5, max: 2.5, default: 1, description: "target y" },
        { name: "elbow", symbol: "mode", min: 0, max: 1, default: 0, description: "0 elbow-down, 1 elbow-up" },
      ], "목표가 workspace 안에 있으면 두 가지 elbow 자세 중 하나를 선택할 수 있다.", "목표 거리가 l1+l2보다 크면 팔이 닿지 않아 해가 없다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "robot_math_inverse_kinematics",
      conceptTag: "robot_math_inverse_kinematics",
      reviewSession: "Inverse Kinematics",
      conceptQuestion: "IK는 FK와 반대로 무엇을 찾는가?",
      conceptAnswer: "목표 end-effector pose를 만드는 joint 값을 찾는다.",
      calculationQuestion: "l1=l2=1, target [1,1]의 elbow-down 해는?",
      calculationAnswer: "theta1=0, theta2=pi/2이다.",
      codeQuestion: "acos에 넣기 전에 c2에 해야 하는 안전 처리는?",
      codeAnswer: "도달 가능성을 검사하고 np.clip(c2,-1,1)을 적용한다.",
      debugQuestion: "target [3,0], l1=l2=1에서 오류가 나야 하는 이유는?",
      debugAnswer: "최대 도달 거리가 2라서 unreachable target이다.",
      visualQuestion: "elbow mode를 바꾸면 end-effector는 같고 무엇이 달라지는가?",
      visualAnswer: "어깨와 팔꿈치 관절각, 즉 팔의 접힌 모양이 달라진다.",
      robotQuestion: "컵 위치가 workspace 밖이면 로봇은 무엇을 해야 하는가?",
      robotAnswer: "IK 실패를 보고하고 base 이동, 목표 재계획, 안전 정지를 선택해야 한다.",
      designQuestion: "IK API가 반환해야 하는 정보 3가지는?",
      designAnswer: "성공 여부, joint solution, 실패 이유 또는 residual error이다.",
    }),
    wrongAnswerTags: makeWrongTags("robot_math_inverse_kinematics", "IK 도달 가능성/다중해 오류", ["robot_math_forward_kinematics"]),
    nextSessions: ["robot_math_jacobian_velocity_kinematics", "robot_math_singularity_damped_least_squares"],
  }),
  session({
    id: "robot_math_jacobian_velocity_kinematics",
    part,
    title: "Jacobian Velocity Kinematics",
    level: "intermediate",
    prerequisites: ["robot_math_forward_kinematics", "multivariable_calculus"],
    learningObjectives: ["FK를 joint angle로 미분해 Jacobian을 만든다.", "qdot에서 end-effector velocity를 계산한다.", "Jacobian determinant와 singularity의 관계를 준비한다."],
    theory: {
      definition: "Jacobian Velocity Kinematics는 joint velocity qdot과 end-effector velocity v 사이의 선형 관계 v=J(q)qdot을 다룬다.",
      whyItMatters: "로봇팔을 부드럽게 움직이고 힘/속도 제어를 하려면 관절 속도가 손끝 속도로 어떻게 바뀌는지 알아야 한다.",
      intuition: "각 관절을 아주 조금 돌렸을 때 손끝이 어느 방향으로 얼마나 움직이는지 적은 변화량 지도다.",
      equations: [
        makeEquation("Velocity mapping", "v=J(q)qdot", [["v", "end-effector velocity"], ["J(q)", "Jacobian"], ["qdot", "joint velocity"]], "현재 자세 q에서 속도 관계는 선형이다."),
        makeEquation("2-link Jacobian", "J=[[-l1 s1-l2 s12,-l2 s12],[l1 c1+l2 c12,l2 c12]]", [["s1", "sin(theta1)"], ["s12", "sin(theta1+theta2)"], ["c12", "cos(theta1+theta2)"]], "FK x,y를 theta1,theta2로 미분한 결과다."),
      ],
      derivation: [
        step("FK x 미분", "x를 theta1, theta2로 각각 미분해 J 첫 행을 만든다."),
        step("FK y 미분", "y를 theta1, theta2로 각각 미분해 J 둘째 행을 만든다."),
        step("미소 변화 관계", "작은 dq가 end-effector dp를 만든다.", "dp=J dq"),
        step("시간으로 나누기", "dp/dt=J dq/dt라서 v=J qdot이 된다."),
      ],
      handCalculation: {
        problem: "l1=l2=1, theta1=0, theta2=0, qdot=[1,0]이면 v는?",
        given: { l1: 1, l2: 1, theta1: 0, theta2: 0, qdot: "[1,0]" },
        steps: ["J=[[0,0],[2,1]]", "J qdot=[0,2]", "손끝은 위쪽으로 속도 2"],
        answer: "[0,2]",
      },
      robotApplication: "resolved-rate control에서 목표 손끝 속도를 만들기 위한 관절 속도를 계산한다.",
    },
    codeLabs: [jacobianLab],
    visualizations: [
      makeVisualization("vis_jacobian_velocity", "Jacobian Velocity Mapping", "robot_math_jacobian_velocity_kinematics", "v=J(q)qdot", jacobianLab.id, [
        { name: "theta1", symbol: "theta_1", min: -3.141593, max: 3.141593, default: 0, description: "shoulder angle" },
        { name: "theta2", symbol: "theta_2", min: -3.141593, max: 3.141593, default: 0, description: "elbow angle" },
        { name: "qdot1", symbol: "qdot_1", min: -2, max: 2, default: 1, description: "shoulder velocity" },
      ], "qdot 화살표가 J를 통과해 end-effector velocity 화살표로 변한다.", "Jacobian 미분 부호가 틀리면 속도 화살표가 반대 방향을 향한다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "robot_math_jacobian_velocity_kinematics",
      conceptTag: "robot_math_jacobian_velocity_kinematics",
      reviewSession: "Jacobian Velocity Kinematics",
      conceptQuestion: "Jacobian은 어떤 두 속도를 연결하는가?",
      conceptAnswer: "joint velocity qdot과 end-effector velocity v를 연결한다.",
      calculationQuestion: "J=[[0,0],[2,1]], qdot=[1,0]이면 v는?",
      calculationAnswer: "[0,2]이다.",
      codeQuestion: "end_effector_velocity 함수의 핵심 한 줄은?",
      codeAnswer: "return J @ qdot이다.",
      debugQuestion: "속도 방향이 반대로 나오면 어떤 계산을 의심하는가?",
      debugAnswer: "FK 미분 부호나 qdot 순서를 의심한다.",
      visualQuestion: "qdot1을 0으로 만들면 시각화에서 무엇이 사라지는가?",
      visualAnswer: "첫 번째 관절 속도가 만드는 손끝 속도 성분이 사라진다.",
      robotQuestion: "손끝을 일정 속도로 직선 이동시키려면 어떤 관계를 풀어야 하는가?",
      robotAnswer: "v=J qdot에서 qdot을 풀어야 한다.",
      designQuestion: "Jacobian 기반 제어 루프가 매 tick 다시 계산해야 하는 것은?",
      designAnswer: "현재 q에서의 J(q), 목표 error, qdot 제한을 다시 계산해야 한다.",
    }),
    wrongAnswerTags: makeWrongTags("robot_math_jacobian_velocity_kinematics", "Jacobian 미분/속도 매핑 오류", ["robot_math_forward_kinematics"]),
    nextSessions: ["robot_math_singularity_damped_least_squares", "robot_dynamics_2link_lagrange"],
  }),
  session({
    id: "robot_math_singularity_damped_least_squares",
    part,
    title: "Singularity and Damped Least Squares",
    level: "advanced",
    prerequisites: ["robot_math_jacobian_velocity_kinematics", "svd_condition_number"],
    learningObjectives: ["singularity에서 Jacobian rank가 줄어드는 이유를 설명한다.", "Damped Least Squares로 qdot 폭주를 줄인다.", "damping과 tracking error의 trade-off를 해석한다."],
    theory: {
      definition: "Singularity는 Jacobian이 일부 방향 속도를 만들 수 없는 자세이고, Damped Least Squares는 작은 damping을 더해 역문제를 안정화하는 방법이다.",
      whyItMatters: "로봇팔이 쭉 펴진 자세 같은 singularity 근처에서 pseudoinverse만 쓰면 관절 속도가 폭주해 위험해질 수 있다.",
      intuition: "팔이 완전히 펴지면 어떤 방향으로는 손끝을 바로 밀기 어렵다. DLS는 무리해서 세게 돌리지 말고 조금 부드럽게 포기하는 브레이크다.",
      equations: [
        makeEquation("Pseudoinverse IK", "qdot=J^+ e", [["J^+", "Jacobian pseudoinverse"], ["e", "task-space error"]], "일반적인 최소제곱 속도 해다."),
        makeEquation("DLS", "qdot=J^T(JJ^T+lambda^2 I)^-1 e", [["lambda", "damping factor"], ["I", "identity"], ["e", "task error"]], "lambda^2 I가 작은 singular value의 gain을 제한한다."),
      ],
      derivation: [
        step("최소제곱 목표", "||J qdot - e||^2를 작게 만들고 싶다."),
        step("damping 추가", "관절 속도 폭주를 막기 위해 lambda^2||qdot||^2를 더한다."),
        step("정규방정식", "미분해 qdot 해를 얻는다.", "(J^T J+lambda^2 I)qdot=J^T e"),
        step("task-space 형태", "계산 안정성을 위해 J^T(JJ^T+lambda^2I)^-1 e 형태를 쓴다."),
      ],
      handCalculation: {
        problem: "J=[[1,0],[0,0]], e=[1,1], lambda=1일 때 DLS qdot은?",
        given: { J: "[[1,0],[0,0]]", e: "[1,1]", lambda: 1 },
        steps: ["JJ^T+I=[[2,0],[0,1]]", "inverse는 [[0.5,0],[0,1]]", "J^T inverse e=[0.5,0]"],
        answer: "[0.5,0]",
      },
      robotApplication: "resolved-rate IK에서 singularity 근처 관절 속도 제한과 안전 정지를 함께 설계할 때 DLS가 기본 도구가 된다.",
    },
    codeLabs: [dlsLab],
    visualizations: [
      makeVisualization("vis_singularity_dls", "Singularity and DLS Gain", "robot_math_singularity_damped_least_squares", "qdot=J^T(JJ^T+lambda^2I)^-1e", dlsLab.id, [
        { name: "sigma_min", symbol: "sigma_min", min: 0, max: 1, default: 0.05, description: "smallest singular value" },
        { name: "damping", symbol: "lambda", min: 0.001, max: 1, default: 0.1, description: "DLS damping" },
        { name: "error_norm", symbol: "||e||", min: 0, max: 2, default: 1, description: "task error norm" },
      ], "damping이 적당하면 qdot norm이 제한되면서 목표 방향을 따라간다.", "damping이 0이고 sigma_min이 0에 가까우면 qdot gain이 폭주한다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "robot_math_singularity_damped_least_squares",
      conceptTag: "robot_math_singularity_damped_least_squares",
      reviewSession: "Singularity and Damped Least Squares",
      conceptQuestion: "singularity에서는 Jacobian에 어떤 일이 생기는가?",
      conceptAnswer: "rank가 줄거나 sigma_min이 0에 가까워져 특정 방향 속도를 만들기 어렵다.",
      calculationQuestion: "J=[[1,0],[0,0]], e=[1,1], lambda=1의 DLS qdot은?",
      calculationAnswer: "[0.5,0]이다.",
      codeQuestion: "DLS 식에서 더해야 하는 안정화 항은?",
      codeAnswer: "lambda^2 I를 JJ.T에 더한다.",
      debugQuestion: "singularity 근처 qdot이 너무 크면 어떤 파라미터를 키우는가?",
      debugAnswer: "damping lambda를 키운다.",
      visualQuestion: "sigma_min이 0에 가까워질 때 damping이 없으면 gain은 어떻게 되는가?",
      visualAnswer: "gain이 매우 커져 관절 속도가 폭주한다.",
      robotQuestion: "로봇팔이 완전히 펴진 자세에서 빠른 Cartesian 명령을 받으면 위험한 이유는?",
      robotAnswer: "작은 손끝 속도를 만들기 위해 매우 큰 관절 속도가 필요할 수 있기 때문이다.",
      designQuestion: "DLS 제어기에 함께 넣어야 하는 안전 장치 2개는?",
      designAnswer: "qdot limit clamp와 singularity/damping watchdog을 넣는다.",
    }),
    wrongAnswerTags: makeWrongTags("robot_math_singularity_damped_least_squares", "singularity/DLS 수치 안정성 오류", ["robot_math_jacobian_velocity_kinematics", "svd_condition_number"]),
    nextSessions: ["ros2_tf2_transform", "mpc_formulation"],
  }),
];

type RobotMathEnrichment = {
  estimatedMinutes: number;
  difficulty: NonNullable<Session["difficulty"]>;
  realWorldUseCase: string;
  extensionTask: string;
  commonMistakes: string[];
  counterexample: {
    question: string;
    expectedAnswer: string;
    explanation: string;
    hint: string;
    failureMode: string;
    errorType: QuizQuestionV2["wrongAnswerAnalysis"]["errorType"];
  };
  codeTrace: {
    question: string;
    codeSnippet: string;
    expectedAnswer: string;
    choices: string[];
    explanation: string;
  };
};

const robotMathEnrichmentById: Record<string, RobotMathEnrichment> = {
  robot_math_2d_rotation_matrix: {
    estimatedMinutes: 55,
    difficulty: "easy",
    realWorldUseCase: "모바일 로봇의 base_link 방향을 map frame으로 돌리고, LiDAR 점을 로봇 진행 방향 기준으로 해석할 때 사용한다.",
    extensionTask: "degree 입력 전용 함수 rotate_point_deg를 추가하고 radian 함수와 테스트를 분리해 단위 오류를 API에서 막아라.",
    commonMistakes: ["theta=90을 radian처럼 넣음", "sin 부호를 반대로 써 회전 방향이 뒤집힘", "R @ p 대신 p @ R을 사용함"],
    counterexample: {
      question: "이 명제가 실패하는 입력을 찾아라: `rotation_matrix(theta)`에 theta=90을 넣으면 점 [1,0]이 [0,1]이 된다.",
      expectedAnswer: "theta=90은 90도가 아니라 90 radian이므로 실패한다. 올바른 입력은 np.pi/2 또는 np.deg2rad(90)이다.",
      explanation: "NumPy sin/cos는 radian을 받는다. degree 값을 그대로 넣으면 수식은 맞아도 단위가 틀려 로봇 좌표가 잘못 돈다.",
      hint: "sin과 cos 함수가 어떤 각도 단위를 받는지 확인한다.",
      failureMode: "degree/radian 단위 오류로 센서 점이 엉뚱한 방향으로 회전한다.",
      errorType: "unit_error",
    },
    codeTrace: {
      question: "다음 코드의 출력으로 맞는 것을 고르라.",
      codeSnippet: "theta = np.pi / 2\np = np.array([1.0, 0.0])\nR = np.array([[np.cos(theta), -np.sin(theta)], [np.sin(theta), np.cos(theta)]])\nprint(np.round(R @ p, 3))",
      expectedAnswer: "출력은 [0. 1.] 이다.",
      choices: ["출력은 [0. 1.] 이다.", "출력은 [1. 0.] 이다.", "출력은 [0. -1.] 이다."],
      explanation: "pi/2 회전에서는 cos=0, sin=1이므로 x축 점 [1,0]이 y축 점 [0,1]로 이동한다.",
    },
  },
  robot_math_3d_rotation_so3: {
    estimatedMinutes: 65,
    difficulty: "medium",
    realWorldUseCase: "camera_link, imu_link, end_effector의 3D 자세가 올바른 회전인지 검사하고 TF2 frame 오류를 줄일 때 사용한다.",
    extensionTask: "Rx, Ry, Rz를 모두 구현하고 Rz @ Ry와 Ry @ Rz가 다른 반례를 시각화하라.",
    commonMistakes: ["det(R)=-1인 reflection을 회전으로 착각함", "R.T @ R 검사를 생략함", "roll-pitch-yaw 곱 순서를 문서와 다르게 씀"],
    counterexample: {
      question: "`R.T @ R = I`이면 항상 올바른 3D 회전행렬이라는 주장에 대한 반례를 찾아라.",
      expectedAnswer: "diag([-1, 1, 1])은 R.T @ R=I지만 det(R)=-1이라 reflection이며 SO(3) 회전이 아니다.",
      explanation: "SO(3)는 직교성뿐 아니라 det(R)=1도 필요하다. det=-1은 오른손 좌표계를 뒤집는 거울 반사다.",
      hint: "길이는 보존하지만 좌표계 손잡이를 뒤집는 행렬을 생각한다.",
      failureMode: "카메라 좌표가 거울처럼 뒤집혀 grasp 방향이나 yaw 판단이 반대로 나온다.",
      errorType: "formula_misunderstanding",
    },
    codeTrace: {
      question: "다음 코드의 두 출력으로 맞는 것을 고르라.",
      codeSnippet: "R = np.diag([-1.0, 1.0, 1.0])\nprint(np.allclose(R.T @ R, np.eye(3)))\nprint(round(np.linalg.det(R)))",
      expectedAnswer: "True와 -1이 출력된다.",
      choices: ["True와 -1이 출력된다.", "True와 1이 출력된다.", "False와 -1이 출력된다."],
      explanation: "diag([-1,1,1])은 축 길이와 직각은 보존하지만 determinant가 -1인 reflection이다.",
    },
  },
  robot_math_quaternion_slerp: {
    estimatedMinutes: 75,
    difficulty: "medium",
    realWorldUseCase: "MoveIt waypoint 사이 end-effector orientation을 튀지 않게 연결하고 ROS2 TF quaternion을 안전하게 정규화한다.",
    extensionTask: "q와 -q가 같은 자세임을 이용해 dot<0 처리 전후의 회전 경로 길이를 비교하라.",
    commonMistakes: ["quaternion norm을 1로 만들지 않음", "wxyz와 xyzw 순서를 섞음", "dot<0 처리를 빼 긴 경로로 회전함"],
    counterexample: {
      question: "`q=[2,0,0,0]`도 identity 회전처럼 보이므로 정규화하지 않아도 된다는 주장에 대한 반례를 설명하라.",
      expectedAnswer: "회전 quaternion은 ||q||=1이어야 한다. q=[2,0,0,0]은 norm=2라서 곱셈 기반 회전에서 scale이 섞일 수 있으므로 normalize해야 한다.",
      explanation: "단위 quaternion 조건은 회전을 길이 보존 변환으로 만들기 위한 조건이다. norm drift는 자세 보간과 TF 변환을 불안정하게 만든다.",
      hint: "회전은 벡터 길이를 바꾸면 안 된다.",
      failureMode: "자세 보간 중 norm이 1에서 벗어나 회전축이 흔들리거나 시각화가 튄다.",
      errorType: "numerical_stability_error",
    },
    codeTrace: {
      question: "다음 코드의 출력으로 맞는 것을 고르라.",
      codeSnippet: "q = np.array([2.0, 0.0, 0.0, 0.0])\nq = q / np.linalg.norm(q)\nprint(q)",
      expectedAnswer: "출력은 [1. 0. 0. 0.] 이다.",
      choices: ["출력은 [1. 0. 0. 0.] 이다.", "출력은 [2. 0. 0. 0.] 이다.", "출력은 [0. 0. 0. 1.] 이다."],
      explanation: "norm이 2인 quaternion을 2로 나누면 identity 단위 quaternion [1,0,0,0]이 된다.",
    },
  },
  robot_math_homogeneous_transform_se3: {
    estimatedMinutes: 70,
    difficulty: "medium",
    realWorldUseCase: "카메라 extrinsic calibration과 로봇팔 FK chain에서 회전과 이동을 하나의 4x4 행렬로 연결한다.",
    extensionTask: "T_ab와 T_ba를 모두 구현하고 T_ab @ T_ba가 identity가 되는지 테스트하라.",
    commonMistakes: ["translation을 마지막 행에 넣음", "homogeneous 좌표 1을 빼먹음", "T_ab와 T_ba 방향을 반대로 곱함"],
    counterexample: {
      question: "`T1 @ T2`와 `T2 @ T1`은 같은 transform이라는 주장에 대한 반례를 들어라.",
      expectedAnswer: "회전 90도와 x방향 translation은 순서를 바꾸면 최종 점이 달라진다. SE(3) 행렬곱은 일반적으로 교환되지 않는다.",
      explanation: "먼저 돌리고 이동하는 것과 먼저 이동하고 돌리는 것은 기준 frame이 다르다. TF2 chain에서 이 순서 오류가 가장 흔하다.",
      hint: "Rz(90도)와 t=[1,0,0]을 한 점에 서로 다른 순서로 적용한다.",
      failureMode: "camera_link 점을 base_link로 보낼 때 물체 위치가 다른 곳에 나타난다.",
      errorType: "robot_application_error",
    },
    codeTrace: {
      question: "다음 코드의 출력으로 맞는 것을 고르라.",
      codeSnippet: "R = np.array([[0,-1,0],[1,0,0],[0,0,1]])\nt = np.array([1,2,0])\np = np.array([1,0,0])\nprint(R @ p + t)",
      expectedAnswer: "출력은 [1 3 0] 이다.",
      choices: ["출력은 [1 3 0] 이다.", "출력은 [0 1 0] 이다.", "출력은 [2 2 0] 이다."],
      explanation: "먼저 Rz(90도)가 [1,0,0]을 [0,1,0]으로 만들고, 그 뒤 translation [1,2,0]을 더한다.",
    },
  },
  robot_math_dh_parameter: {
    estimatedMinutes: 75,
    difficulty: "medium",
    realWorldUseCase: "산업용 로봇팔 매뉴얼의 DH table을 FK 코드와 비교하고 URDF joint origin 검증 기준으로 사용한다.",
    extensionTask: "2-link DH table과 URDF joint origin에서 같은 FK 위치가 나오는지 검산하라.",
    commonMistakes: ["a와 d를 서로 바꿈", "theta와 alpha 회전축을 혼동함", "link transform 곱 순서를 뒤집음"],
    counterexample: {
      question: "2-link planar arm에서 a1=a2=1이어야 하는데 d1=d2=1로 넣은 DH table의 실패를 설명하라.",
      expectedAnswer: "planar arm의 link 길이는 x축 방향 a에 들어가야 한다. d에 넣으면 z축 offset이 되어 말단이 [2,0,0]이 아니라 z방향으로 틀어진다.",
      explanation: "DH의 a는 link length, d는 joint z축 offset이다. 둘을 바꾸면 로봇팔이 전혀 다른 기구처럼 계산된다.",
      hint: "a는 x축 이동, d는 z축 이동이다.",
      failureMode: "시뮬레이터의 팔 길이와 실제 팔 길이가 맞지 않아 FK/IK가 동시에 틀어진다.",
      errorType: "formula_misunderstanding",
    },
    codeTrace: {
      question: "다음 2-link DH chain 출력으로 맞는 것을 고르라.",
      codeSnippet: "params = [(1.0, 0.0, 0.0, 0.0), (1.0, 0.0, 0.0, 0.0)]\nT = chain_dh(params)\nprint(np.round(T[:3, 3], 3))",
      expectedAnswer: "출력은 [2. 0. 0.] 이다.",
      choices: ["출력은 [2. 0. 0.] 이다.", "출력은 [0. 0. 2.] 이다.", "출력은 [1. 1. 0.] 이다."],
      explanation: "두 link가 모두 x축 방향으로 1씩 이어지므로 말단 translation은 [2,0,0]이다.",
    },
  },
  robot_math_forward_kinematics: {
    estimatedMinutes: 60,
    difficulty: "medium",
    realWorldUseCase: "현재 joint state에서 그리퍼 위치를 계산해 RViz, MoveIt planning scene, 충돌 검사에 전달한다.",
    extensionTask: "q1,q2 grid를 훑어 reachable workspace 점군을 만들고 IK 해 존재 여부와 비교하라.",
    commonMistakes: ["두 번째 링크에 theta2만 사용함", "degree 값을 radian으로 변환하지 않음", "link length 단위를 cm/m로 섞음"],
    counterexample: {
      question: "`x=l1*cos(q1)+l2*cos(q2)`가 2-link FK라는 주장에 대한 반례를 들어라.",
      expectedAnswer: "q1=90도, q2=0이면 올바른 FK는 [0,2]지만 잘못된 식은 x=1, y=1처럼 둘째 링크 절대각을 틀리게 계산한다.",
      explanation: "둘째 링크의 절대 방향은 q2가 아니라 q1+q2다. 관절각은 링크를 따라 누적된다.",
      hint: "팔꿈치 각도는 월드 기준 각도가 아니라 첫 링크에 대한 상대각이다.",
      failureMode: "로봇팔 시각화의 손끝이 실제 팔 끝과 다른 위치에 표시된다.",
      errorType: "formula_misunderstanding",
    },
    codeTrace: {
      question: "다음 코드의 출력으로 맞는 것을 고르라.",
      codeSnippet: "print(np.round(fk_2link(1.0, 1.0, np.pi / 2, 0.0), 3))",
      expectedAnswer: "출력은 [0. 2.] 이다.",
      choices: ["출력은 [0. 2.] 이다.", "출력은 [1. 1.] 이다.", "출력은 [2. 0.] 이다."],
      explanation: "두 링크가 모두 위쪽을 보므로 y 성분이 1+1=2가 된다.",
    },
  },
  robot_math_inverse_kinematics: {
    estimatedMinutes: 80,
    difficulty: "medium",
    realWorldUseCase: "로봇팔이 물체 grasp 목표를 받았을 때 가능한 관절각을 찾고, 닿지 않는 목표를 안전하게 거부한다.",
    extensionTask: "elbow-up/down 해를 모두 FK로 검산하고 joint limit을 만족하는 해만 선택하라.",
    commonMistakes: ["unreachable target 검사를 빼먹음", "acos 입력을 clamp하지 않음", "elbow-up/down 다중해를 하나로 착각함"],
    counterexample: {
      question: "l1=l2=1인 팔에서 모든 target에 IK 해가 있다는 주장에 대한 반례를 찾아라.",
      expectedAnswer: "target=[3,0]은 원점에서 거리 3이고 최대 도달 거리는 2라서 해가 없다. IK는 ValueError 또는 실패 상태를 반환해야 한다.",
      explanation: "reachable workspace는 두 링크 길이의 합과 차이로 제한된다. 닿지 않는 목표를 억지로 풀면 관절 명령이 위험해진다.",
      hint: "목표까지 거리 r과 l1+l2를 비교한다.",
      failureMode: "팔이 닿지 않는 목표로 계속 움직이며 joint limit 또는 singularity 근처로 몰린다.",
      errorType: "safety_misjudgment",
    },
    codeTrace: {
      question: "다음 코드의 결과로 맞는 것을 고르라.",
      codeSnippet: "try:\n    print(ik_2link(1.0, 1.0, 3.0, 0.0))\nexcept ValueError as error:\n    print('unreachable')",
      expectedAnswer: "출력은 unreachable 이다.",
      choices: ["출력은 unreachable 이다.", "출력은 [0. 0.] 이다.", "출력은 [3. 0.] 이다."],
      explanation: "최대 도달 거리 2보다 target 거리 3이 크므로 IK 함수가 실패를 보고해야 한다.",
    },
  },
  robot_math_jacobian_velocity_kinematics: {
    estimatedMinutes: 85,
    difficulty: "hard",
    realWorldUseCase: "resolved-rate control에서 원하는 손끝 속도를 관절 속도로 바꾸고 singularity 위험을 미리 감지한다.",
    extensionTask: "analytic Jacobian과 finite-difference Jacobian을 같은 q에서 비교하고 오차 norm을 출력하라.",
    commonMistakes: ["FK 미분 부호를 틀림", "qdot 순서를 바꿈", "det(J)=0 특이점을 속도 향상으로 오해함"],
    counterexample: {
      question: "2-link arm의 모든 자세에서 Jacobian이 역행렬을 가진다는 주장에 대한 반례를 찾아라.",
      expectedAnswer: "theta2=0 또는 pi이면 det(J)=l1*l2*sin(theta2)=0이라 Jacobian이 singular해 역행렬이 없다.",
      explanation: "팔이 완전히 펴지거나 접힌 자세에서는 특정 방향 손끝 속도를 만들 수 없다.",
      hint: "2-link planar Jacobian determinant는 l1*l2*sin(theta2)다.",
      failureMode: "pseudoinverse 제어가 큰 관절 속도를 내며 로봇팔이 떨리거나 제한에 걸린다.",
      errorType: "numerical_stability_error",
    },
    codeTrace: {
      question: "다음 코드의 출력으로 맞는 것을 고르라.",
      codeSnippet: "J = jacobian_2link(1.0, 1.0, 0.0, 0.0)\nprint(np.round(np.linalg.det(J), 3))",
      expectedAnswer: "출력은 0.0 이다.",
      choices: ["출력은 0.0 이다.", "출력은 1.0 이다.", "출력은 2.0 이다."],
      explanation: "theta2=0인 straight arm은 det(J)=l1*l2*sin(0)=0인 singularity다.",
    },
  },
  robot_math_singularity_damped_least_squares: {
    estimatedMinutes: 90,
    difficulty: "hard",
    realWorldUseCase: "로봇팔 Cartesian 제어가 singularity 근처에서 관절 속도 폭주를 일으키지 않도록 안정화한다.",
    extensionTask: "lambda sweep을 수행해 task error와 qdot norm trade-off 표를 만들고 안전한 기본값을 선택하라.",
    commonMistakes: ["lambda 대신 lambda^2를 더해야 함을 놓침", "rank deficient J를 직접 inverse 함", "lambda를 너무 크게 잡아 목표를 거의 따라가지 못함"],
    counterexample: {
      question: "DLS에서 damping lambda를 항상 0에 가깝게 작게 잡는 것이 좋다는 주장에 대한 반례를 들어라.",
      expectedAnswer: "rank deficient J=[[1,0],[0,0]]에서 lambda=0이면 JJ^T가 singular라 역행렬 계산이 실패하거나 qdot이 폭주한다.",
      explanation: "작은 lambda는 정확도는 높일 수 있지만 singularity 근처 안정성을 잃는다. DLS는 안정성과 추종 오차의 trade-off다.",
      hint: "JJ^T에 역행렬이 존재하는지 확인한다.",
      failureMode: "singularity 근처에서 관절 속도 명령이 무한대처럼 커진다.",
      errorType: "numerical_stability_error",
    },
    codeTrace: {
      question: "다음 코드의 출력으로 맞는 것을 고르라.",
      codeSnippet: "J = np.array([[1.0, 0.0], [0.0, 0.0]])\ne = np.array([1.0, 1.0])\nprint(np.round(dls_step(J, e, 1.0), 3))",
      expectedAnswer: "출력은 [0.5 0. ] 이다.",
      choices: ["출력은 [0.5 0. ] 이다.", "출력은 [1. 1.] 이다.", "코드는 항상 singular matrix 오류를 낸다."],
      explanation: "lambda^2 I가 더해져 rank deficient 상황에서도 유한한 qdot [0.5,0]이 나온다.",
    },
  },
};

const genericStepByStep = (quiz: QuizQuestionV2, item: Session) => [
  `${item.title}의 정의와 입력 단위를 먼저 확인한다.`,
  `문제의 숫자, 코드, 또는 로봇 상황을 conceptTag ${quiz.conceptTag}의 핵심 식에 연결한다.`,
  `기준 답은 "${quiz.expectedAnswer}"이며, 이 답이 나오는 중간 계산을 한 번 손으로 검산한다.`,
  `실제 로봇에서는 ${item.theory.robotApplication}`,
];

const makeCounterexampleQuestion = (item: Session, enrichment: RobotMathEnrichment): QuizQuestionV2 => ({
  id: `${item.id}_q08_counterexample`,
  type: "counterexample",
  difficulty: "hard",
  conceptTag: item.id,
  question: enrichment.counterexample.question,
  expectedAnswer: enrichment.counterexample.expectedAnswer,
  explanation: enrichment.counterexample.explanation,
  counterexampleHint: enrichment.counterexample.hint,
  expectedFailureMode: enrichment.counterexample.failureMode,
  stepByStepExplanation: [
    "명제가 항상 참이라고 가정하지 말고 경계 입력이나 단위 오류를 먼저 찾는다.",
    enrichment.counterexample.hint,
    enrichment.counterexample.expectedAnswer,
    `실패 모드는 ${enrichment.counterexample.failureMode}`,
  ],
  wrongAnswerAnalysis: {
    commonWrongAnswer: "정상 예제만 다시 계산하고 실패 입력을 제시하지 못함",
    whyWrong: "반례 문제는 맞는 사례가 아니라 명제를 깨는 입력과 실패 이유를 함께 찾아야 한다.",
    errorType: enrichment.counterexample.errorType,
    reviewSession: item.id,
    retryQuestionType: "code_debug",
    recommendedReview: [item.id],
    severity: "high",
  },
});

const makeCodeTraceQuestion = (item: Session, enrichment: RobotMathEnrichment): QuizQuestionV2 => ({
  id: `${item.id}_q09_code_trace`,
  type: "code_trace",
  difficulty: "medium",
  conceptTag: item.id,
  question: enrichment.codeTrace.question,
  codeSnippet: enrichment.codeTrace.codeSnippet,
  choices: enrichment.codeTrace.choices,
  expectedAnswer: enrichment.codeTrace.expectedAnswer,
  explanation: enrichment.codeTrace.explanation,
  stepByStepExplanation: [
    "코드를 한 줄씩 읽고 입력값의 단위와 shape를 확인한다.",
    "핵심 수식에 숫자를 대입해 중간값을 계산한다.",
    enrichment.codeTrace.expectedAnswer,
    "출력이 로봇 좌표, 자세, 속도에서 어떤 의미인지 말한다.",
  ],
  wrongAnswerAnalysis: {
    commonWrongAnswer: "코드 실행 순서를 건너뛰고 직감으로 출력값을 고름",
    whyWrong: "코드 추적 문제는 수식과 구현이 같은 순서로 적용되는지 검증하는 문제다.",
    errorType: "code_logic_error",
    reviewSession: item.id,
    retryQuestionType: "code_completion",
    recommendedReview: [item.id],
    severity: "medium",
  },
});

const enrichRobotMathSession = (item: Session): Session => {
  const enrichment = robotMathEnrichmentById[item.id];
  if (!enrichment) return item;
  const existingQuizIds = new Set(item.quizzes.map((quiz) => quiz.id));
  const extraQuizzes = [makeCounterexampleQuestion(item, enrichment), makeCodeTraceQuestion(item, enrichment)].filter(
    (quiz) => !existingQuizIds.has(quiz.id),
  );
  const quizzes = [...item.quizzes, ...extraQuizzes].map((quiz) => ({
    ...quiz,
    stepByStepExplanation: quiz.stepByStepExplanation ?? genericStepByStep(quiz, item),
  }));
  return {
    ...item,
    estimatedMinutes: enrichment.estimatedMinutes,
    difficulty: enrichment.difficulty,
    realWorldUseCase: enrichment.realWorldUseCase,
    extensionTask: enrichment.extensionTask,
    commonMistakes: enrichment.commonMistakes,
    flashcards: [
      {
        id: `${item.id}_flashcard_core`,
        front: `${item.title}에서 가장 먼저 확인해야 하는 실패 조건은?`,
        back: enrichment.counterexample.failureMode,
        conceptTag: item.id,
      },
    ],
    quizzes,
  };
};

const robotMathCoreSessions: Session[] = [
  session({
    id: "robot_math_2d_rotation_matrix",
    part,
    title: "2D Rotation Matrix",
    level: "beginner",
    prerequisites: ["unit_circle_trigonometry", "vector_matrix_basics"],
    learningObjectives: [
      "2D 평면에서 점을 회전시키는 방법을 설명한다.",
      "cos와 sin이 회전행렬에서 어떤 역할을 하는지 말한다.",
      "로봇 좌표계에서 회전이 왜 필요한지 예시로 설명한다.",
      "degree와 radian을 헷갈리면 왜 틀리는지 코드 테스트로 확인한다.",
    ],
    theory: {
      definition: "2D Rotation Matrix는 평면의 점을 원점 기준으로 theta만큼 회전시키는 2x2 행렬이다.",
      whyItMatters: "모바일 로봇의 yaw, 센서 좌표 변환, 로봇팔 평면 예제의 기본은 모두 2D 회전에서 시작한다.",
      intuition: "종이에 점을 하나 찍고 종이의 중심을 잡은 뒤 돌린다고 생각하면 된다. 점은 중심에서 같은 거리를 유지한 채 방향만 바뀐다.",
      equations: [
        makeEquation("2D rotation matrix", "R(theta)=[[cos(theta),-sin(theta)],[sin(theta),cos(theta)]]", [["R(theta)", "theta만큼 회전시키는 2x2 행렬"], ["theta", "회전각. 코드에서는 radian"], ["cos(theta)", "x축으로 남는 비율"], ["sin(theta)", "y축으로 넘어가는 비율"]], "cos는 기존 축에 남는 양, sin은 다른 축으로 넘어가는 양을 만든다."),
        makeEquation("Rotated point", "p_rotated=R(theta)p", [["p", "원래 점 [x,y]"], ["p_rotated", "회전된 점"], ["R(theta)", "회전행렬"]], "점 p에 회전행렬을 왼쪽에서 곱해 새 좌표를 얻는다."),
      ],
      derivation: [
        step("단위원에서 시작", "점 [1,0]을 theta만큼 돌리면 단위원 정의에 의해 [cos(theta), sin(theta)]가 된다.", "R(theta)[1,0]^T=[cos(theta),sin(theta)]^T"),
        step("y축 기저도 회전", "점 [0,1]은 [1,0]보다 90도 앞선 축이므로 회전 뒤 [-sin(theta), cos(theta)]가 된다.", "R(theta)[0,1]^T=[-sin(theta),cos(theta)]^T"),
        step("두 결과를 열로 배치", "행렬은 기저 벡터가 어디로 가는지를 열로 담는다.", "R(theta)=[[cos(theta),-sin(theta)],[sin(theta),cos(theta)]]"),
        step("임의의 점에 선형 결합 적용", "p=[x,y]는 x[1,0]+y[0,1]이므로 회전 결과도 두 회전 기저의 합이다.", "p_rotated=R(theta)p"),
      ],
      handCalculation: {
        problem: "theta=90도, p=[1,0]일 때 회전된 점을 구하라.",
        given: { theta_degree: 90, theta_radian: "pi/2", p: "[1,0]" },
        steps: [
          "90도는 코드에서 pi/2 radian으로 써야 한다.",
          "cos(pi/2)=0, sin(pi/2)=1이다.",
          "R=[[0,-1],[1,0]]이다.",
          "R[1,0]=[0,1]이다.",
        ],
        answer: "[0,1]",
      },
      robotApplication: "로봇이 yaw=90도 돌아서 앞쪽을 볼 때, 로봇 기준 앞 방향 [1,0]은 월드 기준 [0,1]이 된다. 이 생각이 odometry, TF2, 로봇팔 FK의 출발점이다.",
    },
    codeLabs: [rotation2dLab],
    visualizations: [rotation2dVisualization],
    quizzes: rotation2dQuizzes,
    wrongAnswerTags: makeWrongTags("robot_math_2d_rotation_matrix", "2D 회전행렬 degree/radian 및 부호 오류", ["unit_circle_trigonometry", "vector_matrix_basics"]),
    nextSessions: ["robot_math_3d_rotation_so3", "robot_math_homogeneous_transform_se3"],
  }),
  ...robotMathSessionsRest,
];

export const robotMathSessions: Session[] = robotMathCoreSessions.map(enrichRobotMathSession);
