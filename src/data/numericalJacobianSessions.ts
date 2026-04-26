import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const jacobianLab = {
  id: "lab_numerical_jacobian_2link",
  title: "Numerical Jacobian for 2-link Arm",
  language: "python" as const,
  theoryConnection: "J[:,i] ~= (f(q+h e_i)-f(q-h e_i))/(2h)",
  starterCode: `import numpy as np

def fk(q, l1=1.0, l2=0.7):
    # TODO: 2-link end-effector position
    raise NotImplementedError

def numerical_jacobian(f, q, h=1e-5):
    # TODO: central difference for each joint
    raise NotImplementedError

if __name__ == "__main__":
    J = numerical_jacobian(fk, np.array([0.3, 0.4]))
    print(np.round(J, 3))`,
  solutionCode: `import numpy as np

def fk(q, l1=1.0, l2=0.7):
    q1, q2 = q
    return np.array([l1*np.cos(q1) + l2*np.cos(q1+q2), l1*np.sin(q1) + l2*np.sin(q1+q2)])

def numerical_jacobian(f, q, h=1e-5):
    q = np.asarray(q, dtype=float)
    y0 = f(q)
    J = np.zeros((len(y0), len(q)))
    for i in range(len(q)):
        dq = np.zeros_like(q)
        dq[i] = h
        J[:, i] = (f(q + dq) - f(q - dq)) / (2*h)
    return J

if __name__ == "__main__":
    J = numerical_jacobian(fk, np.array([0.3, 0.4]))
    print(np.round(J, 3))`,
  testCode: `import numpy as np
from numerical_jacobian_2link import fk, numerical_jacobian

def test_shape():
    assert numerical_jacobian(fk, np.array([0.0, 0.0])).shape == (2,2)

def test_q_zero():
    J = numerical_jacobian(fk, np.array([0.0, 0.0]))
    assert abs(J[1,0] - 1.7) < 1e-4
    assert abs(J[1,1] - 0.7) < 1e-4`,
  expectedOutput: "[[-0.746 -0.451]\n [ 1.491  0.535]]",
  runCommand: "python numerical_jacobian_2link.py && pytest test_numerical_jacobian_2link.py",
  commonBugs: ["전진차분만 써서 오차가 커짐", "q 배열을 in-place로 바꾸고 원복하지 않음", "출력 차원과 입력 차원 순서를 바꿔 J shape가 뒤집힘"],
  extensionTask: "analytic Jacobian과 numerical Jacobian 차이를 q grid에서 heatmap으로 그려라.",
};

export const numericalJacobianSessions: Session[] = [
  makeAdvancedSession({
    id: "numerical_jacobian_2link",
    part: "Part 2. 로봇 수학",
    title: "수치 야코비안: 편미분에서 로봇 속도까지",
    prerequisites: ["calculus_derivative_chain_rule", "robot_math_jacobian_velocity_kinematics"],
    objectives: ["중앙차분으로 Jacobian column을 계산한다.", "FK 함수의 출력 변화와 joint 변화율을 연결한다.", "수치 Jacobian과 해석 Jacobian의 trade-off를 설명한다.", "singularity 근처 condition number를 해석한다."],
    definition: "수치 야코비안은 각 입력 변수를 조금씩 바꾸며 출력 변화율을 근사해 Jacobian 행렬을 만드는 방법이다.",
    whyItMatters: "해석 Jacobian을 유도하기 어렵거나 빠르게 검증할 때 수치 Jacobian은 매우 유용하다. 하지만 실시간 제어에서는 계산량과 수치오차 때문에 주의해야 한다.",
    intuition: "관절 하나를 아주 조금 움직였을 때 end-effector가 어느 방향으로 얼마나 움직이는지 하나씩 재보는 방식이다.",
    equations: [
      { label: "Central difference column", expression: "J_{:,i}\\approx\\frac{f(q+h e_i)-f(q-h e_i)}{2h}", terms: [["e_i", "i번째 단위벡터"], ["h", "작은 perturbation"]], explanation: "각 joint별 편미분 column을 만든다." },
      { label: "Velocity kinematics", expression: "\\dot{x}=J(q)\\dot{q}", terms: [["xdot", "end-effector velocity"], ["qdot", "joint velocity"]], explanation: "Jacobian은 joint 속도를 task 속도로 변환한다." },
      { label: "Condition number", expression: "\\kappa(J)=\\sigma_{max}/\\sigma_{min}", terms: [["σ", "singular values"]], explanation: "작은 singular value는 singularity와 수치 불안정을 의미한다." },
    ],
    derivation: [["FK 함수 준비", "q를 넣으면 end-effector position f(q)를 반환한다."], ["joint 하나 perturb", "q+h ei와 q-h ei를 만든다."], ["중앙차분", "두 출력 차이를 2h로 나눈다."], ["column 조립", "모든 joint에 대해 반복해 J를 만든다."]],
    handCalculation: { problem: "q=[0,0], l1=1,l2=0.7에서 ∂y/∂q1은?", given: { q: "[0,0]", l1: 1, l2: 0.7 }, steps: ["y=l1 sin q1 + l2 sin(q1+q2)", "∂y/∂q1=l1 cos q1+l2 cos(q1+q2)", "=1+0.7"], answer: "1.7" },
    robotApplication: "MoveIt plugin 구현에서 analytic Jacobian이 의심되면 numerical Jacobian으로 unit test를 만들어 부호와 frame convention을 검증한다.",
    lab: jacobianLab,
    visualization: { id: "vis_numerical_jacobian_2link", title: "수치 Jacobian column과 말단 속도", equation: "J[:,i]=(f(q+h)-f(q-h))/(2h)", parameters: [{ name: "h", symbol: "h", min: 0.000001, max: 0.01, default: 0.00001, description: "차분 간격" }, { name: "q2_deg", symbol: "q_2", min: -180, max: 180, default: 30, description: "singularity 조절 joint" }], normalCase: "h가 적절하면 analytic Jacobian과 일치한다.", failureCase: "h가 너무 크면 truncation error, 너무 작으면 floating cancellation이 커진다." },
    quiz: {
      id: "num_jac",
      conceptQuestion: "수치 Jacobian이 유용한 경우는?",
      conceptAnswer: "analytic Jacobian 유도가 복잡하거나 구현 검증이 필요할 때 유용하다.",
      calculationQuestion: "f(q+h)-f(q-h)=0.02, h=0.01이면 미분 근사는?",
      calculationAnswer: "0.02/(2*0.01)=1이다.",
      codeQuestion: "중앙차분 column 계산 한 줄은?",
      codeAnswer: "J[:, i] = (f(q + dq) - f(q - dq)) / (2*h)",
      debugQuestion: "J shape가 (n,m)이 아니라 (m,n)으로 나오면?",
      debugAnswer: "출력 차원과 입력 차원 순서를 뒤집어 초기화했는지 확인한다.",
      visualQuestion: "h를 너무 작게 하면 오차가 왜 커지는가?",
      visualAnswer: "부동소수점 cancellation으로 f(q+h)와 f(q-h)의 차이가 정밀도에 묻힌다.",
      robotQuestion: "1kHz 제어에서 수치 Jacobian을 매번 쓰기 어려운 이유는?",
      robotAnswer: "joint 수마다 FK를 2번 호출해야 하므로 계산량과 latency가 커진다.",
      designQuestion: "analytic Jacobian test 전략은?",
      designAnswer: "여러 q sample에서 numerical Jacobian과 analytic Jacobian 차이를 tolerance로 비교한다.",
    },
    wrongTagLabel: "수치 Jacobian 차분/shape 오류",
    nextSessions: ["trajectory_quintic_polynomial", "mpc_1d_receding_horizon"],
  }),
];
