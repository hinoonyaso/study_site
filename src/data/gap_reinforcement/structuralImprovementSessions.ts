import type { CodeLab, Session, VisualizationSpec } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

type Param = VisualizationSpec["parameters"][number];

type StructuralTopic = {
  id: string;
  part: string;
  title: string;
  prerequisites: string[];
  objectives: string[];
  definition: string;
  whyItMatters: string;
  intuition: string;
  equations: Array<{
    label: string;
    expression: string;
    terms: Array<[string, string]>;
    explanation: string;
  }>;
  derivation: Array<[string, string, string?]>;
  handCalculation: Session["theory"]["handCalculation"];
  robotApplication: string;
  lab: CodeLab;
  visualization: {
    id: string;
    title: string;
    equation: string;
    parameters: Param[];
    normalCase: string;
    failureCase: string;
  };
  quiz: Parameters<typeof makeAdvancedSession>[0]["quiz"];
  wrongTagLabel: string;
  nextSessions: string[];
};

const param = (
  name: string,
  symbol: string,
  min: number,
  max: number,
  defaultValue: number,
  description: string,
): Param => ({ name, symbol, min, max, default: defaultValue, description });

const structuralTopics: StructuralTopic[] = [
  {
    id: "vector_matrix_inverse_cross_product_basics",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "벡터·행렬·역행렬·외적 입문: 로봇 수학 전에 막히지 않기",
    prerequisites: [],
    objectives: [
      "벡터를 크기와 방향을 가진 데이터 구조로 해석한다.",
      "행렬 곱셈을 좌표 변환과 선형 결합으로 계산한다.",
      "역행렬, determinant, 외적이 로봇 좌표계와 토크 계산에 왜 필요한지 연결한다.",
    ],
    definition:
      "벡터는 방향 있는 양, 행렬은 벡터를 다른 좌표계로 보내는 선형 변환, 역행렬은 그 변환을 되돌리는 연산, 외적은 3D에서 회전축·법선·토크 방향을 만드는 연산이다.",
    whyItMatters:
      "SO(3), Jacobian, torque, covariance를 배우기 전에 이 네 개가 약하면 공식은 외워도 로봇 좌표계가 실제로 어떻게 움직이는지 잡히지 않는다.",
    intuition:
      "행렬은 격자를 밀고 돌리는 손잡이고, 역행렬은 그 손잡이를 반대로 돌리는 방법이다. 외적은 두 방향이 만드는 면에 수직인 방향을 알려준다.",
    equations: [
      {
        label: "Matrix-vector product",
        expression: "y=Ax",
        terms: [["A", "선형 변환 행렬"], ["x", "입력 벡터"], ["y", "변환된 벡터"]],
        explanation: "행렬의 각 열을 입력 벡터 계수로 섞으면 새 벡터가 된다.",
      },
      {
        label: "Inverse consistency",
        expression: "A^{-1}A=I,\\quad \\det(A)\\ne 0",
        terms: [["A^{-1}", "역행렬"], ["I", "항등행렬"]],
        explanation: "determinant가 0이면 격자가 한 줄로 접혀 되돌릴 수 없다.",
      },
      {
        label: "Cross product torque",
        expression: "\\tau=r\\times F",
        terms: [["r", "회전축에서 힘 작용점까지의 벡터"], ["F", "힘 벡터"]],
        explanation: "외적 방향은 회전축, 크기는 lever arm과 힘의 수직 성분이다.",
      },
    ],
    derivation: [
      ["basis view", "A의 열벡터는 e1, e2가 변환된 새 basis다.", "Ae_i=a_i"],
      ["linear mix", "x=(x1,x2)이면 y=x1*a1+x2*a2로 계산된다.", "Ax=\\sum_i x_i a_i"],
      ["inverse condition", "두 열벡터가 같은 직선에 있으면 면적 det(A)가 0이어서 원래 좌표를 복원할 수 없다.", "\\det(A)=0"],
      ["torque direction", "r과 F가 만드는 평면에 수직인 방향이 joint 축 토크 방향이다.", "\\tau=r\\times F"],
    ],
    handCalculation: {
      problem: "A=[[2,0],[0,0.5]], x=[1,4]이면 Ax와 det(A), A^{-1}Ax는?",
      given: { a11: 2, a22: 0.5, x1: 1, x2: 4 },
      steps: ["Ax=[2*1,0.5*4]=[2,2]", "det(A)=2*0.5=1", "A^{-1}=[0.5,0;0,2]이므로 A^{-1}Ax=[1,4]"],
      answer: "변환 결과는 [2,2], det=1, 역변환하면 원래 x=[1,4]로 돌아온다.",
    },
    robotApplication:
      "URDF link frame, camera extrinsic, Jacobian, covariance ellipse, torque r x F가 모두 벡터/행렬/역행렬/외적으로 계산된다.",
    lab: {
      id: "lab_vector_matrix_inverse_cross_product_basics",
      title: "Vector Matrix Inverse and Cross Product Basics",
      language: "python",
      theoryConnection: "y=Ax, A_inv @ A = I, tau = r x F",
      starterCode: `import numpy as np

def matrix_inverse_cross(A, x, r, F):
    # TODO: Ax, inverse consistency error, r x F를 계산하라.
    raise NotImplementedError

if __name__ == "__main__":
    A = np.array([[2.0, 0.0], [0.0, 0.5]])
    x = np.array([1.0, 4.0])
    r = np.array([0.2, 0.0, 0.0])
    F = np.array([0.0, 5.0, 0.0])
    y, inv_error, tau = matrix_inverse_cross(A, x, r, F)
    print("y:", np.round(y, 3), "inv_error:", round(float(inv_error), 6), "tau_z:", round(float(tau[2]), 3))`,
      solutionCode: `import numpy as np

def matrix_inverse_cross(A, x, r, F):
    y = A @ x
    inv_error = np.linalg.norm(np.linalg.inv(A) @ y - x)
    tau = np.cross(r, F)
    return y, inv_error, tau

if __name__ == "__main__":
    A = np.array([[2.0, 0.0], [0.0, 0.5]])
    x = np.array([1.0, 4.0])
    r = np.array([0.2, 0.0, 0.0])
    F = np.array([0.0, 5.0, 0.0])
    y, inv_error, tau = matrix_inverse_cross(A, x, r, F)
    print("y:", np.round(y, 3), "inv_error:", round(float(inv_error), 6), "tau_z:", round(float(tau[2]), 3))`,
      testCode: `from vector_matrix_inverse_cross_product_basics import matrix_inverse_cross
import numpy as np

def test_matrix_vector_product():
    y, _, _ = matrix_inverse_cross(np.eye(2) * 2, np.array([1.0, -1.0]), np.ones(3), np.ones(3))
    assert np.allclose(y, [2.0, -2.0])

def test_inverse_recovers_vector():
    _, inv_error, _ = matrix_inverse_cross(np.array([[2.0, 0.0], [0.0, 0.5]]), np.array([1.0, 4.0]), np.ones(3), np.ones(3))
    assert inv_error < 1e-9

def test_cross_product_torque_direction():
    _, _, tau = matrix_inverse_cross(np.eye(2), np.ones(2), np.array([0.2, 0.0, 0.0]), np.array([0.0, 5.0, 0.0]))
    assert np.allclose(tau, [0.0, 0.0, 1.0])`,
      expectedOutput: "y: [2. 2.] inv_error: 0.0 tau_z: 1.0",
      runCommand: "python vector_matrix_inverse_cross_product_basics.py && pytest test_vector_matrix_inverse_cross_product_basics.py",
      commonBugs: [
        "행렬 곱셈을 element-wise 곱셈 A*x로 착각함",
        "det(A)=0인 singular matrix에 inverse를 적용함",
        "외적 순서를 F x r로 바꾸어 토크 방향이 반대가 됨",
      ],
      extensionTask: "2D 격자 점들을 A로 변환하고 det(A)가 면적 배율과 일치하는지 확인하라.",
    },
    visualization: {
      id: "vis_vector_matrix_grid_cross_product",
      title: "Matrix Transform Grid and Cross-product Direction",
      equation: "y=Ax, tau=r x F",
      parameters: [
        param("scale_x", "s_x", 0.2, 3, 1.4, "x축 basis stretch"),
        param("shear_xy", "k", -1.5, 1.5, 0.4, "x가 y축으로 섞이는 shear"),
        param("force_angle", "theta_F", -180, 180, 90, "힘 벡터 방향"),
      ],
      normalCase: "격자가 뒤집히지 않고 det(A)가 0에서 멀어 역변환과 토크 방향을 안정적으로 해석한다.",
      failureCase: "det(A)가 0에 가까우면 격자가 접히고 inverse/Jacobian 계산이 불안정해진다.",
    },
    quiz: {
      id: "vector_matrix_basics",
      conceptQuestion: "행렬 A를 좌표 변환으로 볼 때 각 열벡터는 무엇을 뜻하는가?",
      conceptAnswer: "각 열벡터는 원래 basis e1, e2가 변환된 새 basis 방향이다.",
      calculationQuestion: "A=[[0,1],[-1,0]], x=[1,0]이면 Ax는?",
      calculationAnswer: "Ax=[0,-1]이므로 시계방향 90도 회전이다.",
      codeQuestion: "NumPy에서 torque r x F를 계산하는 한 줄은?",
      codeAnswer: "tau = np.cross(r, F)",
      debugQuestion: "np.linalg.inv(A)가 LinAlgError를 내면 먼저 무엇을 확인하는가?",
      debugAnswer: "det(A)가 0이거나 condition number가 너무 큰 singular/rank-deficient matrix인지 확인한다.",
      visualQuestion: "격자 시각화에서 det(A)가 0에 가까울수록 어떤 모양이 되는가?",
      visualAnswer: "2D 면적이 한 줄에 가까워져 역변환이 불가능한 상태로 접힌다.",
      robotQuestion: "로봇팔 torque 계산에서 외적 순서를 바꾸면 어떤 문제가 생기는가?",
      robotAnswer: "joint torque 방향이 반대로 계산되어 gravity/feedforward 보상이 오히려 오차를 키운다.",
      designQuestion: "초보자가 SO(3) 전에 반드시 확인해야 하는 선형대수 체크리스트는?",
      designAnswer: "벡터 norm/dot/cross, matrix-vector product, determinant, inverse 조건, frame basis 해석을 손계산과 코드로 확인한다.",
    },
    wrongTagLabel: "벡터/행렬/역행렬/외적 기초 혼동",
    nextSessions: ["rank_nullity_pseudoinverse_ik", "dh_craig_spong_convention_guard"],
  },
  {
    id: "fk_matrix_ik_singularity_visual_lab",
    part: "Part 2. 로봇 수학",
    title: "FK 행렬 곱셈·IK 수렴·Jacobian Singularity 통합 시각화",
    prerequisites: ["vector_matrix_inverse_cross_product_basics", "dh_craig_spong_convention_guard"],
    objectives: [
      "T1, T2, T1T2가 어떻게 누적되어 end-effector pose가 되는지 계산한다.",
      "IK 반복이 target error를 줄이는 과정을 추적한다.",
      "det(J)와 manipulability ellipse로 singularity 근처를 판정한다.",
    ],
    definition:
      "FK는 link별 변환행렬을 순서대로 곱해 tool pose를 얻고, IK는 target error를 줄이는 joint update를 반복하며, Jacobian singularity는 det(J) 또는 manipulability가 0에 가까운 자세다.",
    whyItMatters:
      "학습자가 DH/FK/IK/Jacobian을 각각 외우면 실제 로봇팔에서 pose가 왜 튀는지 모른다. 세 과정을 한 화면에서 봐야 frame convention과 singularity를 디버깅할 수 있다.",
    intuition:
      "FK는 팔을 접는 순서를 누적하는 계산이고, IK는 목표점으로 조금씩 팔을 당기는 과정이다. singularity는 팔이 거의 일직선이 되어 어떤 방향으로는 더 움직일 수 없는 상태다.",
    equations: [
      {
        label: "Planar FK transforms",
        expression: "T_{0,2}=T_{0,1}(q_1)T_{1,2}(q_2)",
        terms: [["T", "동차변환"], ["q", "관절각"]],
        explanation: "각 link frame 변환을 순서대로 곱해야 한다.",
      },
      {
        label: "DLS IK update",
        expression: "\\Delta q=J^T(JJ^T+\\lambda^2 I)^{-1}e",
        terms: [["e", "target error"], ["lambda", "damping"]],
        explanation: "singularity 근처에서 역행렬 대신 damping된 update를 사용한다.",
      },
      {
        label: "Manipulability",
        expression: "w=\\sqrt{\\det(JJ^T)}=|l_1l_2\\sin q_2|",
        terms: [["w", "manipulability"], ["J", "Jacobian"]],
        explanation: "w가 0에 가까우면 velocity ellipse가 선분으로 붕괴한다.",
      },
    ],
    derivation: [
      ["FK step", "첫 link 좌표계 T01을 만들고 두 번째 link T12를 오른쪽에 곱한다.", "T02=T01T12"],
      ["error", "현재 end-effector 위치와 target 위치 차이를 e로 둔다.", "e=x_d-x(q)"],
      ["linearize", "작은 joint 변화에서는 e≈J(q)Δq로 근사한다.", "\\Delta x=J\\Delta q"],
      ["damping", "JJ^T가 singular에 가까우면 lambda^2 I를 더해 update 크기를 제한한다.", "JJ^T+\\lambda^2I"],
    ],
    handCalculation: {
      problem: "l1=1, l2=1, q2=0이면 manipulability w는?",
      given: { l1: 1, l2: 1, q2_deg: 0 },
      steps: ["w=|l1*l2*sin(q2)|", "sin(0)=0", "w=0"],
      answer: "완전 singular 자세다. 팔이 일직선이라 특정 방향 속도를 만들 수 없다.",
    },
    robotApplication:
      "Franka/UR 같은 6DOF 로봇에서도 tool pose가 튀면 먼저 FK frame 순서, IK damping, Jacobian manipulability를 함께 확인한다.",
    lab: {
      id: "lab_fk_matrix_ik_singularity_visual_lab",
      title: "2-link FK Matrix Steps and DLS IK Trace",
      language: "python",
      theoryConnection: "T02=T01@T12, dq=J.T@(J@J.T+lambda^2I)^-1@e, w=sqrt(det(JJ.T))",
      starterCode: `import numpy as np

def fk_jacobian(q, l1=1.0, l2=0.7):
    # TODO: end-effector, Jacobian, manipulability를 반환하라.
    raise NotImplementedError

def dls_step(q, target, damping=0.08):
    # TODO: DLS IK 한 스텝을 구현하라.
    raise NotImplementedError

if __name__ == "__main__":
    q = np.deg2rad([35.0, 50.0])
    ee, J, w = fk_jacobian(q)
    print("ee:", np.round(ee, 3), "w:", round(float(w), 3))`,
      solutionCode: `import numpy as np

def fk_jacobian(q, l1=1.0, l2=0.7):
    q1, q2 = q
    ee = np.array([l1*np.cos(q1)+l2*np.cos(q1+q2), l1*np.sin(q1)+l2*np.sin(q1+q2)])
    J = np.array([
        [-l1*np.sin(q1)-l2*np.sin(q1+q2), -l2*np.sin(q1+q2)],
        [ l1*np.cos(q1)+l2*np.cos(q1+q2),  l2*np.cos(q1+q2)],
    ])
    w = np.sqrt(max(0.0, np.linalg.det(J @ J.T)))
    return ee, J, w

def dls_step(q, target, damping=0.08):
    ee, J, _ = fk_jacobian(q)
    e = target - ee
    dq = J.T @ np.linalg.solve(J @ J.T + damping**2 * np.eye(2), e)
    return q + dq

if __name__ == "__main__":
    q = np.deg2rad([35.0, 50.0])
    ee, J, w = fk_jacobian(q)
    print("ee:", np.round(ee, 3), "w:", round(float(w), 3))`,
      testCode: `from fk_matrix_ik_singularity_visual_lab import fk_jacobian, dls_step
import numpy as np

def test_fk_shape_and_jacobian():
    ee, J, w = fk_jacobian(np.deg2rad([35.0, 50.0]))
    assert ee.shape == (2,) and J.shape == (2, 2) and w > 0

def test_singularity_manipulability_zero():
    _, _, w = fk_jacobian(np.array([0.0, 0.0]))
    assert w < 1e-8

def test_dls_reduces_error():
    q = np.deg2rad([20.0, 20.0])
    target = np.array([1.0, 0.7])
    before = np.linalg.norm(target - fk_jacobian(q)[0])
    after = np.linalg.norm(target - fk_jacobian(dls_step(q, target))[0])
    assert after < before`,
      expectedOutput: "ee: [0.88  1.271] w: 0.536",
      runCommand: "python fk_matrix_ik_singularity_visual_lab.py && pytest test_fk_matrix_ik_singularity_visual_lab.py",
      commonBugs: [
        "T12@T01처럼 transform 곱셈 순서를 뒤집음",
        "q2가 0도 근처인데 pseudo-inverse damping 없이 큰 dq를 적용함",
        "manipulability를 det(J) 부호로만 판단해 elbow-up/down을 혼동함",
      ],
      extensionTask: "q2를 -5도~5도로 sweep하면서 w와 DLS dq norm을 표로 비교하라.",
    },
    visualization: {
      id: "vis_fk_matrix_ik_singularity_steps",
      title: "FK Matrix Steps, IK Trace, and Manipulability Ellipse",
      equation: "w=sqrt(det(JJ^T))",
      parameters: [
        param("q1", "q_1", -180, 180, 35, "첫 번째 관절각"),
        param("q2", "q_2", -180, 180, 55, "두 번째 관절각"),
        param("ik_damping", "lambda", 0.01, 0.3, 0.08, "DLS damping"),
      ],
      normalCase: "T01, T12, T02가 일관되고 IK trace가 target error를 줄이며 ellipse 면적이 충분하다.",
      failureCase: "q2가 0도/180도 근처이면 ellipse가 선분으로 붕괴하고 damping 없이는 IK update가 폭주한다.",
    },
    quiz: {
      id: "fk_ik_singularity_visual",
      conceptQuestion: "FK에서 T01과 T12의 곱셈 순서가 중요한 이유는?",
      conceptAnswer: "동차변환은 교환법칙이 성립하지 않아 frame 순서가 바뀌면 전혀 다른 tool pose가 나온다.",
      calculationQuestion: "l1=1, l2=0.7, q2=90도이면 w=|l1*l2*sin(q2)|는?",
      calculationAnswer: "w=|1*0.7*1|=0.7이다.",
      codeQuestion: "DLS update에서 invert하는 2x2 행렬은?",
      codeAnswer: "J @ J.T + damping**2 * np.eye(2)",
      debugQuestion: "IK가 singularity 근처에서 관절각을 크게 튕기면 무엇을 조정하는가?",
      debugAnswer: "DLS damping lambda를 키우고 manipulability threshold 아래에서는 step size를 제한한다.",
      visualQuestion: "manipulability ellipse가 선분에 가까워질 때 의미는?",
      visualAnswer: "end-effector가 어떤 방향 속도를 만들기 어려운 singularity 근처라는 뜻이다.",
      robotQuestion: "실제 6DOF 로봇팔에서 이 진단은 어디에 쓰이는가?",
      robotAnswer: "MoveIt2 planning, resolved-rate control, Cartesian servo 중 singularity warning과 속도 제한에 쓰인다.",
      designQuestion: "초보자용 FK/IK 시각화에 반드시 보여야 할 세 가지는?",
      designAnswer: "행렬 곱셈 단계, IK 반복 error 감소, det(J)/manipulability ellipse를 함께 보여야 한다.",
    },
    wrongTagLabel: "FK/IK/Jacobian singularity 연결 오류",
    nextSessions: ["geometric_vs_analytic_jacobian", "spatial_rnea_6dof_backward_pass"],
  },
  {
    id: "bicycle_model_stanley_controller",
    part: "Part 4. 자율주행과 SLAM",
    title: "Bicycle Model과 Stanley Lateral Controller",
    prerequisites: ["differential_drive", "pure_pursuit"],
    objectives: [
      "자율주행차의 bicycle model 상태방정식을 계산한다.",
      "Stanley controller의 heading error와 cross-track error 항을 분리한다.",
      "Pure Pursuit, DWA와 Stanley가 가정하는 차량 모델 차이를 설명한다.",
    ],
    definition:
      "Bicycle model은 앞/뒤 바퀴를 각각 하나의 가상 바퀴로 묶어 차량의 x, y, yaw 변화를 나타내는 운동학 모델이고, Stanley controller는 heading error와 cross-track error로 조향각을 정하는 lateral controller다.",
    whyItMatters:
      "Ackermann 차량이나 자율주행차를 differential drive처럼 다루면 lateral error가 커지고 고속에서 경로 추종이 불안정해진다.",
    intuition:
      "Pure Pursuit는 앞의 점을 보고 따라가는 방식이고, Stanley는 차가 경로 옆으로 얼마나 벗어났는지와 얼마나 비뚤어졌는지를 동시에 바로잡는 방식이다.",
    equations: [
      {
        label: "Bicycle kinematics",
        expression: "\\dot x=v\\cos\\psi,\\quad \\dot y=v\\sin\\psi,\\quad \\dot\\psi=\\frac{v}{L}\\tan\\delta",
        terms: [["v", "속도"], ["L", "wheelbase"], ["delta", "조향각"]],
        explanation: "조향각이 yaw rate를 만든다.",
      },
      {
        label: "Stanley steering",
        expression: "\\delta=\\psi_e+\\arctan\\frac{k e_y}{v+\\epsilon}",
        terms: [["psi_e", "heading error"], ["e_y", "cross-track error"], ["k", "cross-track gain"]],
        explanation: "경로 방향 오차와 횡방향 위치 오차를 동시에 보정한다.",
      },
      {
        label: "Steering saturation",
        expression: "\\delta_{cmd}=\\text{clip}(\\delta,-\\delta_{max},\\delta_{max})",
        terms: [["delta_max", "조향 한계"], ["delta_cmd", "제한된 명령"]],
        explanation: "실차 조향각 한계를 넘지 않게 한다.",
      },
    ],
    derivation: [
      ["pose rate", "차량 진행 방향 psi로 속도 v를 x/y 성분으로 분해한다.", "\\dot x=v cos psi"],
      ["yaw rate", "앞바퀴 조향각 delta가 curvature tan(delta)/L을 만든다.", "\\dot psi=v tan(delta)/L"],
      ["error split", "경로 tangent와 차량 heading 차이를 psi_e로 둔다.", "\\psi_e=\\psi_path-\\psi"],
      ["cross-track correction", "속도가 빠를수록 같은 e_y에 작은 추가 조향을 주도록 atan(k e_y/v)를 쓴다.", "\\arctan(k e_y/v)"],
    ],
    handCalculation: {
      problem: "v=5m/s, L=2.5m, delta=10도이면 yaw rate는?",
      given: { v: 5, L: 2.5, delta_deg: 10 },
      steps: ["delta=0.1745 rad", "tan(delta)=0.1763", "yaw_rate=5/2.5*0.1763=0.3526 rad/s"],
      answer: "yaw rate는 약 0.353 rad/s다.",
    },
    robotApplication:
      "Nav2 로컬 플래너가 differential drive용으로 잘 튜닝돼도 Ackermann 플랫폼에는 bicycle/Stanley/MPPI 계열 lateral control을 별도로 검토해야 한다.",
    lab: {
      id: "lab_bicycle_model_stanley_controller",
      title: "Bicycle Model Stanley Controller",
      language: "python",
      theoryConnection: "delta = heading_error + atan2(k * cross_track_error, velocity)",
      starterCode: `import numpy as np

def stanley_delta(heading_error, cross_track_error, velocity, gain=1.2, max_delta=np.deg2rad(30)):
    # TODO: Stanley steering과 saturation을 구현하라.
    raise NotImplementedError

def bicycle_step(state, velocity, delta, wheelbase=2.5, dt=0.05):
    # TODO: x, y, yaw를 한 스텝 적분하라.
    raise NotImplementedError

if __name__ == "__main__":
    delta = stanley_delta(0.05, 0.8, 5.0)
    print("delta_deg:", round(float(np.rad2deg(delta)), 2))`,
      solutionCode: `import numpy as np

def stanley_delta(heading_error, cross_track_error, velocity, gain=1.2, max_delta=np.deg2rad(30)):
    raw = heading_error + np.arctan2(gain * cross_track_error, velocity + 1e-6)
    return float(np.clip(raw, -max_delta, max_delta))

def bicycle_step(state, velocity, delta, wheelbase=2.5, dt=0.05):
    x, y, yaw = state
    x += velocity * np.cos(yaw) * dt
    y += velocity * np.sin(yaw) * dt
    yaw += velocity / wheelbase * np.tan(delta) * dt
    return np.array([x, y, yaw])

if __name__ == "__main__":
    delta = stanley_delta(0.05, 0.8, 5.0)
    print("delta_deg:", round(float(np.rad2deg(delta)), 2))`,
      testCode: `from bicycle_model_stanley_controller import stanley_delta, bicycle_step
import numpy as np

def test_stanley_reacts_to_cross_track_error():
    assert stanley_delta(0.0, 1.0, 5.0) > stanley_delta(0.0, 0.1, 5.0)

def test_steering_saturation():
    assert abs(stanley_delta(1.0, 10.0, 0.1)) <= np.deg2rad(30) + 1e-9

def test_bicycle_yaw_changes_with_delta():
    nxt = bicycle_step(np.array([0.0, 0.0, 0.0]), 3.0, np.deg2rad(10))
    assert nxt[2] > 0`,
      expectedOutput: "delta_deg: 13.74",
      runCommand: "python bicycle_model_stanley_controller.py && pytest test_bicycle_model_stanley_controller.py",
      commonBugs: [
        "degree 단위 delta를 tan에 그대로 넣음",
        "속도가 낮을 때 atan(k*e/v)가 폭주하는 것을 epsilon으로 막지 않음",
        "differential drive yaw rate 식을 Ackermann vehicle에 그대로 적용함",
      ],
      extensionTask: "Pure Pursuit와 Stanley를 같은 S-curve 경로에서 비교하고 cross-track error RMS를 계산하라.",
    },
    visualization: {
      id: "vis_bicycle_stanley_lateral_error",
      title: "Bicycle Model Stanley Lateral Error",
      equation: "delta=psi_e+atan(k e_y/v)",
      parameters: [
        param("cross_track_error", "e_y", -2, 2, 0.8, "경로에서 벗어난 lateral error"),
        param("heading_error", "psi_e", -30, 30, 5, "경로 tangent와 차량 heading 차이"),
        param("vehicle_speed", "v", 0.5, 15, 5, "차량 속도"),
      ],
      normalCase: "heading/cross-track error가 줄어들고 steering saturation을 넘지 않는다.",
      failureCase: "속도와 gain 조합이 나쁘면 조향 포화 또는 lateral oscillation이 생긴다.",
    },
    quiz: {
      id: "bicycle_stanley",
      conceptQuestion: "Differential drive와 bicycle model의 핵심 차이는?",
      conceptAnswer: "Differential drive는 좌우 wheel speed 차이로 yaw rate를 만들고, bicycle model은 앞바퀴 조향각과 wheelbase로 yaw rate를 만든다.",
      calculationQuestion: "v=5, L=2.5, delta=10도이면 yaw rate는?",
      calculationAnswer: "5/2.5*tan(10도)=약 0.353 rad/s다.",
      codeQuestion: "Stanley cross-track 보정 항을 Python으로 쓰면?",
      codeAnswer: "np.arctan2(gain * cross_track_error, velocity + 1e-6)",
      debugQuestion: "고속에서 Stanley가 흔들리면 어떤 값을 먼저 점검하는가?",
      debugAnswer: "gain k, steering saturation, heading error sign, path tangent 계산, velocity scaling을 확인한다.",
      visualQuestion: "속도 v를 높이면 같은 e_y에서 Stanley 보정각은 어떻게 되는가?",
      visualAnswer: "atan(k e_y/v)이 작아져 cross-track 보정각이 줄어든다.",
      robotQuestion: "Ackermann 플랫폼에서 DWA만으로 부족한 상황은?",
      robotAnswer: "고속 lateral tracking이나 조향각/곡률 제한이 중요한 경로 추종에서는 bicycle/Stanley/MPPI 모델이 필요하다.",
      designQuestion: "Stanley controller 튜닝 순서는?",
      designAnswer: "wheelbase/heading sign 검증, 낮은 속도에서 gain k 설정, steering limit 적용, 속도별 RMS cross-track error sweep, saturation 로그 확인 순서다.",
    },
    wrongTagLabel: "Bicycle/Stanley lateral control 모델 혼동",
    nextSessions: ["orca_velocity_obstacle_avoidance", "mpc_soft_constraint_infeasibility"],
  },
  {
    id: "dataset_label_split_confusion_matrix_practice",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "데이터셋 준비·Label 품질·Train/Val/Test Split·Confusion Matrix 실습",
    prerequisites: ["cnn_feature_extractor", "object_detection_iou_nms"],
    objectives: [
      "데이터 leakage 없이 train/val/test split을 만든다.",
      "class imbalance와 label noise가 precision/recall에 미치는 영향을 계산한다.",
      "confusion matrix에서 안전 critical class의 false negative를 찾아낸다.",
    ],
    definition:
      "로봇 비전 데이터셋 품질 관리는 이미지 파일 수가 아니라 label 정확도, split 독립성, class balance, confusion matrix 기반 failure analysis를 관리하는 과정이다.",
    whyItMatters:
      "TensorRT/ONNX 배포보다 앞서 데이터셋 split이 새면 validation accuracy가 가짜로 높아지고 실제 로봇에서 안전 class를 놓친다.",
    intuition:
      "시험 문제를 미리 보고 공부하면 점수가 높게 나오듯, 같은 scene이 train과 test에 섞이면 모델 성능이 실제보다 좋아 보인다.",
    equations: [
      {
        label: "Precision",
        expression: "P=TP/(TP+FP)",
        terms: [["TP", "true positive"], ["FP", "false positive"]],
        explanation: "positive라고 예측한 것 중 실제 positive 비율이다.",
      },
      {
        label: "Recall",
        expression: "R=TP/(TP+FN)",
        terms: [["FN", "false negative"], ["R", "recall"]],
        explanation: "실제 positive 중 놓치지 않은 비율이다.",
      },
      {
        label: "Split leakage",
        expression: "\\text{leakage}=|scene_{train}\\cap scene_{test}|",
        terms: [["scene", "장면/rosbag/source group"], ["leakage", "중복 scene 수"]],
        explanation: "같은 scene 그룹이 train과 test에 동시에 있으면 독립 평가가 아니다.",
      },
    ],
    derivation: [
      ["group split", "이미지 단위가 아니라 rosbag/scene/source group 단위로 나눈다.", "G_train cap G_test=empty"],
      ["label audit", "label noise 표본을 뽑아 class별 오류율을 추정한다.", "noise_i=wrong_i/n_i"],
      ["confusion", "prediction과 label pair를 누적해 confusion matrix를 만든다.", "C[y,p]+=1"],
      ["safety class", "stop/person 같은 class는 FN 비용을 높게 두고 recall threshold를 별도로 둔다.", "R_safety>R_min"],
    ],
    handCalculation: {
      problem: "TP=80, FP=20, FN=10이면 precision과 recall은?",
      given: { TP: 80, FP: 20, FN: 10 },
      steps: ["precision=80/(80+20)=0.8", "recall=80/(80+10)=0.889", "FN이 안전 class이면 recall 개선이 우선"],
      answer: "precision=0.8, recall≈0.889다.",
    },
    robotApplication:
      "ROS2 image inference node를 배포하기 전 rosbag별 split과 confusion matrix를 저장해야 현장 lighting/domain shift에서 어떤 class가 무너지는지 추적할 수 있다.",
    lab: {
      id: "lab_dataset_label_split_confusion_matrix_practice",
      title: "Dataset Split and Confusion Matrix Audit",
      language: "python",
      theoryConnection: "group split prevents leakage, confusion[y_true, y_pred] counts failures",
      starterCode: `import numpy as np

def confusion_matrix(y_true, y_pred, num_classes):
    # TODO: confusion matrix를 직접 누적하라.
    raise NotImplementedError

def precision_recall(C, cls):
    # TODO: class별 precision/recall을 계산하라.
    raise NotImplementedError

if __name__ == "__main__":
    C = confusion_matrix([0, 1, 1, 2], [0, 1, 2, 2], 3)
    print("C:", C.tolist(), "class1:", tuple(round(x, 3) for x in precision_recall(C, 1)))`,
      solutionCode: `import numpy as np

def confusion_matrix(y_true, y_pred, num_classes):
    C = np.zeros((num_classes, num_classes), dtype=int)
    for t, p in zip(y_true, y_pred):
        C[int(t), int(p)] += 1
    return C

def precision_recall(C, cls):
    tp = C[cls, cls]
    fp = C[:, cls].sum() - tp
    fn = C[cls, :].sum() - tp
    precision = tp / max(1, tp + fp)
    recall = tp / max(1, tp + fn)
    return float(precision), float(recall)

if __name__ == "__main__":
    C = confusion_matrix([0, 1, 1, 2], [0, 1, 2, 2], 3)
    print("C:", C.tolist(), "class1:", tuple(round(x, 3) for x in precision_recall(C, 1)))`,
      testCode: `from dataset_label_split_confusion_matrix_practice import confusion_matrix, precision_recall
import numpy as np

def test_confusion_counts():
    C = confusion_matrix([0, 1, 1], [0, 0, 1], 2)
    assert C.tolist() == [[1, 0], [1, 1]]

def test_precision_recall():
    C = np.array([[8, 2], [1, 9]])
    p, r = precision_recall(C, 1)
    assert abs(p - 9/11) < 1e-9 and abs(r - 9/10) < 1e-9

def test_no_divide_by_zero():
    p, r = precision_recall(np.zeros((2, 2), dtype=int), 1)
    assert p == 0 and r == 0`,
      expectedOutput: "C: [[1, 0, 0], [0, 1, 1], [0, 0, 1]] class1: (1.0, 0.5)",
      runCommand: "python dataset_label_split_confusion_matrix_practice.py && pytest test_dataset_label_split_confusion_matrix_practice.py",
      commonBugs: [
        "train/test를 이미지 단위로 랜덤 split해 같은 rosbag scene이 양쪽에 들어감",
        "confusion matrix 행/열 의미를 뒤집어 precision과 recall을 바꿔 계산함",
        "class imbalance를 무시하고 accuracy만 보고 배포함",
      ],
      extensionTask: "안전 class의 false negative cost를 5배로 두고 모델 선택 metric을 다시 계산하라.",
    },
    visualization: {
      id: "vis_dataset_split_confusion_matrix",
      title: "Dataset Split Leakage and Confusion Matrix",
      equation: "P=TP/(TP+FP), R=TP/(TP+FN)",
      parameters: [
        param("label_noise_rate", "eta", 0, 0.3, 0.05, "label 오류율"),
        param("test_scene_overlap", "L", 0, 0.5, 0.0, "train/test scene 중복률"),
        param("minority_class_ratio", "r_min", 0.02, 0.5, 0.12, "소수 class 비율"),
      ],
      normalCase: "scene leakage가 0이고 confusion matrix에서 safety class recall이 목표 이상이다.",
      failureCase: "scene overlap이 있으면 validation score가 가짜로 높고, label noise가 safety FN을 숨긴다.",
    },
    quiz: {
      id: "dataset_metrics",
      conceptQuestion: "로봇 비전에서 이미지 단위 랜덤 split이 위험한 이유는?",
      conceptAnswer: "같은 rosbag/scene의 매우 비슷한 프레임이 train과 test에 동시에 들어가 leakage가 생기기 때문이다.",
      calculationQuestion: "TP=40, FP=10, FN=20이면 recall은?",
      calculationAnswer: "recall=40/(40+20)=0.667이다.",
      codeQuestion: "confusion matrix 누적 한 줄은?",
      codeAnswer: "C[int(y_true), int(y_pred)] += 1",
      debugQuestion: "validation accuracy는 높은데 현장 성능이 낮으면 먼저 무엇을 확인하는가?",
      debugAnswer: "train/val/test split leakage, class imbalance, label noise, domain shift scene coverage를 확인한다.",
      visualQuestion: "test_scene_overlap 슬라이더가 커지면 validation 해석은 어떻게 바뀌는가?",
      visualAnswer: "평가가 독립적이지 않아 score가 실제보다 낙관적으로 보인다.",
      robotQuestion: "stop sign class에서 false negative가 위험한 이유는?",
      robotAnswer: "로봇이 멈춰야 할 상황을 놓쳐 충돌이나 규칙 위반으로 이어질 수 있다.",
      designQuestion: "배포 전 데이터셋 품질 보고서에 반드시 넣을 항목은?",
      designAnswer: "scene group split, class histogram, label audit sample, confusion matrix, safety class recall, latency/accuracy trade-off를 포함한다.",
    },
    wrongTagLabel: "데이터셋 split/label/metric 평가 오류",
    nextSessions: ["tensorrt_real_onnx_inference_calibration", "vlm_vla_lora_finetuning_dataset"],
  },
  {
    id: "ros2_cli_command_diagnostics_lab",
    part: "Part 6. ROS2 실전 연결",
    title: "ROS2 CLI 명령어 진단과 Action Goal Cancel 순서",
    prerequisites: ["ros2_subscriber_publisher_loop", "nav2_behavior_tree_action_server"],
    objectives: [
      "ros2 topic/service/action/param CLI를 상황별로 선택한다.",
      "Action Server goal handle의 accept, feedback, cancel, result 순서를 설명한다.",
      "실제 ROS2 환경이 없을 때도 명령어 contract를 코드랩으로 검증한다.",
    ],
    definition:
      "ROS2 CLI 진단은 topic echo/hz, param get/set, action send_goal/cancel, node info를 조합해 런타임 graph와 goal 상태를 확인하는 절차다.",
    whyItMatters:
      "코드만 읽는 ROS2 학습은 실제 시스템에서 topic 이름, QoS, action cancel 상태가 틀렸을 때 멈춘다. 명령어를 문제 형태로 훈련해야 현장 디버깅이 가능하다.",
    intuition:
      "ROS2 CLI는 로봇 시스템의 계기판이다. topic은 혈류, param은 설정값, action은 장기 작업의 계약서처럼 확인한다.",
    equations: [
      {
        label: "Topic rate budget",
        expression: "f_{meas}=N/\\Delta t",
        terms: [["N", "수신 message 수"], ["Delta t", "측정 시간"]],
        explanation: "ros2 topic hz가 제어/센서 주기 요구사항을 만족하는지 확인한다.",
      },
      {
        label: "Action lifecycle",
        expression: "goal\\rightarrow feedback^*\\rightarrow cancel?\\rightarrow result",
        terms: [["goal", "요청"], ["feedback", "진행 상태"], ["result", "종료 결과"]],
        explanation: "cancel 요청은 goal handle 상태를 먼저 확인한 뒤 result로 정리된다.",
      },
      {
        label: "QoS mismatch",
        expression: "QoS_{pub}\\not\\sim QoS_{sub}\\Rightarrow messages=0",
        terms: [["QoS", "reliability/durability/depth"], ["messages", "수신 메시지"]],
        explanation: "topic 이름이 맞아도 QoS가 맞지 않으면 아무것도 받지 못한다.",
      },
    ],
    derivation: [
      ["graph", "node list와 node info로 publisher/subscriber/action endpoint를 찾는다.", "ros2 node info /node"],
      ["topic", "topic list/type/echo/hz로 데이터가 흐르는지 확인한다.", "ros2 topic hz /scan"],
      ["param", "param get/set으로 런타임 튜닝값이 적용되는지 확인한다.", "ros2 param set /controller kp 3.0"],
      ["action", "send_goal --feedback 후 cancel path와 result status를 확인한다.", "ros2 action send_goal ..."],
    ],
    handCalculation: {
      problem: "2초 동안 100개 메시지를 받으면 topic frequency는?",
      given: { N: 100, dt: 2 },
      steps: ["f=N/dt", "f=100/2=50Hz", "제어 루프 요구가 100Hz면 부족"],
      answer: "50Hz다.",
    },
    robotApplication:
      "Nav2 goal이 멈추거나 ros2_control joint command가 적용되지 않을 때 CLI 진단 순서가 로그보다 빠르게 원인을 좁힌다.",
    lab: {
      id: "lab_ros2_cli_command_diagnostics_lab",
      title: "ROS2 CLI Command Contract Checker",
      language: "python",
      theoryConnection: "diagnostic order = graph -> topic QoS/rate -> params -> action lifecycle",
      starterCode: `def classify_ros2_command(command):
    # TODO: command가 topic/param/action/node 중 무엇을 진단하는지 반환하라.
    raise NotImplementedError

def action_cancel_sequence():
    # TODO: goal cancel 처리 순서를 리스트로 반환하라.
    raise NotImplementedError

if __name__ == "__main__":
    print(classify_ros2_command("ros2 topic hz /joint_states"), action_cancel_sequence())`,
      solutionCode: `def classify_ros2_command(command):
    if " ros2 " in f" {command} ":
        command = command.strip()
    if command.startswith("ros2 topic"):
        return "topic"
    if command.startswith("ros2 param"):
        return "param"
    if command.startswith("ros2 action"):
        return "action"
    if command.startswith("ros2 node"):
        return "node"
    return "unknown"

def action_cancel_sequence():
    return ["receive_cancel_request", "check_goal_handle_state", "stop_or_preempt_work", "publish_cancel_result"]

if __name__ == "__main__":
    print(classify_ros2_command("ros2 topic hz /joint_states"), action_cancel_sequence())`,
      testCode: `from ros2_cli_command_diagnostics_lab import classify_ros2_command, action_cancel_sequence

def test_topic_command():
    assert classify_ros2_command("ros2 topic echo /scan") == "topic"

def test_param_command():
    assert classify_ros2_command("ros2 param set /controller kp 3.0") == "param"

def test_cancel_sequence_contains_goal_state_check():
    seq = action_cancel_sequence()
    assert "check_goal_handle_state" in seq and seq[-1] == "publish_cancel_result"`,
      expectedOutput: "topic ['receive_cancel_request', 'check_goal_handle_state', 'stop_or_preempt_work', 'publish_cancel_result']",
      runCommand: "python ros2_cli_command_diagnostics_lab.py && pytest test_ros2_cli_command_diagnostics_lab.py",
      commonBugs: [
        "topic echo가 안 될 때 node graph나 QoS를 확인하지 않고 코드만 수정함",
        "action cancel 요청을 goal state 확인 없이 즉시 result success로 처리함",
        "ros2 param set 후 실제 node namespace를 잘못 지정함",
      ],
      extensionTask: "Nav2 NavigateToPose action failure를 topic/param/action 명령어 5개 이하로 진단하는 playbook을 작성하라.",
    },
    visualization: {
      id: "vis_ros2_cli_graph_diagnostics",
      title: "ROS2 CLI Graph Diagnostics Flow",
      equation: "graph -> topic hz -> param -> action",
      parameters: [
        param("topic_rate_hz", "f", 1, 200, 50, "측정 topic rate"),
        param("qos_depth", "d", 1, 20, 10, "QoS queue depth"),
        param("action_timeout_s", "T_a", 0.5, 20, 5, "action feedback timeout"),
      ],
      normalCase: "graph endpoint, topic rate, param namespace, action feedback/result가 모두 일관된다.",
      failureCase: "QoS mismatch나 cancel 처리 누락으로 goal이 hanging 상태에 남는다.",
    },
    quiz: {
      id: "ros2_cli_diag",
      conceptQuestion: "ros2 topic echo가 안 될 때 topic 이름 다음으로 확인할 것은?",
      conceptAnswer: "publisher/subscriber node graph와 QoS compatibility를 확인한다.",
      calculationQuestion: "0.5초 동안 25개 메시지를 받으면 topic hz는?",
      calculationAnswer: "25/0.5=50Hz다.",
      codeQuestion: "Action cancel 요청 처리 순서의 핵심 state check 이름은?",
      codeAnswer: "check_goal_handle_state",
      debugQuestion: "ros2 param set이 성공했는데 동작이 안 바뀌면 무엇을 확인하는가?",
      debugAnswer: "node namespace, parameter declaration, lifecycle node 활성 상태, dynamic parameter callback을 확인한다.",
      visualQuestion: "action_timeout_s가 feedback 주기보다 짧으면 어떤 상태가 되는가?",
      visualAnswer: "정상 실행 중이어도 timeout으로 cancel/recovery가 과도하게 발생할 수 있다.",
      robotQuestion: "Nav2 goal cancel에서 result publish를 빠뜨리면 어떤 증상이 생기는가?",
      robotAnswer: "client가 goal 완료 상태를 받지 못해 hanging되거나 다음 goal 전송이 막힌다.",
      designQuestion: "ROS2 실습 없이도 CLI를 평가하려면 어떤 문제를 내야 하는가?",
      designAnswer: "명령어 분류, QoS mismatch 원인 추론, action cancel 순서, topic rate 계산, parameter namespace 디버깅 문제를 낸다.",
    },
    wrongTagLabel: "ROS2 CLI/action lifecycle 진단 오류",
    nextSessions: ["cpp_realtime_control_loop_jitter", "nav2_behavior_tree_action_server"],
  },
  {
    id: "prompt_context_eval_harness_engineering",
    part: "Part 10. 프롬프트/컨텍스트/하네스 엔지니어링",
    title: "프롬프트·컨텍스트·Eval Harness: Physical AI Agent를 검증 가능하게 만들기",
    prerequisites: ["vlm_architecture_to_vla_bridge", "llava_cross_attention_vla_grounding"],
    objectives: [
      "역할, 목표, 제약, 출력 형식을 분리한 프롬프트 템플릿을 설계한다.",
      "chunking/retrieval과 context window 한계를 정량화한다.",
      "golden output, schema validation, regression eval harness로 agent 출력을 검증한다.",
    ],
    definition:
      "프롬프트/컨텍스트/하네스 엔지니어링은 LLM/VLM agent의 입력 계약, 검색 컨텍스트, 출력 schema, 평가 데이터셋, 회귀 테스트를 설계해 hallucination과 unsafe action을 줄이는 시스템 공학이다.",
    whyItMatters:
      "Physical AI agent는 말만 그럴듯하면 위험하다. 로봇 명령을 생성하려면 프롬프트보다 평가 하네스와 안전한 출력 계약이 먼저 있어야 한다.",
    intuition:
      "프롬프트는 작업지시서, 컨텍스트는 참고자료 묶음, eval harness는 채점표다. 셋 중 하나라도 빠지면 같은 모델도 매번 다른 행동을 한다.",
    equations: [
      {
        label: "Context budget",
        expression: "N_{ctx}=N_{system}+N_{retrieved}+N_{history}+N_{output}",
        terms: [["N_ctx", "context token budget"], ["N_retrieved", "검색 문서 token"]],
        explanation: "context window 안에 시스템 지시, 검색 문서, 대화 이력, 출력 예산이 함께 들어가야 한다.",
      },
      {
        label: "Eval pass rate",
        expression: "p_{pass}=\\frac{1}{M}\\sum_i 1[check(y_i,g_i)=true]",
        terms: [["M", "eval case 수"], ["g_i", "golden output 또는 rubric"]],
        explanation: "golden/rubric 기반 통과율을 regression metric으로 저장한다.",
      },
      {
        label: "Grounded answer",
        expression: "answer\\subseteq retrieved\\ evidence",
        terms: [["answer", "모델 출력"], ["retrieved evidence", "검색된 근거"]],
        explanation: "근거 없는 출력을 줄이려면 답변이 검색 근거와 연결되어야 한다.",
      },
    ],
    derivation: [
      ["contract", "role/goal/constraints/output schema를 분리해 모델이 지켜야 할 계약을 만든다.", "prompt=R+G+C+S"],
      ["retrieval", "chunk를 만들고 top-k 검색으로 context에 넣되 token budget을 넘기지 않는다.", "topk <= budget/chunk"],
      ["schema", "JSON/YAML schema validation으로 parse 실패를 먼저 잡는다.", "validate(y,schema)"],
      ["regression", "golden output과 safety rubric으로 모델 변경 전후 pass rate를 비교한다.", "delta p_pass"],
    ],
    handCalculation: {
      problem: "context window 8000 tokens, system 1000, history 1500, output 1000, chunk 500이면 최대 top-k는?",
      given: { ctx: 8000, system: 1000, history: 1500, output: 1000, chunk: 500 },
      steps: ["retrieval budget=8000-1000-1500-1000=4500", "top-k=4500/500=9", "margin을 두면 7~8개 사용"],
      answer: "이론상 9개, 안전 마진을 두면 top-k 7~8개가 적절하다.",
    },
    robotApplication:
      "VLA가 pick/place 코드를 생성하거나 ROS2 action goal을 만들 때 JSON schema, forbidden action, collision check, golden eval을 함께 둬야 실제 로봇으로 넘어갈 수 있다.",
    lab: {
      id: "lab_prompt_context_eval_harness_engineering",
      title: "Prompt Schema and Golden Output Eval Harness",
      language: "python",
      theoryConnection: "pass_rate = mean(schema_ok and rubric_ok and grounded)",
      starterCode: `def schema_ok(output):
    # TODO: action, target, confidence 키와 confidence 범위를 검사하라.
    raise NotImplementedError

def eval_case(output, expected_target):
    # TODO: schema와 golden target을 함께 검사하라.
    raise NotImplementedError

if __name__ == "__main__":
    out = {"action": "pick", "target": "red_cube", "confidence": 0.82}
    print("pass:", eval_case(out, "red_cube"))`,
      solutionCode: `def schema_ok(output):
    required = {"action", "target", "confidence"}
    return (
        isinstance(output, dict)
        and required.issubset(output)
        and output["action"] in {"pick", "place", "stop"}
        and isinstance(output["confidence"], (int, float))
        and 0.0 <= output["confidence"] <= 1.0
    )

def eval_case(output, expected_target):
    return schema_ok(output) and output["target"] == expected_target and output["confidence"] >= 0.7

if __name__ == "__main__":
    out = {"action": "pick", "target": "red_cube", "confidence": 0.82}
    print("pass:", eval_case(out, "red_cube"))`,
      testCode: `from prompt_context_eval_harness_engineering import schema_ok, eval_case

def test_valid_schema():
    assert schema_ok({"action": "pick", "target": "red_cube", "confidence": 0.8})

def test_reject_bad_action():
    assert not schema_ok({"action": "throw", "target": "red_cube", "confidence": 0.8})

def test_eval_requires_golden_target_and_confidence():
    assert eval_case({"action": "pick", "target": "red_cube", "confidence": 0.8}, "red_cube")
    assert not eval_case({"action": "pick", "target": "blue_cube", "confidence": 0.8}, "red_cube")`,
      expectedOutput: "pass: True",
      runCommand: "python prompt_context_eval_harness_engineering.py && pytest test_prompt_context_eval_harness_engineering.py",
      commonBugs: [
        "프롬프트에 출력 schema를 쓰고도 실제 parser/schema validation을 하지 않음",
        "eval set 없이 데모 1~2개만 보고 hallucination이 줄었다고 판단함",
        "retrieved context와 answer grounding을 검사하지 않아 근거 없는 로봇 명령을 허용함",
      ],
      extensionTask: "10개 golden case와 3개 unsafe case를 만들고 pass_rate, schema_fail_rate, unsafe_fail_rate를 리포트하라.",
    },
    visualization: {
      id: "vis_prompt_eval_harness_golden_output",
      title: "Prompt Context and Eval Harness Flow",
      equation: "p_pass=mean(schema_ok && rubric_ok)",
      parameters: [
        param("retrieval_top_k", "k", 1, 10, 4, "검색 chunk 수"),
        param("schema_strictness", "s", 0.1, 1.0, 0.8, "JSON schema 엄격도"),
        param("golden_case_count", "M", 5, 100, 30, "회귀 eval case 수"),
      ],
      normalCase: "schema 통과, grounding 통과, golden output pass rate가 release threshold 이상이다.",
      failureCase: "top-k 과다로 핵심 context가 밀리거나 schema가 느슨해 unsafe action이 통과한다.",
    },
    quiz: {
      id: "prompt_harness",
      conceptQuestion: "프롬프트 템플릿에서 역할/목표/제약/출력형식을 분리하는 이유는?",
      conceptAnswer: "모델이 따라야 할 계약을 명확히 하고, 출력 검증과 회귀 테스트를 가능하게 하기 위해서다.",
      calculationQuestion: "100개 eval 중 92개가 통과하면 pass rate는?",
      calculationAnswer: "92/100=0.92다.",
      codeQuestion: "Python에서 dict가 필수 키를 모두 포함하는지 확인하는 한 줄은?",
      codeAnswer: "required.issubset(output)",
      debugQuestion: "모델이 근거 없는 사실을 답하면 무엇을 추가해야 하는가?",
      debugAnswer: "retrieval evidence와 answer grounding check, citation/rubric 평가, no-evidence fallback을 추가한다.",
      visualQuestion: "schema_strictness를 높이면 어떤 trade-off가 생기는가?",
      visualAnswer: "잘못된 출력은 더 잘 막지만, 일부 유효한 변형도 reject되어 retry/latency가 늘 수 있다.",
      robotQuestion: "VLA action JSON에서 confidence가 낮으면 어떻게 해야 하는가?",
      robotAnswer: "stop/escalate/re-query로 보내고 실제 로봇 action execution은 막아야 한다.",
      designQuestion: "Physical AI agent release gate는 어떻게 설계하는가?",
      designAnswer: "schema pass, grounded answer, unsafe case zero tolerance, golden pass rate, latency budget, rollback plan을 release gate로 둔다.",
    },
    wrongTagLabel: "프롬프트/컨텍스트/eval harness 검증 누락",
    nextSessions: ["vlm_vla_lora_finetuning_dataset", "system_parameter_selection_report"],
  },
];

const structuralSessions = structuralTopics.map((topic) =>
  makeAdvancedSession({
    id: topic.id,
    part: topic.part,
    title: topic.title,
    prerequisites: topic.prerequisites,
    objectives: topic.objectives,
    definition: topic.definition,
    whyItMatters: topic.whyItMatters,
    intuition: topic.intuition,
    equations: topic.equations,
    derivation: topic.derivation,
    handCalculation: topic.handCalculation,
    robotApplication: topic.robotApplication,
    lab: topic.lab,
    visualization: topic.visualization,
    quiz: topic.quiz,
    wrongTagLabel: topic.wrongTagLabel,
    nextSessions: topic.nextSessions,
  }),
);

export const structuralMathFoundationSessions: Session[] = structuralSessions.filter((session) =>
  session.part === "Part 1. Physical AI를 위한 기초수학",
);
export const structuralRobotMathSessions: Session[] = structuralSessions.filter((session) =>
  session.part === "Part 2. 로봇 수학",
);
export const structuralDrivingSessions: Session[] = structuralSessions.filter((session) =>
  session.part === "Part 4. 자율주행과 SLAM",
);
export const structuralVisionSessions: Session[] = structuralSessions.filter((session) =>
  session.part === "Part 5. 인식 AI와 로봇 비전",
);
export const structuralRos2Sessions: Session[] = structuralSessions.filter((session) =>
  session.part === "Part 6. ROS2 실전 연결",
);
export const promptHarnessSessions: Session[] = structuralSessions.filter((session) =>
  session.part === "Part 10. 프롬프트/컨텍스트/하네스 엔지니어링",
);

export const structuralQualityRemediationChecklist = [
  {
    issue: "첫 방문자가 어디서 시작할지 알 수 없음",
    status: "resolved",
    remediation: "온보딩 모달과 목표별 시작 버튼을 추가한다.",
    evidenceFiles: ["src/App.tsx", "src/styles.css"],
    evidenceSessionIds: ["vector_matrix_inverse_cross_product_basics"],
    evidenceVisualizationIds: ["vis_vector_matrix_grid_cross_product"],
  },
  {
    issue: "이전/다음 세션 이동이 단축키에 숨어 있음",
    status: "resolved",
    remediation: "모든 탭 하단에 visible previous/next session navigation을 추가한다.",
    evidenceFiles: ["src/App.tsx", "src/styles.css"],
    evidenceSessionIds: ["fk_matrix_ik_singularity_visual_lab"],
    evidenceVisualizationIds: ["vis_fk_matrix_ik_singularity_steps"],
  },
  {
    issue: "Python/C++ 코드랩 실행 준비가 보이지 않음",
    status: "mitigated",
    remediation: "코드 복사 버튼, 로컬 실행 가이드, requirements.txt, docker-compose lab shell을 제공한다.",
    evidenceFiles: ["src/components/CodeLabBlock.tsx", "requirements.txt", "docker-compose.yml"],
    evidenceSessionIds: ["ros2_cli_command_diagnostics_lab"],
    evidenceVisualizationIds: ["vis_ros2_cli_graph_diagnostics"],
  },
  {
    issue: "560px 미만 모바일에서 우측 패널과 탭 접근성이 낮음",
    status: "resolved",
    remediation: "모바일 bottom tab navigation, 우측 패널 단일 컬럼, 터치 가능한 slider/input 크기를 추가한다.",
    evidenceFiles: ["src/styles.css"],
    evidenceSessionIds: ["dataset_label_split_confusion_matrix_practice"],
    evidenceVisualizationIds: ["vis_dataset_split_confusion_matrix"],
  },
  {
    issue: "Jacobian singularity, FK matrix step, IK convergence가 한 화면에 없음",
    status: "resolved",
    remediation: "Manipulator visualizer에 matrix step, IK trace, manipulability ellipse를 추가하고 전용 세션으로 연결한다.",
    evidenceFiles: ["src/components/visualizers/VisualizerHub.tsx", "src/data/core/sessionAdapter.ts"],
    evidenceSessionIds: ["fk_matrix_ik_singularity_visual_lab"],
    evidenceVisualizationIds: ["vis_fk_matrix_ik_singularity_steps"],
  },
  {
    issue: "프롬프트/컨텍스트/eval harness v2 파트가 없음",
    status: "resolved",
    remediation: "Part 10을 추가해 prompt template, retrieval budget, schema validation, golden eval을 가르친다.",
    evidenceFiles: [
      "src/data/core/curriculumV2.ts",
      "src/data/eval_deployment/promptContextHarnessSessions.ts",
      "src/data/gap_reinforcement/structuralImprovementSessions.ts",
    ],
    evidenceSessionIds: ["prompt_context_eval_harness_engineering"],
    evidenceVisualizationIds: ["vis_prompt_eval_harness_golden_output"],
  },
] as const;
