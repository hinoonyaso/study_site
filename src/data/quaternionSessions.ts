import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const quaternionLab = {
  id: "lab_quaternion_rotation_slerp",
  title: "Quaternion Rotation and SLERP",
  language: "python" as const,
  theoryConnection: "q*v*q_conj rotates a 3D vector, SLERP keeps unit norm and constant angular speed",
  starterCode: `import numpy as np

def normalize(q):
    # TODO: return unit quaternion [w,x,y,z]
    raise NotImplementedError

def quat_mul(a, b):
    # TODO: Hamilton product for [w,x,y,z]
    raise NotImplementedError

def quat_conj(q):
    # TODO: conjugate [w,-x,-y,-z]
    raise NotImplementedError

def rotate_vector(q, v):
    # TODO: q * [0,v] * q_conj
    raise NotImplementedError

def slerp(q0, q1, t):
    # TODO: shortest-path spherical interpolation
    raise NotImplementedError

if __name__ == "__main__":
    qz90 = normalize(np.array([np.cos(np.pi/4), 0.0, 0.0, np.sin(np.pi/4)]))
    v = rotate_vector(qz90, np.array([1.0, 0.0, 0.0]))
    mid = slerp(np.array([1.0,0,0,0]), np.array([0.0,0,0,1.0]), 0.5)
    print("rotated:", np.round(v, 3))
    print("mid norm:", round(np.linalg.norm(mid), 6))`,
  solutionCode: `import numpy as np

def normalize(q):
    q = np.asarray(q, dtype=float)
    return q / max(np.linalg.norm(q), 1e-12)

def quat_mul(a, b):
    aw, ax, ay, az = a
    bw, bx, by, bz = b
    return np.array([
        aw*bw - ax*bx - ay*by - az*bz,
        aw*bx + ax*bw + ay*bz - az*by,
        aw*by - ax*bz + ay*bw + az*bx,
        aw*bz + ax*by - ay*bx + az*bw,
    ])

def quat_conj(q):
    return np.array([q[0], -q[1], -q[2], -q[3]])

def rotate_vector(q, v):
    q = normalize(q)
    return quat_mul(quat_mul(q, np.array([0.0, *v])), quat_conj(q))[1:]

def slerp(q0, q1, t):
    q0, q1 = normalize(q0), normalize(q1)
    dot = float(np.dot(q0, q1))
    if dot < 0.0:
        q1, dot = -q1, -dot
    dot = np.clip(dot, -1.0, 1.0)
    if dot > 0.9995:
        return normalize((1 - t) * q0 + t * q1)
    omega = np.arccos(dot)
    return normalize((np.sin((1-t)*omega)*q0 + np.sin(t*omega)*q1) / np.sin(omega))

if __name__ == "__main__":
    qz90 = normalize(np.array([np.cos(np.pi/4), 0.0, 0.0, np.sin(np.pi/4)]))
    v = rotate_vector(qz90, np.array([1.0, 0.0, 0.0]))
    mid = slerp(np.array([1.0,0,0,0]), np.array([0.0,0,0,1.0]), 0.5)
    print("rotated:", np.round(v, 3))
    print("mid norm:", round(np.linalg.norm(mid), 6))`,
  testCode: `import numpy as np
from quaternion_rotation_slerp import normalize, rotate_vector, slerp

def test_z90_rotates_x_to_y():
    q = normalize(np.array([np.cos(np.pi/4), 0.0, 0.0, np.sin(np.pi/4)]))
    assert np.allclose(rotate_vector(q, np.array([1.0,0.0,0.0])), [0.0,1.0,0.0], atol=1e-6)

def test_slerp_unit_norm():
    q = slerp(np.array([1.0,0,0,0]), np.array([0.0,0,0,1.0]), 0.5)
    assert abs(np.linalg.norm(q) - 1.0) < 1e-9

def test_slerp_short_path_sign_flip():
    q = slerp(np.array([1.0,0,0,0]), np.array([-1.0,0,0,0]), 0.5)
    assert np.allclose(q, [1.0,0.0,0.0,0.0])`,
  expectedOutput: "rotated: [0. 1. 0.]\nmid norm: 1.0",
  runCommand: "python quaternion_rotation_slerp.py && pytest test_quaternion_rotation_slerp.py",
  commonBugs: [
    "q=[x,y,z,w] 순서와 [w,x,y,z] 순서를 섞음",
    "SLERP 전에 q1 부호를 뒤집지 않아 긴 경로로 회전함",
    "정규화를 빼먹어 회전 중 scale이 섞임",
  ],
  extensionTask: "Euler pitch=90도 근처 gimbal lock 예제와 quaternion 회전을 비교하라.",
};

export const quaternionSessions: Session[] = [
  makeAdvancedSession({
    id: "quaternion_so3_slerp",
    part: "Part 2. 로봇 수학",
    title: "Quaternion, Rodrigues, SO(3) 회전 표현",
    prerequisites: ["robot_math_3d_rotation_so3", "robot_math_homogeneous_transform_se3"],
    objectives: [
      "Quaternion [w,x,y,z] 정규화와 곱셈을 구현한다.",
      "qvq*로 3D 벡터를 회전한다.",
      "SLERP가 Euler 보간보다 자세 보간에 안전한 이유를 설명한다.",
      "ROS2 TF2와 MoveIt orientation이 quaternion을 쓰는 이유를 연결한다.",
    ],
    definition: "Quaternion은 단위 길이의 4차원 수 [w,x,y,z]로 3D 회전을 표현하는 방법이다. SO(3)의 회전을 singularity 없이 저장하고 보간할 수 있다.",
    whyItMatters: "ROS2 TransformStamped, MoveIt pose target, 드론 attitude controller는 모두 quaternion orientation을 사용한다. Euler angle만 알면 gimbal lock과 보간 오류를 피하기 어렵다.",
    intuition: "축과 각도를 하나의 회전 토큰으로 압축한 것이 quaternion이다. q와 -q는 같은 자세지만 보간 경로가 달라질 수 있어서 sign 처리가 중요하다.",
    equations: [
      { label: "Quaternion norm", expression: "\\|q\\|=\\sqrt{w^2+x^2+y^2+z^2}=1", terms: [["q", "단위 quaternion"]], explanation: "unit norm이 깨지면 순수 회전이 아니다." },
      { label: "Vector rotation", expression: "v' = q \\otimes [0,v] \\otimes q^*", terms: [["q*", "켤레 quaternion"], ["⊗", "Hamilton product"]], explanation: "벡터를 quaternion으로 감싸 회전한다." },
      { label: "SLERP", expression: "\\text{slerp}(q_0,q_1,t)=\\frac{\\sin((1-t)\\Omega)}{\\sin\\Omega}q_0+\\frac{\\sin(t\\Omega)}{\\sin\\Omega}q_1", terms: [["Ω", "두 quaternion 사이 각도"], ["t", "0~1 보간 비율"]], explanation: "구면 위에서 일정한 각속도로 보간한다." },
    ],
    derivation: [
      ["축-각도에서 quaternion", "회전축 u와 각도 theta에서 q=[cos(theta/2), u sin(theta/2)]를 만든다."],
      ["벡터 회전", "v를 [0,v]로 확장하고 q와 q* 사이에 넣어 회전시킨다."],
      ["짧은 경로", "dot(q0,q1)<0이면 q1=-q1로 바꿔 같은 자세의 더 짧은 표현을 선택한다."],
      ["Rodrigues 연결", "axis-angle에서 만든 quaternion은 Rodrigues 회전행렬과 같은 회전을 만든다."],
    ],
    handCalculation: {
      problem: "z축 90도 회전 quaternion으로 x축 벡터 [1,0,0]을 회전하면?",
      given: { q: "[cos45°,0,0,sin45°]", v: "[1,0,0]" },
      steps: ["q=[0.707,0,0,0.707]", "v'=q[0,v]q*를 계산", "결과는 y축 방향"],
      answer: "[0,1,0]",
    },
    robotApplication: "TF2에서 camera_link orientation을 quaternion으로 publish하면 RViz와 MoveIt이 같은 자세를 해석한다. Euler yaw/pitch/roll을 직접 보간하면 pitch 90도 근처에서 경로가 뒤틀릴 수 있다.",
    lab: quaternionLab,
    visualization: {
      id: "vis_quaternion_so3_slerp",
      title: "Quaternion SLERP와 SO(3) 자세 보간",
      equation: "v'=q[0,v]q*, slerp(q0,q1,t)",
      parameters: [
        { name: "t", symbol: "t", min: 0, max: 1, default: 0.5, description: "SLERP 보간 비율" },
        { name: "yaw_deg", symbol: "\\psi", min: -180, max: 180, default: 90, description: "목표 yaw 각도" },
      ],
      normalCase: "unit norm이 유지되고 body axis가 일정한 각속도로 움직인다.",
      failureCase: "q/-q sign 처리를 빼면 긴 회전 경로를 선택한다.",
    },
    quiz: {
      id: "quat_so3",
      conceptQuestion: "Quaternion을 단위 길이로 정규화해야 하는 이유는?",
      conceptAnswer: "unit quaternion만 순수 회전을 나타내며 norm이 깨지면 scale이 섞인다.",
      calculationQuestion: "q=[0.707,0,0,0.707]은 어떤 회전인가?",
      calculationAnswer: "z축 기준 90도 회전이다. w=cos(theta/2), z=sin(theta/2)이므로 theta=90도다.",
      codeQuestion: "quaternion conjugate 한 줄은?",
      codeAnswer: "return np.array([q[0], -q[1], -q[2], -q[3]])",
      debugQuestion: "SLERP가 350도 돌아가는 것처럼 보이면 무엇을 확인하는가?",
      debugAnswer: "dot(q0,q1)<0일 때 q1=-q1로 바꾸는 짧은 경로 처리가 빠졌는지 확인한다.",
      visualQuestion: "SLERP t를 0에서 1로 올리면 body x축은 어떻게 움직이는가?",
      visualAnswer: "시작 자세에서 목표 자세까지 구면 위를 일정한 각속도로 회전한다.",
      robotQuestion: "TF2 TransformStamped의 rotation 필드는 어떤 순서로 채우는가?",
      robotAnswer: "geometry_msgs Quaternion은 x,y,z,w 필드지만 수식 설명에서는 보통 [w,x,y,z]를 쓰므로 순서 변환을 명확히 해야 한다.",
      designQuestion: "MoveIt pose target을 Euler angle로 보간하지 않는 이유는?",
      designAnswer: "Euler angle은 gimbal lock과 불연속이 있어 경로가 튈 수 있고, quaternion SLERP는 unit norm과 짧은 회전 경로를 유지한다.",
    },
    wrongTagLabel: "Quaternion 정규화·순서·SLERP 오류",
    nextSessions: ["ros2_tf2_transform", "pose_graph_slam_basics", "imu_preintegration_basic"],
  }),
];

